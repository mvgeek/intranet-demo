// Mock data for development and testing

import { ContentItem, User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'HR',
  },
];

export const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Welcome to the New Intranet',
    content:
      'We are excited to announce the launch of our new intranet platform...',
    author: mockUsers[0],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    tags: ['announcement', 'platform'],
    type: 'announcement',
  },
  {
    id: '2',
    title: 'Q1 Company Meeting',
    content: 'Join us for our quarterly company meeting on March 15th...',
    author: mockUsers[1],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    tags: ['meeting', 'quarterly'],
    type: 'event',
  },
];
