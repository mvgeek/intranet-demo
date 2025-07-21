'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MicrophoneButton } from '@/components/ui/microphone-button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AlertCircle, Check, Send, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeechInputProps {
  onTranscriptComplete: (transcript: string) => void;
  onTranscriptChange?: (transcript: string, isInterim: boolean) => void;
  placeholder?: string;
  className?: string;
  autoSend?: boolean;
  showTextInput?: boolean;
}

export const SpeechInput: React.FC<SpeechInputProps> = ({
  onTranscriptComplete,
  onTranscriptChange,
  placeholder = 'Click the microphone to start speaking...',
  className,
  autoSend = false,
  showTextInput = true,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [textInput, setTextInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: false,
    interimResults: true,
  });

  // Handle transcript changes
  useEffect(() => {
    onTranscriptChange?.(transcript + interimTranscript, !!interimTranscript);
  }, [transcript, interimTranscript, onTranscriptChange]);

  // Auto-send when voice input is complete and has content
  useEffect(() => {
    if (!isListening && transcript && autoSend) {
      handleSendTranscript();
    }
  }, [isListening, transcript, autoSend]);

  const handleSendTranscript = () => {
    const finalText = inputMode === 'voice' ? transcript : textInput;
    if (finalText.trim()) {
      onTranscriptComplete(finalText.trim());
      resetTranscript();
      setTextInput('');
    }
  };

  const handleClearTranscript = () => {
    resetTranscript();
    setTextInput('');
    clearError();
  };

  const handleModeToggle = () => {
    const newMode = inputMode === 'text' ? 'voice' : 'text';
    setInputMode(newMode);
    
    if (newMode === 'voice' && textInput) {
      // If switching to voice mode, clear text input
      setTextInput('');
    } else if (newMode === 'text' && (transcript || interimTranscript)) {
      // If switching to text mode, transfer voice content to text input
      setTextInput(transcript + interimTranscript);
      resetTranscript();
    }
  };

  const currentText = inputMode === 'voice' 
    ? transcript + interimTranscript 
    : textInput;

  const hasContent = currentText.trim().length > 0;

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      {/* Mode Toggle and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showTextInput && (
            <Button
              onClick={handleModeToggle}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {inputMode === 'text' ? <Keyboard className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {inputMode === 'text' ? 'Text' : 'Voice'}
            </Button>
          )}
          
          {inputMode === 'voice' && (
            <MicrophoneButton
              isListening={isListening}
              isSupported={isSupported}
              onStartListening={startListening}
              onStopListening={stopListening}
              size="sm"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasContent && (
            <Button
              onClick={handleClearTranscript}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          )}
          
          {!autoSend && hasContent && (
            <Button
              onClick={handleSendTranscript}
              size="sm"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          )}
        </div>
      </div>

      {/* Input Area */}
      {inputMode === 'text' && showTextInput ? (
        <textarea
          ref={textareaRef}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSendTranscript();
            }
          }}
        />
      ) : (
        <div className="min-h-[120px] p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 flex flex-col justify-center">
          {!isSupported ? (
            <div className="text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p>Speech recognition is not supported in this browser.</p>
              <p className="text-sm mt-1">Please use Chrome, Safari, or Edge.</p>
            </div>
          ) : !isListening && !transcript ? (
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">🎤</div>
              <p>{placeholder}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Final transcript */}
              {transcript && (
                <div className="text-gray-900">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{transcript}</span>
                  </div>
                </div>
              )}
              
              {/* Interim transcript */}
              {interimTranscript && (
                <div className="text-gray-500 italic">
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mx-auto mt-1" />
                    </div>
                    <span>{interimTranscript}</span>
                  </div>
                </div>
              )}
              
              {/* Status indicators */}
              {isListening && (
                <div className="text-sm text-blue-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Listening...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium">Speech Recognition Error</p>
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
          <Button
            onClick={clearError}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Confidence Score */}
      {confidence > 0 && (
        <div className="text-xs text-gray-500">
          Confidence: {Math.round(confidence * 100)}%
        </div>
      )}
    </Card>
  );
};