#!/bin/bash

# Build script for development
# This script builds the iOS app for development and testing

set -e  # Exit on any error

# Configuration
PROJECT_NAME="VilniusIntranet"
SCHEME_NAME="VilniusIntranet"
WORKSPACE_PATH="ios/${PROJECT_NAME}.xcodeproj"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
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
    
    print_status "Prerequisites check completed"
}

# Clean build
clean_build() {
    print_header "Cleaning Build"
    
    xcodebuild -project "$WORKSPACE_PATH" \
               -scheme "$SCHEME_NAME" \
               -configuration Debug \
               clean
    
    print_status "Build cleaned successfully"
}

# Build for simulator
build_simulator() {
    print_header "Building for Simulator"
    
    xcodebuild -project "$WORKSPACE_PATH" \
               -scheme "$SCHEME_NAME" \
               -configuration Debug \
               -destination "platform=iOS Simulator,name=iPhone 15,OS=latest" \
               build
    
    if [ $? -eq 0 ]; then
        print_status "Simulator build completed successfully"
    else
        print_error "Simulator build failed"
        exit 1
    fi
}

# Build for device
build_device() {
    print_header "Building for Device"
    
    xcodebuild -project "$WORKSPACE_PATH" \
               -scheme "$SCHEME_NAME" \
               -configuration Debug \
               -destination "generic/platform=iOS" \
               build
    
    if [ $? -eq 0 ]; then
        print_status "Device build completed successfully"
    else
        print_error "Device build failed"
        exit 1
    fi
}

# Run tests
run_tests() {
    print_header "Running Unit Tests"
    
    xcodebuild -project "$WORKSPACE_PATH" \
               -scheme "$SCHEME_NAME" \
               -configuration Debug \
               -destination "platform=iOS Simulator,name=iPhone 15,OS=latest" \
               test
    
    if [ $? -eq 0 ]; then
        print_status "Tests completed successfully"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Main execution
main() {
    print_header "Vilnius Intranet - Development Build Script"
    
    check_prerequisites
    clean_build
    
    # Ask what to build
    echo "What would you like to build?"
    echo "1) Simulator only"
    echo "2) Device only"
    echo "3) Both Simulator and Device"
    echo "4) Run tests only"
    echo "5) Build and run tests"
    
    read -p "Select option (1-5): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            build_simulator
            ;;
        2)
            build_device
            ;;
        3)
            build_simulator
            build_device
            ;;
        4)
            run_tests
            ;;
        5)
            build_simulator
            run_tests
            ;;
        *)
            print_error "Invalid option selected"
            exit 1
            ;;
    esac
    
    print_header "Development Build Process Completed!"
}

# Run main function
main "$@"