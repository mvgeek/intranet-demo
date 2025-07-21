/**
 * Speech Recognition Utility Functions
 * Provides browser compatibility checks and helper functions for speech recognition
 */


export interface BrowserSupport {
  hasSpeechRecognition: boolean;
  hasMediaDevices: boolean;
  hasUserMedia: boolean;
  browser: string;
  isSecureContext: boolean;
}

/**
 * Check browser support for speech recognition and related APIs
 */
export const checkBrowserSupport = (): BrowserSupport => {
  const isClient = typeof window !== 'undefined';
  
  if (!isClient) {
    return {
      hasSpeechRecognition: false,
      hasMediaDevices: false,
      hasUserMedia: false,
      browser: 'unknown',
      isSecureContext: false,
    };
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  return {
    hasSpeechRecognition: !!SpeechRecognition,
    hasMediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    hasUserMedia: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia),
    browser: getBrowserName(),
    isSecureContext: window.isSecureContext ?? window.location.protocol === 'https:',
  };
};

/**
 * Get browser name for compatibility checks
 */
export const getBrowserName = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'safari';
  } else if (userAgent.includes('Firefox')) {
    return 'firefox';
  } else if (userAgent.includes('Edg')) {
    return 'edge';
  } else if (userAgent.includes('Opera')) {
    return 'opera';
  }
  
  return 'unknown';
};

/**
 * Check if the current environment supports speech recognition
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return checkBrowserSupport().hasSpeechRecognition;
};

/**
 * Check if microphone access is available
 */
export const requestMicrophonePermission = async (): Promise<{
  granted: boolean;
  error?: string;
}> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        granted: false,
        error: 'Media devices not supported in this browser',
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop the stream immediately as we only needed to check permission
    stream.getTracks().forEach(track => track.stop());
    
    return { granted: true };
  } catch (error: any) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Microphone access denied by user';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No microphone found';
    } else if (error.name === 'NotSupportedError') {
      errorMessage = 'Microphone access not supported';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Microphone access blocked by security policy';
    }
    
    return {
      granted: false,
      error: errorMessage,
    };
  }
};

/**
 * Get recommended settings for speech recognition based on browser
 */
export const getRecommendedSettings = () => {
  const browser = getBrowserName();
  
  const baseSettings = {
    lang: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
  };

  switch (browser) {
    case 'chrome':
      return {
        ...baseSettings,
        continuous: true, // Chrome handles continuous well
      };
    case 'safari':
      return {
        ...baseSettings,
        continuous: false, // Safari works better with single utterances
      };
    case 'edge':
      return {
        ...baseSettings,
        continuous: true,
      };
    default:
      return baseSettings;
  }
};

/**
 * Format speech recognition error for user display
 */
export const formatSpeechError = (error: string): string => {
  const errorMap: Record<string, string> = {
    'no-speech': 'No speech detected. Please speak clearly and try again.',
    'aborted': 'Speech recognition was stopped.',
    'audio-capture': 'Could not access your microphone. Please check your microphone settings.',
    'network': 'Network error occurred. Please check your internet connection.',
    'not-allowed': 'Microphone access was denied. Please allow microphone access and try again.',
    'service-not-allowed': 'Speech recognition service is not available.',
    'bad-grammar': 'Speech recognition encountered an error processing your speech.',
    'language-not-supported': 'The selected language is not supported.',
  };

  return errorMap[error] || 'An unexpected error occurred during speech recognition.';
};

/**
 * Check if the current context is secure (required for speech recognition)
 */
export const isSecureContext = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.isSecureContext ?? window.location.protocol === 'https:';
};

/**
 * Generate compatibility report for debugging
 */
export const generateCompatibilityReport = (): string => {
  const support = checkBrowserSupport();
  
  const report = [
    `Browser: ${support.browser}`,
    `Speech Recognition: ${support.hasSpeechRecognition ? '✓' : '✗'}`,
    `Media Devices: ${support.hasMediaDevices ? '✓' : '✗'}`,
    `User Media: ${support.hasUserMedia ? '✓' : '✗'}`,
    `Secure Context: ${support.isSecureContext ? '✓' : '✗'}`,
    `User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}`,
  ].join('\n');
  
  return report;
};