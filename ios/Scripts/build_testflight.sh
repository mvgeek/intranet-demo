#!/bin/bash

# Build script for TestFlight distribution
# This script builds the iOS app for TestFlight distribution

set -e  # Exit on any error

# Configuration
PROJECT_NAME="VilniusIntranet"
SCHEME_NAME="VilniusIntranet"
WORKSPACE_PATH="ios/${PROJECT_NAME}.xcodeproj"
ARCHIVE_PATH="build/${PROJECT_NAME}.xcarchive"
EXPORT_PATH="build/TestFlight"
EXPORT_OPTIONS_PLIST="ios/Config/ExportOptions-TestFlight.plist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if Xcode is installed
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed or xcodebuild is not in PATH"
        exit 1
    fi
    
    # Check if project exists
    if [ ! -d "$WORKSPACE_PATH" ]; then
        print_error "Project not found at $WORKSPACE_PATH"
        exit 1
    fi
    
    # Check if export options plist exists
    if [ ! -f "$EXPORT_OPTIONS_PLIST" ]; then
        print_warning "Export options plist not found. Creating default..."
        create_export_options_plist
    fi
    
    print_status "Prerequisites check completed"
}

# Create export options plist
create_export_options_plist() {
    mkdir -p "$(dirname "$EXPORT_OPTIONS_PLIST")"
    
    cat > "$EXPORT_OPTIONS_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <true/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <true/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.vilnius.intranet</key>
        <string>YOUR_PROVISIONING_PROFILE</string>
    </dict>
</dict>
</plist>
EOF
    
    print_status "Created export options plist at $EXPORT_OPTIONS_PLIST"
    print_warning "Please update the teamID and provisioningProfiles in $EXPORT_OPTIONS_PLIST"
}

# Clean build directory
clean_build() {
    print_header "Cleaning Build Directory"
    
    if [ -d "build" ]; then
        rm -rf build
        print_status "Removed existing build directory"
    fi
    
    mkdir -p build
    print_status "Created fresh build directory"
}

# Build and archive
build_archive() {
    print_header "Building Archive"
    
    xcodebuild -project "$WORKSPACE_PATH" \
               -scheme "$SCHEME_NAME" \
               -configuration Release \
               -destination "generic/platform=iOS" \
               -archivePath "$ARCHIVE_PATH" \
               archive \
               DEVELOPMENT_TEAM="YOUR_TEAM_ID" \
               CODE_SIGN_STYLE=Manual \
               PROVISIONING_PROFILE_SPECIFIER="YOUR_PROVISIONING_PROFILE"
    
    if [ $? -eq 0 ]; then
        print_status "Archive created successfully at $ARCHIVE_PATH"
    else
        print_error "Archive failed"
        exit 1
    fi
}

# Export for TestFlight
export_testflight() {
    print_header "Exporting for TestFlight"
    
    xcodebuild -exportArchive \
               -archivePath "$ARCHIVE_PATH" \
               -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
               -exportPath "$EXPORT_PATH"
    
    if [ $? -eq 0 ]; then
        print_status "Export completed successfully"
        print_status "IPA file location: $EXPORT_PATH/$PROJECT_NAME.ipa"
    else
        print_error "Export failed"
        exit 1
    fi
}

# Upload to TestFlight (optional)
upload_testflight() {
    print_header "Uploading to TestFlight"
    
    IPA_PATH="$EXPORT_PATH/$PROJECT_NAME.ipa"
    
    if [ ! -f "$IPA_PATH" ]; then
        print_error "IPA file not found at $IPA_PATH"
        exit 1
    fi
    
    # Upload using altool (deprecated) or xcrun altool
    xcrun altool --upload-app \
                 --type ios \
                 --file "$IPA_PATH" \
                 --username "YOUR_APPLE_ID" \
                 --password "@keychain:APPLICATION_PASSWORD"
    
    if [ $? -eq 0 ]; then
        print_status "Upload to TestFlight completed successfully"
    else
        print_error "Upload to TestFlight failed"
        print_warning "You can manually upload the IPA file using Xcode or Application Loader"
        exit 1
    fi
}

# Main execution
main() {
    print_header "Vilnius Intranet - TestFlight Build Script"
    
    check_prerequisites
    clean_build
    build_archive
    export_testflight
    
    # Ask if user wants to upload to TestFlight
    read -p "Do you want to upload to TestFlight now? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        upload_testflight
    else
        print_status "Build completed. Upload to TestFlight skipped."
        print_status "You can find the IPA file at: $EXPORT_PATH/$PROJECT_NAME.ipa"
    fi
    
    print_header "Build Process Completed Successfully!"
}

# Run main function
main "$@"