'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { SpeechInput } from '@/components/ui/speech-input';
import { ChatMessage } from '@/types';
// Simple date formatting utility
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};
import { User, Bot, Mic, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  onMessageSend?: (message: string, method: 'text' | 'voice') => void;
  onMessageReceived?: (message: ChatMessage) => void;
  initialMessages?: ChatMessage[];
  autoSend?: boolean;
  className?: string;
  title?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onMessageSend,
  onMessageReceived,
  initialMessages = [],
  autoSend = false,
  className,
  title = 'Chat Interface',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [currentMethod, setCurrentMethod] = useState<'text' | 'voice'>('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTranscriptComplete = (transcript: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: transcript,
      timestamp: new Date(),
      isUser: true,
      method: currentMethod,
    };

    setMessages(prev => [...prev, newMessage]);
    onMessageSend?.(transcript, currentMethod);
    onMessageReceived?.(newMessage);

    // Simulate a response (in a real app, this would come from your backend)
    setTimeout(() => {
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I received your ${currentMethod} message: "${transcript}"`,
        timestamp: new Date(),
        isUser: false,
        method: 'text',
      };
      setMessages(prev => [...prev, responseMessage]);
      onMessageReceived?.(responseMessage);
    }, 1000);
  };

  const handleTranscriptChange = (transcript: string, isInterim: boolean) => {
    // You could use this to show typing indicators or live transcription
    // in the chat interface if desired
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div
      className={cn(
        'flex gap-3 max-w-[80%]',
        message.isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0',
          message.isUser ? 'bg-blue-500' : 'bg-gray-500'
        )}
      >
        {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'rounded-lg px-4 py-2 break-words',
          message.isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-relaxed">{message.content}</p>
          {message.method === 'voice' && (
            <Mic className="h-3 w-3 flex-shrink-0 mt-1 opacity-70" />
          )}
        </div>
        
        <div
          className={cn(
            'text-xs mt-1 opacity-70',
            message.isUser ? 'text-blue-100' : 'text-gray-500'
          )}
        >
          {formatTimeAgo(message.timestamp)} 
          {message.method === 'voice' && ' • Voice'}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn('flex flex-col h-[600px] max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a conversation using text or voice input</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <SpeechInput
          onTranscriptComplete={handleTranscriptComplete}
          onTranscriptChange={handleTranscriptChange}
          placeholder="Type your message or click the microphone to speak..."
          autoSend={autoSend}
          showTextInput={true}
        />
      </div>

      {/* Stats */}
      {messages.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
            <span>
              {messages.filter(m => m.method === 'voice').length} voice, {' '}
              {messages.filter(m => m.method === 'text').length} text
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};