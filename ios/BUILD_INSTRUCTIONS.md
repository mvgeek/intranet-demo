# Vilnius Intranet - iOS Build Instructions

## Overview

This document provides comprehensive instructions for building, configuring, and deploying the Vilnius Intranet iOS application. The iOS app serves as a WebView wrapper for the Next.js web application, enabling native iOS distribution through the App Store and TestFlight.

## Project Structure

```
ios/
├── VilniusIntranet.xcodeproj/          # Xcode project file
├── VilniusIntranet/                    # Main app source code
│   ├── AppDelegate.swift               # App lifecycle management
│   ├── SceneDelegate.swift             # Scene lifecycle management
│   ├── ViewController.swift            # Main WebView controller
│   ├── Info.plist                      # App configuration
│   ├── VilniusIntranet.entitlements    # App capabilities
│   ├── Assets.xcassets/                # App icons and assets
│   └── Base.lproj/                     # Storyboards and localizable resources
├── Config/                             # Build configuration files
│   ├── Development.xcconfig            # Development build settings
│   ├── Release.xcconfig                # Release build settings
│   ├── TestFlight.xcconfig             # TestFlight build settings
│   ├── ExportOptions-TestFlight.plist  # Export configuration
│   └── CodeSigning.md                  # Code signing guide
└── Scripts/                            # Build automation scripts
    ├── build_dev.sh                    # Development build script
    ├── build_testflight.sh             # TestFlight build script
    ├── increment_build.sh              # Build number automation
    └── version_manager.sh              # Version management
```

## Prerequisites

### Development Environment
- **macOS**: 12.0 or later
- **Xcode**: 15.0 or later
- **iOS Deployment Target**: 15.0 or later
- **Swift**: 5.0 or later

### Apple Developer Account
- Active Apple Developer Program membership
- Valid iOS Developer Certificate
- iOS Distribution Certificate (for App Store/TestFlight)
- Registered App ID: `com.vilnius.intranet`
- Development Provisioning Profile
- Distribution Provisioning Profile

### Web Application
- Next.js application running and accessible
- Local development server at `http://localhost:3000`
- Production server URL configured

## Initial Setup

### 1. Xcode Configuration

1. Open `ios/VilniusIntranet.xcodeproj` in Xcode
2. Select the project in the navigator
3. Go to **Signing & Capabilities** tab
4. Configure signing for each target:

#### Development Configuration
- **Team**: Select your development team
- **Bundle Identifier**: `com.vilnius.intranet.dev`
- **Signing**: Automatic
- **Provisioning Profile**: Xcode Managed Profile

#### Release Configuration
- **Team**: Select your development team
- **Bundle Identifier**: `com.vilnius.intranet`
- **Signing**: Manual
- **Provisioning Profile**: Your distribution profile

### 2. Update Configuration Files

#### Update Team ID
Replace `YOUR_DEVELOPMENT_TEAM_ID` in the following files:
- `ios/Config/Development.xcconfig`
- `ios/Config/Release.xcconfig`
- `ios/Config/TestFlight.xcconfig`
- `ios/Config/ExportOptions-TestFlight.plist`

#### Update Provisioning Profiles
Replace `YOUR_DISTRIBUTION_PROVISIONING_PROFILE` with your actual profile names in:
- `ios/Config/Release.xcconfig`
- `ios/Config/TestFlight.xcconfig`
- `ios/Config/ExportOptions-TestFlight.plist`

#### Update Web Application URLs
In `ios/VilniusIntranet/ViewController.swift`, update:
```swift
private let webAppURL = "http://localhost:3000" // Local development
private let productionURL = "https://your-production-url.com" // Production
```

### 3. App Icon Setup

1. Design app icons for all required sizes:
   - 1024×1024 (App Store)
   - 180×180, 120×120 (iPhone)
   - 167×167, 152×152 (iPad)
   - Various spotlight and settings icons

2. Add icons to `ios/VilniusIntranet/Assets.xcassets/AppIcon.appiconset/`

3. Update `Contents.json` with proper icon references

## Building the Application

### Development Builds

#### Using Xcode
1. Open project in Xcode
2. Select **VilniusIntranet** scheme
3. Choose target device/simulator
4. Press **Cmd+B** to build or **Cmd+R** to run

#### Using Build Script
```bash
cd /path/to/project
chmod +x ios/Scripts/build_dev.sh
./ios/Scripts/build_dev.sh
```

Options available:
1. Simulator only
2. Device only  
3. Both Simulator and Device
4. Run tests only
5. Build and run tests

### TestFlight Builds

#### Prerequisites
- Valid Distribution Certificate
- App Store Distribution Provisioning Profile
- Updated configuration files

#### Using Build Script
```bash
cd /path/to/project
chmod +x ios/Scripts/build_testflight.sh
./ios/Scripts/build_testflight.sh
```

This script will:
1. Clean build directory
2. Create archive
3. Export IPA file
4. Optionally upload to TestFlight

#### Manual TestFlight Build
1. Open project in Xcode
2. Select **Generic iOS Device**
3. Product → Archive
4. In Organizer, select **Distribute App**
5. Choose **App Store Connect**
6. Upload to TestFlight

### Production Builds

Production builds use the same process as TestFlight builds but with additional verification:

1. Verify all URLs point to production servers
2. Ensure proper code signing configuration
3. Test on multiple devices before submission
4. Submit through App Store Connect for review

## Version Management

### Automatic Version Updates
Use the version manager script:
```bash
# Increment patch version (1.0.0 → 1.0.1)
./ios/Scripts/version_manager.sh patch

# Increment minor version (1.0.1 → 1.1.0)
./ios/Scripts/version_manager.sh minor

# Increment major version (1.1.0 → 2.0.0)
./ios/Scripts/version_manager.sh major

# Set specific build number
./ios/Scripts/version_manager.sh patch 42
```

### Manual Version Updates
Edit `ios/VilniusIntranet/Info.plist`:
- **CFBundleShortVersionString**: Marketing version (1.0.0)
- **CFBundleVersion**: Build number (1)

### Build Number Automation
The `increment_build.sh` script can be added as a build phase to automatically increment build numbers.

## Testing

### Simulator Testing
1. Build for simulator using development configuration
2. Test WebView functionality
3. Verify navigation and UI elements
4. Test offline behavior
5. Verify app lifecycle events

### Device Testing  
1. Install development profile on device
2. Build and deploy to device
3. Test on cellular and Wi-Fi networks
4. Verify performance and memory usage
5. Test background/foreground transitions

### TestFlight Testing
1. Upload build to TestFlight
2. Add internal testers
3. Collect feedback and crash reports
4. Monitor analytics and performance

## Troubleshooting

### Common Build Issues

#### Code Signing Errors
- Verify certificates are installed and valid
- Check provisioning profile matches bundle ID
- Ensure team ID is correct in configuration files

#### WebView Loading Issues
- Verify web application is accessible
- Check URL configuration in ViewController.swift
- Ensure App Transport Security settings allow HTTP (development)

#### Archive/Export Failures
- Clean build folder and retry
- Verify export options plist is correctly configured
- Check for missing or expired certificates

### Debugging Steps

1. **Check Build Logs**: View detailed error messages in Xcode
2. **Verify Certificates**: Use Keychain Access to inspect certificates
3. **Test Provisioning**: Verify profiles in Xcode Preferences
4. **Network Debugging**: Use Charles Proxy or similar tools
5. **Device Console**: Monitor device logs for runtime issues

## Performance Optimization

### WebView Optimization
- Enable WKWebView caching
- Implement progressive loading
- Optimize JavaScript execution
- Handle memory warnings properly

### App Size Optimization
- Use app thinning
- Remove unused assets
- Optimize image resources
- Enable bitcode for App Store builds

### Battery Life
- Implement proper background handling
- Minimize network requests when backgrounded
- Use efficient timer management
- Handle device orientation changes

## Security Considerations

### Network Security
- Use HTTPS for production
- Implement certificate pinning if required
- Validate server certificates
- Handle network errors gracefully

### Data Protection
- Enable data protection entitlements
- Handle sensitive data appropriately
- Implement proper keychain usage if needed
- Consider privacy implications of WebView

## Deployment Checklist

### Pre-Submission
- [ ] All certificates and profiles are valid
- [ ] App tested on multiple devices and iOS versions
- [ ] Performance testing completed
- [ ] Security review conducted
- [ ] Privacy policy and terms updated
- [ ] App Store metadata prepared

### TestFlight Submission
- [ ] Build uploaded successfully
- [ ] Beta testing information complete
- [ ] Test notes provided
- [ ] Internal testers added
- [ ] External testing configured (if needed)

### App Store Submission
- [ ] Final build tested thoroughly
- [ ] App Store screenshots prepared
- [ ] App description and metadata complete
- [ ] Age rating configured
- [ ] Pricing and availability set
- [ ] Review notes provided

## Support and Maintenance

### Monitoring
- Set up crash reporting (TestFlight provides basic crash logs)
- Monitor app performance metrics
- Track user feedback and reviews
- Monitor web application dependencies

### Updates
- Plan regular update schedule
- Monitor iOS version compatibility
- Update dependencies as needed
- Maintain code signing certificates

### Emergency Response
- Have rollback plan for critical issues
- Monitor crash rates after releases
- Prepare hotfix deployment process
- Maintain communication channels with users

## Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)
- [WKWebView Documentation](https://developer.apple.com/documentation/webkit/wkwebview)

## Contact Information

For technical issues or questions regarding this build configuration:
- Review the troubleshooting section above
- Check Xcode build logs for detailed error messages
- Consult Apple Developer Forums for iOS-specific issues
- Verify web application functionality independently