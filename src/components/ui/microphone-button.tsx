'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MicrophoneButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isListening,
  isSupported,
  onStartListening,
  onStopListening,
  disabled = false,
  size = 'default',
  variant = 'default',
  className,
}) => {
  const handleClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const getIcon = () => {
    if (!isSupported) {
      return <MicOff className="h-4 w-4" />;
    }
    
    if (isListening) {
      return <Square className="h-4 w-4" />;
    }
    
    return <Mic className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (!isSupported) {
      return 'outline';
    }
    
    if (isListening) {
      return 'destructive';
    }
    
    return variant;
  };

  const getAriaLabel = () => {
    if (!isSupported) {
      return 'Speech recognition not supported';
    }
    
    if (isListening) {
      return 'Stop voice input';
    }
    
    return 'Start voice input';
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !isSupported}
      size={size}
      variant={getButtonVariant()}
      className={cn(
        'transition-all duration-200',
        isListening && 'animate-pulse',
        !isSupported && 'cursor-not-allowed opacity-50',
        className
      )}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {getIcon()}
      {size !== 'icon' && (
        <span className="ml-2">
          {!isSupported ? 'Not Available' : isListening ? 'Stop' : 'Voice'}
        </span>
      )}
    </Button>
  );
};