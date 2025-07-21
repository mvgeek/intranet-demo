// Application constants

export const APP_NAME = 'Intranet Content Discovery MVP';
export const APP_DESCRIPTION =
  'Streamlined intranet platform for discovering recent company communications';

export const CONTENT_TYPES = {
  ANNOUNCEMENT: 'announcement',
  NEWS: 'news',
  POLICY: 'policy',
  EVENT: 'event',
} as const;

export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
} as const;

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  CONTENT: '/content',
} as const;
