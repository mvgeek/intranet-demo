'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SpeechRecognitionState,
  SpeechRecognitionConfig,
  SpeechRecognitionError,
} from '@/types';


const defaultConfig: SpeechRecognitionConfig = {
  lang: 'en-US',
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
};

export const useSpeechRecognition = (config: Partial<SpeechRecognitionConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const recognitionRef = useRef<any>(null);
  
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    confidence: 0,
  });

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(prev => ({
      ...prev,
      isSupported: !!SpeechRecognition,
    }));
  }, []);

  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const error: SpeechRecognitionError = {
        error: 'not-allowed',
        message: 'Speech recognition is not supported in this browser',
      };
      setState(prev => ({ ...prev, error }));
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = finalConfig.lang;
    recognition.continuous = finalConfig.continuous;
    recognition.interimResults = finalConfig.interimResults;
    recognition.maxAlternatives = finalConfig.maxAlternatives;

    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
        transcript: '',
        interimTranscript: '',
      }));
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          confidence = result[0].confidence;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
        confidence,
      }));
    };

    recognition.onerror = (event: any) => {
      const error: SpeechRecognitionError = {
        error: event.error,
        message: getErrorMessage(event.error),
      };
      
      setState(prev => ({
        ...prev,
        error,
        isListening: false,
      }));
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false,
        interimTranscript: '',
      }));
    };

    return recognition;
  }, [finalConfig]);

  const startListening = useCallback(() => {
    if (!state.isSupported) {
      const error: SpeechRecognitionError = {
        error: 'not-allowed',
        message: 'Speech recognition is not supported in this browser',
      };
      setState(prev => ({ ...prev, error }));
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    recognitionRef.current = initializeRecognition();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        const speechError: SpeechRecognitionError = {
          error: 'aborted',
          message: 'Failed to start speech recognition',
        };
        setState(prev => ({ ...prev, error: speechError }));
      }
    }
  }, [state.isSupported, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null,
      confidence: 0,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  };
};

const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'no-speech':
      return 'No speech was detected. Please try again.';
    case 'aborted':
      return 'Speech recognition was aborted.';
    case 'audio-capture':
      return 'Audio capture failed. Please check your microphone.';
    case 'network':
      return 'Network error occurred during speech recognition.';
    case 'not-allowed':
      return 'Speech recognition permission was denied. Please allow microphone access.';
    case 'service-not-allowed':
      return 'Speech recognition service is not allowed.';
    case 'bad-grammar':
      return 'Speech recognition grammar error.';
    case 'language-not-supported':
      return 'The specified language is not supported.';
    default:
      return 'An unknown error occurred during speech recognition.';
  }
};