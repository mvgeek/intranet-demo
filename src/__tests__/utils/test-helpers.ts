import { NextRequest } from 'next/server';

/**
 * Creates a mock NextRequest for testing API routes
 */
export function createMockRequest(url: string, options: RequestInit = {}): NextRequest {
  const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
  return new NextRequest(fullUrl, options);
}

/**
 * Helper to extract JSON from Response
 */
export async function getResponseJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse response as JSON: ${text}`);
  }
}

/**
 * Validates the structure of a paginated API response
 */
export function validatePaginatedResponse(response: any) {
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('meta');
  expect(response).toHaveProperty('success', true);
  
  expect(response.meta).toHaveProperty('page');
  expect(response.meta).toHaveProperty('limit');
  expect(response.meta).toHaveProperty('total');
  expect(response.meta).toHaveProperty('totalPages');
  expect(response.meta).toHaveProperty('hasNext');
  expect(response.meta).toHaveProperty('hasPrev');
  
  expect(typeof response.meta.page).toBe('number');
  expect(typeof response.meta.limit).toBe('number');
  expect(typeof response.meta.total).toBe('number');
  expect(typeof response.meta.totalPages).toBe('number');
  expect(typeof response.meta.hasNext).toBe('boolean');
  expect(typeof response.meta.hasPrev).toBe('boolean');
  
  expect(Array.isArray(response.data)).toBe(true);
}

/**
 * Validates the structure of a basic API response
 */
export function validateApiResponse(response: any) {
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('success', true);
}

/**
 * Validates the structure of an error response
 */
export function validateErrorResponse(response: any) {
  expect(response).toHaveProperty('success', false);
  expect(response).toHaveProperty('error');
  expect(response.error).toHaveProperty('message');
  expect(response.error).toHaveProperty('code');
  expect(typeof response.error.message).toBe('string');
  expect(typeof response.error.code).toBe('string');
}

/**
 * Validates user object structure
 */
export function validateUser(user: any) {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(typeof user.id).toBe('string');
  expect(typeof user.name).toBe('string');
  expect(typeof user.email).toBe('string');
  
  if (user.department) {
    expect(typeof user.department).toBe('string');
  }
  
  if (user.avatar) {
    expect(typeof user.avatar).toBe('string');
  }
}

/**
 * Validates content item structure
 */
export function validateContentItem(item: any) {
  expect(item).toHaveProperty('id');
  expect(item).toHaveProperty('title');
  expect(item).toHaveProperty('content');
  expect(item).toHaveProperty('author');
  expect(item).toHaveProperty('createdAt');
  expect(item).toHaveProperty('updatedAt');
  expect(item).toHaveProperty('tags');
  expect(item).toHaveProperty('type');
  
  expect(typeof item.id).toBe('string');
  expect(typeof item.title).toBe('string');
  expect(typeof item.content).toBe('string');
  expect(typeof item.type).toBe('string');
  expect(Array.isArray(item.tags)).toBe(true);
  
  validateUser(item.author);
  
  // Validate dates
  expect(new Date(item.createdAt)).toBeInstanceOf(Date);
  expect(new Date(item.updatedAt)).toBeInstanceOf(Date);
  
  // Validate content type
  expect(['announcement', 'news', 'policy', 'event']).toContain(item.type);
}

/**
 * Validates search result structure
 */
export function validateSearchResult(result: any) {
  expect(result).toHaveProperty('item');
  expect(result).toHaveProperty('score');
  expect(typeof result.score).toBe('number');
  
  validateContentItem(result.item);
  
  if (result.highlights) {
    expect(typeof result.highlights).toBe('object');
    
    if (result.highlights.title) {
      expect(Array.isArray(result.highlights.title)).toBe(true);
    }
    
    if (result.highlights.content) {
      expect(Array.isArray(result.highlights.content)).toBe(true);
    }
    
    if (result.highlights.tags) {
      expect(Array.isArray(result.highlights.tags)).toBe(true);
    }
  }
}

/**
 * Validates department info structure
 */
export function validateDepartmentInfo(dept: any) {
  expect(dept).toHaveProperty('name');
  expect(dept).toHaveProperty('userCount');
  expect(dept).toHaveProperty('contentCount');
  
  expect(typeof dept.name).toBe('string');
  expect(typeof dept.userCount).toBe('number');
  expect(typeof dept.contentCount).toBe('number');
  
  expect(dept.userCount).toBeGreaterThanOrEqual(0);
  expect(dept.contentCount).toBeGreaterThanOrEqual(0);
}

/**
 * Validates tag info structure
 */
export function validateTagInfo(tag: any) {
  expect(tag).toHaveProperty('name');
  expect(tag).toHaveProperty('count');
  
  expect(typeof tag.name).toBe('string');
  expect(typeof tag.count).toBe('number');
  expect(tag.count).toBeGreaterThan(0);
  
  if (tag.category) {
    expect(['general', 'department', 'event', 'policy']).toContain(tag.category);
  }
}
