'use client';

import React, { useState } from 'react';
import { ChatInterface, SpeechInput, MicrophoneButton } from '@/components';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { checkBrowserSupport, generateCompatibilityReport } from '@/lib/speech-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, MessageSquare, Mic, Info } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showCompatibilityReport, setShowCompatibilityReport] = useState(false);
  const browserSupport = checkBrowserSupport();

  const handleMessageSend = (message: string, method: 'text' | 'voice') => {
    console.log(`Message sent via ${method}:`, message);
  };

  const CompatibilityCard = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Info className="h-5 w-5" />
        Browser Compatibility
      </h3>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span>Speech Recognition</span>
          {browserSupport.hasSpeechRecognition ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span>Media Devices</span>
          {browserSupport.hasMediaDevices ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span>Secure Context</span>
          {browserSupport.isSecureContext ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      <Button
        onClick={() => setShowCompatibilityReport(!showCompatibilityReport)}
        variant="outline"
        size="sm"
      >
        {showCompatibilityReport ? 'Hide' : 'Show'} Technical Details
      </Button>

      {showCompatibilityReport && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
          {generateCompatibilityReport()}
        </pre>
      )}
    </Card>
  );

  const QuickTestCard = () => {
    const {
      isListening,
      isSupported,
      transcript,
      interimTranscript,
      error,
      startListening,
      stopListening,
      resetTranscript,
    } = useSpeechRecognition();

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Quick Speech Test
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <MicrophoneButton
              isListening={isListening}
              isSupported={isSupported}
              onStartListening={startListening}
              onStopListening={stopListening}
            />
            
            <Button
              onClick={resetTranscript}
              variant="outline"
              size="sm"
              disabled={!transcript && !interimTranscript}
            >
              Clear
            </Button>
          </div>

          <div className="min-h-[100px] p-4 border rounded-md bg-gray-50">
            {transcript && (
              <p className="text-gray-900 mb-2">
                <strong>Final:</strong> {transcript}
              </p>
            )}
            {interimTranscript && (
              <p className="text-gray-500 italic">
                <strong>Interim:</strong> {interimTranscript}
              </p>
            )}
            {!transcript && !interimTranscript && !isListening && (
              <p className="text-gray-400">Click the microphone to start speaking...</p>
            )}
            {isListening && !transcript && !interimTranscript && (
              <p className="text-blue-600">Listening...</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
              <strong>Error:</strong> {error.message}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Speech-to-Text Integration Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience live speech recognition with Apple&apos;s Web Speech API. 
            Toggle between text and voice input, see interim transcription, and test compatibility.
          </p>
        </div>

        {/* Compatibility Alert */}
        {!browserSupport.hasSpeechRecognition && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800">Limited Speech Support</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Speech recognition is not fully supported in your current browser. 
                  For the best experience, try Chrome, Safari, or Edge.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Demo
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Input Component
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Quick Test
            </TabsTrigger>
            <TabsTrigger value="compatibility" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Compatibility
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-2">Interactive Chat Interface</h2>
              <p className="text-gray-600">
                Full chat experience with speech-to-text integration. Messages show whether they were sent via voice or text.
              </p>
            </div>
            <ChatInterface
              onMessageSend={handleMessageSend}
              title="Speech-Enabled Chat"
              autoSend={false}
            />
          </TabsContent>

          <TabsContent value="input" className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-2">Speech Input Component</h2>
              <p className="text-gray-600">
                Standalone input component with voice/text toggle and live transcription display.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <SpeechInput
                onTranscriptComplete={(transcript) => {
                  console.log('Transcript completed:', transcript);
                  alert(`You said: "${transcript}"`);
                }}
                onTranscriptChange={(transcript, isInterim) => {
                  console.log('Transcript change:', { transcript, isInterim });
                }}
                placeholder="Try speaking or typing your message..."
                autoSend={false}
                showTextInput={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-2">Quick Speech Test</h2>
              <p className="text-gray-600">
                Simple test interface to verify speech recognition functionality.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <QuickTestCard />
            </div>
          </TabsContent>

          <TabsContent value="compatibility" className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-2">Browser Compatibility</h2>
              <p className="text-gray-600">
                Check your browser&apos;s support for speech recognition and related APIs.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <CompatibilityCard />
            </div>
          </TabsContent>
        </Tabs>

        {/* Features List */}
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-semibold mb-4">Implementation Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✓ Implemented</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Web Speech API integration</li>
                <li>• Live speech recognition with interim results</li>
                <li>• Voice/Text input toggle</li>
                <li>• Real-time transcription display</li>
                <li>• Error handling and user feedback</li>
                <li>• Browser compatibility checks</li>
                <li>• Microphone permission handling</li>
                <li>• Chat interface with speech integration</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">📋 Technical Details</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• TypeScript with proper type definitions</li>
                <li>• React hooks for state management</li>
                <li>• Responsive UI with Tailwind CSS</li>
                <li>• Component-based architecture</li>
                <li>• Error boundaries and fallbacks</li>
                <li>• Accessibility features</li>
                <li>• Cross-browser compatibility</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
