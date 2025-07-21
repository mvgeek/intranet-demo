#!/bin/bash

# Script to increment build number automatically
# This should be run as a build phase in Xcode

# Get the current build number
BUILD_NUMBER=$(defaults read "${TARGET_BUILD_DIR}/${INFOPLIST_PATH%.*}" CFBundleVersion 2>/dev/null || echo "0")

# Increment the build number
NEW_BUILD_NUMBER=$((BUILD_NUMBER + 1))

# Update the build number in Info.plist
defaults write "${TARGET_BUILD_DIR}/${INFOPLIST_PATH%.*}" CFBundleVersion -string "${NEW_BUILD_NUMBER}"

# Also update the build number in the project's Info.plist for next time
if [ -f "${SRCROOT}/${PRODUCT_NAME}/Info.plist" ]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${NEW_BUILD_NUMBER}" "${SRCROOT}/${PRODUCT_NAME}/Info.plist"
fi

echo "Build number incremented to: ${NEW_BUILD_NUMBER}"