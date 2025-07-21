#!/bin/bash

# Version Manager Script for Vilnius Intranet iOS App
# Usage: ./version_manager.sh [major|minor|patch] [build_number]
# Example: ./version_manager.sh minor 42

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}/../VilniusIntranet"
INFO_PLIST="${PROJECT_DIR}/Info.plist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get current version from Info.plist
get_current_version() {
    if [ -f "$INFO_PLIST" ]; then
        /usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$INFO_PLIST" 2>/dev/null || echo "1.0.0"
    else
        echo "1.0.0"
    fi
}

# Function to get current build number from Info.plist
get_current_build() {
    if [ -f "$INFO_PLIST" ]; then
        /usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null || echo "1"
    else
        echo "1"
    fi
}

# Function to increment version
increment_version() {
    local version=$1
    local increment_type=$2
    
    IFS='.' read -r -a version_parts <<< "$version"
    local major=${version_parts[0]:-0}
    local minor=${version_parts[1]:-0}
    local patch=${version_parts[2]:-0}
    
    case $increment_type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            print_error "Invalid increment type: $increment_type"
            print_error "Valid options: major, minor, patch"
            exit 1
            ;;
    esac
    
    echo "${major}.${minor}.${patch}"
}

# Function to update version in Info.plist
update_version() {
    local new_version=$1
    local new_build=$2
    
    if [ ! -f "$INFO_PLIST" ]; then
        print_error "Info.plist not found at $INFO_PLIST"
        exit 1
    fi
    
    # Update version
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $new_version" "$INFO_PLIST"
    
    # Update build number
    if [ -n "$new_build" ]; then
        /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $new_build" "$INFO_PLIST"
    fi
    
    print_status "Updated version to: $new_version"
    if [ -n "$new_build" ]; then
        print_status "Updated build number to: $new_build"
    fi
}

# Main script logic
main() {
    print_status "Vilnius Intranet Version Manager"
    print_status "================================"
    
    local current_version=$(get_current_version)
    local current_build=$(get_current_build)
    
    print_status "Current version: $current_version"
    print_status "Current build: $current_build"
    
    if [ $# -eq 0 ]; then
        print_warning "No arguments provided. Current version information displayed above."
        print_status "Usage: $0 [major|minor|patch] [build_number]"
        print_status "Example: $0 minor 42"
        exit 0
    fi
    
    local increment_type=$1
    local new_build=${2:-$current_build}
    
    local new_version=$(increment_version "$current_version" "$increment_type")
    
    print_status "New version will be: $new_version"
    print_status "New build will be: $new_build"
    
    # Confirm with user
    read -p "Continue with version update? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        update_version "$new_version" "$new_build"
        print_status "Version update completed successfully!"
    else
        print_warning "Version update cancelled."
        exit 0
    fi
}

# Run main function with all arguments
main "$@"