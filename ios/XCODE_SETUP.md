# Xcode Setup Guide for Vilnius Intranet

## Quick Start Guide

### 1. Open the Project
```bash
cd /path/to/vilnius-intranet-demo/vilnius
open ios/VilniusIntranet.xcodeproj
```

### 2. Initial Configuration

#### Project Settings
1. Select **VilniusIntranet** project in navigator
2. Select **VilniusIntranet** target
3. Go to **General** tab:
   - **Display Name**: Vilnius Intranet
   - **Bundle Identifier**: com.vilnius.intranet (or your preferred identifier)
   - **Version**: 1.0.0
   - **Build**: 1
   - **Deployment Target**: 15.0

#### Signing & Capabilities
1. Switch to **Signing & Capabilities** tab
2. **Development Configuration**:
   - Team: Select your Apple Developer Team
   - Bundle Identifier: com.vilnius.intranet.dev (for development)
   - Signing Certificate: iPhone Developer
   - Provisioning Profile: Xcode Managed Profile

3. **Release Configuration**:
   - Switch to Release configuration (dropdown next to target name)
   - Team: Select your Apple Developer Team
   - Bundle Identifier: com.vilnius.intranet
   - Signing Certificate: iPhone Distribution
   - Provisioning Profile: Manual (select your distribution profile)

### 3. Build and Run

#### For Simulator
1. Select iPhone simulator from device menu
2. Press **Cmd+R** to build and run
3. App should launch and display the web application

#### For Physical Device
1. Connect iOS device via USB
2. Trust the computer on your device
3. Select your device from device menu
4. Press **Cmd+R** to build and run
5. On first run, go to **Settings > General > Device Management** on device
6. Trust your developer certificate

## Detailed Setup Instructions

### Scheme Configuration

#### Development Scheme
1. Go to **Product > Scheme > Edit Scheme**
2. Select **Run** in sidebar
3. **Info** tab:
   - Build Configuration: Debug
   - Executable: VilniusIntranet.app
4. **Arguments** tab (optional):
   - Add environment variables if needed
   - Add launch arguments if needed
5. **Options** tab:
   - Check "Allow Location Simulation" if using location services

#### Release/TestFlight Scheme
1. Duplicate the existing scheme: **Product > Scheme > Manage Schemes > Duplicate**
2. Rename to "VilniusIntranet-Release"
3. Edit the duplicated scheme:
   - **Run**: Build Configuration → Release
   - **Test**: Build Configuration → Release
   - **Profile**: Build Configuration → Release
   - **Analyze**: Build Configuration → Release
   - **Archive**: Build Configuration → Release

### Build Settings Customization

#### Using Configuration Files
The project includes pre-configured .xcconfig files:
- `Development.xcconfig` - Debug builds
- `TestFlight.xcconfig` - TestFlight builds
- `Release.xcconfig` - App Store builds

To apply these:
1. Select project in navigator
2. Go to **Info** tab
3. Under **Configurations**, set:
   - **Debug**: Development.xcconfig
   - **Release**: TestFlight.xcconfig (or Release.xcconfig for App Store)

#### Manual Build Settings
If not using .xcconfig files, configure these key settings:

**Code Signing**:
- Code Signing Identity (Debug): iPhone Developer
- Code Signing Identity (Release): iPhone Distribution
- Development Team: [Your Team ID]
- Provisioning Profile: [Your Profiles]

**Swift Compiler**:
- Swift Language Version: Swift 5
- Optimization Level (Debug): No Optimization
- Optimization Level (Release): Optimize for Speed

**Apple Clang**:
- Optimization Level (Debug): None
- Optimization Level (Release): Smallest [-Os]

### WebView Configuration

The main WebView configuration is in `ViewController.swift`. Key settings:

```swift
// Local development URL (change as needed)
private let webAppURL = "http://localhost:3000"

// Production URL (update with your production domain)
private let productionURL = "https://your-production-url.com"
```

### App Transport Security

For development, the app allows HTTP connections to localhost. For production, ensure your web application uses HTTPS.

Current settings in `Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

### Build Phases

#### Automatic Build Number Increment (Optional)
1. Select target → **Build Phases** tab
2. Click **+** → **New Run Script Phase**
3. Add script:
```bash
if [ "${CONFIGURATION}" = "Release" ]; then
    ${SRCROOT}/ios/Scripts/increment_build.sh
fi
```

#### Web App Asset Bundling (Optional)
If you want to bundle the web app:
1. Add **New Run Script Phase**
2. Script:
```bash
# Build web app and copy to iOS bundle
cd ${SRCROOT}
npm run build
cp -r .next/static ${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/static
```

### Debugging and Development

#### Simulator Debugging
- Use **Debug → Attach to Process** for runtime debugging
- Web Inspector: Connect Safari to inspect WebView content
- Console output visible in Xcode debug area

#### Device Debugging
- Enable **Settings > Safari > Advanced > Web Inspector** on device
- Connect to Mac and use Safari's **Develop** menu
- View console logs in Xcode

#### Common Development Tasks

**Clean Build**:
- **Product > Clean Build Folder** (Cmd+Shift+K)

**Reset Simulator**:
- **Device > Erase All Content and Settings**

**View Build Logs**:
- **View > Navigators > Reports** (Cmd+9)

### Testing Configuration

#### Unit Tests (if added)
1. **File > New > Target > iOS Unit Testing Bundle**
2. Configure test target with same settings as main target
3. Add test files and run with **Product > Test** (Cmd+U)

#### UI Tests (if added)
1. **File > New > Target > iOS UI Testing Bundle**
2. Record UI tests using **Debug > Start Recording UI Test**
3. Run tests with test navigator or **Product > Test**

### Archive and Distribution

#### Creating Archives
1. Select **Generic iOS Device** or physical device
2. **Product > Archive** (Cmd+Shift+B)
3. Archives appear in **Window > Organizer**

#### Distribution Options
From Organizer:
1. **App Store Connect** - For TestFlight and App Store
2. **Ad Hoc** - For limited device distribution
3. **Enterprise** - For enterprise distribution
4. **Development** - For development team distribution

### Troubleshooting Common Issues

#### Build Errors

**"No matching provisioning profile found"**:
- Verify bundle identifier matches provisioning profile
- Check team settings in project
- Refresh provisioning profiles in Xcode Preferences

**"Code signing identity not found"**:
- Install required certificates in Keychain
- Check certificate validity
- Verify team membership

**"WebView not loading"**:
- Check URL configuration
- Verify web server is running
- Check App Transport Security settings
- Inspect device/simulator network connectivity

#### Runtime Issues

**App crashes on launch**:
- Check device logs in **Window > Devices and Simulators**
- Verify all required frameworks are linked
- Check for missing assets or configurations

**WebView content not displaying**:
- Verify web application is accessible from device
- Check JavaScript console for errors
- Ensure web app is mobile-responsive

### Performance Optimization

#### Build Time
- Use **Build Settings > Build Options > Debug Information Format**: DWARF (Debug)
- Enable **Build Settings > Swift Compiler > Compilation Mode**: Incremental (Debug)

#### Runtime Performance
- Monitor memory usage in Xcode Instruments
- Optimize WebView content loading
- Handle background/foreground transitions properly

### Advanced Configuration

#### Custom Build Configurations
1. **Project > Info > Configurations**
2. Duplicate existing configurations
3. Customize settings per configuration
4. Update schemes to use new configurations

#### Conditional Compilation
Use build flags for different environments:
```swift
#if DEBUG
    // Debug-only code
#elseif TESTFLIGHT
    // TestFlight-specific code
#else
    // Production code
#endif
```

#### Custom Info.plist Settings
Add environment-specific settings:
```xml
<key>ServerURL</key>
<string>$(SERVER_URL)</string>
```

Then set `SERVER_URL` in build settings for each configuration.

This setup guide should get you up and running with the Vilnius Intranet iOS project. For additional help, refer to the main BUILD_INSTRUCTIONS.md file or Apple's official documentation.