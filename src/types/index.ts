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
}
