# Chat POC iOS App

## Overview
Native iOS application demonstrating speech-to-text functionality in a chat interface.

## Features
- Native UIKit-based chat interface
- Speech Framework integration for voice input
- Single view controller architecture
- TestFlight-ready configuration

## Requirements
- iOS 15.0+
- Xcode 15.0+
- Speech recognition and microphone permissions

## Project Structure
```
ios/
├── ChatPOC/                          # Main app source files
│   ├── AppDelegate.swift             # App lifecycle management
│   ├── SceneDelegate.swift           # Scene lifecycle and window management
│   ├── ViewController.swift          # Main chat view controller
│   ├── Info.plist                    # App configuration and permissions
│   ├── Assets.xcassets/              # App icons and colors
│   └── Base.lproj/
│       └── LaunchScreen.storyboard   # Launch screen
├── ChatPOC.xcodeproj/                # Xcode project configuration
│   ├── project.pbxproj               # Project build settings
│   └── project.xcworkspace/          # Workspace configuration
└── README.md                         # This file
```

## Setup Instructions
1. Open `ChatPOC.xcodeproj` in Xcode
2. Select your development team in project settings
3. Build and run on device or simulator
4. Grant microphone and speech recognition permissions when prompted

## Speech Integration
The app includes Speech Framework integration with:
- Microphone usage permission
- Speech recognition permission
- Audio engine setup for real-time speech processing
- UI feedback for speech recognition state

## Build Configuration
- Deployment target: iOS 15.0
- Swift 5.0
- Supports iPhone and iPad
- TestFlight ready (ITSAppUsesNonExemptEncryption = false)

## Permissions Required
- `NSMicrophoneUsageDescription`: For audio input during speech recognition
- `NSSpeechRecognitionUsageDescription`: For converting speech to text

## Next Steps
- Implement complete speech recognition flow in `startSpeechRecognition()` and `stopSpeechRecognition()` methods
- Add chat message persistence
- Integrate with backend chat service
- Add push notifications for new messages
- Implement user authentication