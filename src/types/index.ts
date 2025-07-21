// Global type definitions for the Intranet Content Discovery MVP

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  type: 'announcement' | 'news' | 'policy' | 'event';
}

export interface SearchFilters {
  type?: ContentItem['type'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  author?: string;
  department?: string;
  query?: string;
}

// API Response Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Search Types
export interface SearchQuery {
  q?: string;
  type?: ContentItem['type'];
  tags?: string[];
  author?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  item: ContentItem;
  score: number;
  highlights?: {
    title?: string[];
    content?: string[];
    tags?: string[];
  };
}

export interface SearchResponse extends PaginatedResponse<SearchResult> {
  query: SearchQuery;
  executionTime: number;
}

// User API Types
export interface UserQuery {
  department?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'department';
  sortOrder?: 'asc' | 'desc';
}

// Content API Types
export interface ContentQuery {
  type?: ContentItem['type'];
  author?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
}

// Department and Tag Types
export type Department =
  | 'Engineering'
  | 'HR'
  | 'Marketing'
  | 'Finance'
  | 'Operations'
  | 'Design'
  | 'Legal'
  | 'Sales'
  | 'Customer Success';

export interface DepartmentInfo {
  name: Department;
  userCount: number;
  contentCount: number;
}

export interface TagInfo {
  name: string;
  count: number;
  category?: 'general' | 'department' | 'event' | 'policy';
}

// Speech Recognition Types
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionError {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

export interface SpeechRecognitionConfig {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: SpeechRecognitionError | null;
  confidence: number;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  method: 'text' | 'voice';
}
