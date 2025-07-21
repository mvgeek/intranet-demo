# Code Signing Configuration Guide

## Overview
This document outlines the code signing configuration for the Vilnius Intranet iOS app across different environments.

## Prerequisites
1. Apple Developer Account with appropriate permissions
2. Xcode with latest iOS SDK
3. Valid certificates and provisioning profiles

## Configuration Files

### Development.xcconfig
- **Purpose**: Local development and debugging
- **Code Sign Identity**: iPhone Developer
- **Code Sign Style**: Automatic
- **Bundle ID**: com.vilnius.intranet.dev

### Release.xcconfig
- **Purpose**: App Store distribution
- **Code Sign Identity**: iPhone Distribution
- **Code Sign Style**: Manual
- **Bundle ID**: com.vilnius.intranet

### TestFlight.xcconfig
- **Purpose**: TestFlight beta distribution
- **Code Sign Identity**: iPhone Distribution  
- **Code Sign Style**: Manual
- **Bundle ID**: com.vilnius.intranet

## Setup Instructions

### 1. Development Team Setup
Replace `YOUR_DEVELOPMENT_TEAM_ID` in all .xcconfig files with your actual Apple Developer Team ID:
```
DEVELOPMENT_TEAM = ABCD123456
```

### 2. Provisioning Profiles
Replace `YOUR_DISTRIBUTION_PROVISIONING_PROFILE` with your actual provisioning profile names:

**For TestFlight/Release:**
```
PROVISIONING_PROFILE_SPECIFIER = Vilnius Intranet Distribution
```

### 3. Bundle Identifier Registration
Ensure the following bundle identifiers are registered in your Apple Developer account:
- `com.vilnius.intranet` (Production)
- `com.vilnius.intranet.dev` (Development)

### 4. Certificate Requirements

#### Development
- iOS Developer Certificate
- Development Provisioning Profile

#### Distribution
- iOS Distribution Certificate
- App Store Distribution Provisioning Profile

## Common Issues and Solutions

### Issue: "No matching provisioning profile found"
**Solution**: 
1. Verify the bundle identifier matches your provisioning profile
2. Ensure the provisioning profile is installed in Xcode
3. Check that the certificate is valid and not expired

### Issue: "Code signing identity not found"
**Solution**:
1. Install the required certificate in Keychain
2. Verify the certificate is trusted
3. Restart Xcode if necessary

### Issue: Automatic signing failures
**Solution**:
1. Switch to manual signing for distribution builds
2. Ensure you have the correct team membership level
3. Verify all devices are registered for development profiles

## Verification Steps

### Before Building:
1. Open Xcode project
2. Select target → Signing & Capabilities
3. Verify correct team is selected
4. Verify provisioning profile is valid
5. Check certificate expiration dates

### Before Distribution:
1. Clean build folder (Shift+Cmd+K)
2. Archive the project (Cmd+Shift+B)
3. Verify no signing errors in build log
4. Test on physical device before uploading

## Environment Variables
You can override settings using environment variables:

```bash
export DEVELOPMENT_TEAM="YOUR_TEAM_ID"
export PROVISIONING_PROFILE="Your Profile Name"
```

## Troubleshooting Commands

### List available certificates:
```bash
security find-identity -v -p codesigning
```

### List installed provisioning profiles:
```bash
ls ~/Library/MobileDevice/Provisioning\ Profiles/
```

### Verify code signing:
```bash
codesign --verify --verbose /path/to/your/app
```