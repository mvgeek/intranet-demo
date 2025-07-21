import { GET } from '@/app/api/content/search/route';
import { mockContent } from '@/data';
import {
  createMockRequest,
  getResponseJson,
  validatePaginatedResponse,
  validateErrorResponse,
  validateSearchResult,
} from '../utils/test-helpers';

describe('/api/content/search', () => {
  describe('GET', () => {
    it('should return all content when no search query provided', async () => {
      const request = createMockRequest('/api/content/search');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      expect(data.data.length).toBeLessThanOrEqual(10); // default limit
      expect(data.meta.total).toBe(mockContent.length);
      expect(data).toHaveProperty('query');
      expect(data).toHaveProperty('executionTime');
      expect(typeof data.executionTime).toBe('number');
      
      data.data.forEach(validateSearchResult);
    });

    it('should search content by query text', async () => {
      const request = createMockRequest('/api/content/search?q=meeting');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      expect(data.query.q).toBe('meeting');
      
      data.data.forEach((result: any) => {
        expect(result.score).toBeGreaterThan(0);
        validateSearchResult(result);
        
        // Verify the content actually contains the search term
        const item = result.item;
        const searchTerm = 'meeting';
        const hasMatch = 
          item.title.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm)) ||
          item.author.name.toLowerCase().includes(searchTerm);
        
        expect(hasMatch).toBe(true);
      });
    });

    it('should provide highlights for search results', async () => {
      const request = createMockRequest('/api/content/search?q=intranet');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((result: any) => {
        validateSearchResult(result);
        
        if (result.highlights) {
          // If highlights exist, they should contain the search term
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
      });
    });

    it('should score title matches higher than content matches', async () => {
      const request = createMockRequest('/api/content/search?q=meeting&sortBy=relevance&sortOrder=desc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      // Find results with title matches and content-only matches
      const titleMatches = data.data.filter((result: any) => 
        result.item.title.toLowerCase().includes('meeting')
      );
      const contentOnlyMatches = data.data.filter((result: any) => 
        !result.item.title.toLowerCase().includes('meeting') &&
        result.item.content.toLowerCase().includes('meeting')
      );
      
      if (titleMatches.length > 0 && contentOnlyMatches.length > 0) {
        expect(titleMatches[0].score).toBeGreaterThan(contentOnlyMatches[0].score);
      }
    });

    it('should sort by relevance by default', async () => {
      const request = createMockRequest('/api/content/search?q=company');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      // Results should be sorted by score descending
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].score).toBeGreaterThanOrEqual(data.data[i].score);
      }
    });

    it('should filter search results by content type', async () => {
      const request = createMockRequest('/api/content/search?q=meeting&type=event');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((result: any) => {
        expect(result.item.type).toBe('event');
        validateSearchResult(result);
      });
    });

    it('should filter search results by author', async () => {
      const request = createMockRequest('/api/content/search?q=company&author=Jane');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((result: any) => {
        expect(
          result.item.author.name.toLowerCase().includes('jane') ||
          result.item.author.email.toLowerCase().includes('jane')
        ).toBe(true);
        validateSearchResult(result);
      });
    });

    it('should filter search results by department', async () => {
      const request = createMockRequest('/api/content/search?q=announcement&department=Engineering');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((result: any) => {
        expect(result.item.author.department?.toLowerCase()).toBe('engineering');
        validateSearchResult(result);
      });
    });

    it('should filter search results by tags', async () => {
      const request = createMockRequest('/api/content/search?q=company&tags=announcement,platform');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((result: any) => {
        expect(
          result.item.tags.some((tag: string) => 
            tag.toLowerCase().includes('announcement') ||
            tag.toLowerCase().includes('platform')
          )
        ).toBe(true);
        validateSearchResult(result);
      });
    });

    it('should filter search results by date range', async () => {
      const request = createMockRequest('/api/content/search?q=company&dateFrom=2024-01-20&dateTo=2024-02-01');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      const fromDate = new Date('2024-01-20');
      const toDate = new Date('2024-02-01');
      
      data.data.forEach((result: any) => {
        const itemDate = new Date(result.item.createdAt);
        expect(itemDate >= fromDate && itemDate <= toDate).toBe(true);
        validateSearchResult(result);
      });
    });

    it('should sort search results by createdAt', async () => {
      const request = createMockRequest('/api/content/search?q=company&sortBy=createdAt&sortOrder=desc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        const date1 = new Date(data.data[i-1].item.createdAt);
        const date2 = new Date(data.data[i].item.createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });

    it('should sort search results by title', async () => {
      const request = createMockRequest('/api/content/search?q=company&sortBy=title&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].item.title.localeCompare(data.data[i].item.title)).toBeLessThanOrEqual(0);
      }
    });

    it('should handle pagination for search results', async () => {
      const request = createMockRequest('/api/content/search?q=company&page=1&limit=2');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      expect(data.data.length).toBeLessThanOrEqual(2);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(2);
    });

    it('should return empty results for non-matching search', async () => {
      const request = createMockRequest('/api/content/search?q=nonexistentterm12345');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      expect(data.data.length).toBe(0);
      expect(data.meta.total).toBe(0);
    });

    it('should return error for invalid page number', async () => {
      const request = createMockRequest('/api/content/search?page=0');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      validateErrorResponse(data);
      expect(data.error.code).toBe('INVALID_PAGE');
    });

    it('should return error for invalid limit', async () => {
      const request = createMockRequest('/api/content/search?limit=101');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      validateErrorResponse(data);
      expect(data.error.code).toBe('INVALID_LIMIT');
    });

    it('should include query parameters in response', async () => {
      const request = createMockRequest('/api/content/search?q=test&type=announcement&author=John&department=Engineering&tags=platform&dateFrom=2024-01-01&dateTo=2024-12-31&page=1&limit=5&sortBy=relevance&sortOrder=desc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.query).toEqual({
        q: 'test',
        type: 'announcement',
        author: 'John',
        department: 'Engineering',
        tags: ['platform'],
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        page: 1,
        limit: 5,
        sortBy: 'relevance',
        sortOrder: 'desc',
      });
    });

    it('should handle combined filters and search', async () => {
      const request = createMockRequest('/api/content/search?q=meeting&type=event&author=Jane&tags=quarterly&sortBy=relevance&sortOrder=desc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((result: any) => {
        expect(result.item.type).toBe('event');
        expect(
          result.item.author.name.toLowerCase().includes('jane') ||
          result.item.author.email.toLowerCase().includes('jane')
        ).toBe(true);
        expect(
          result.item.tags.some((tag: string) => 
            tag.toLowerCase().includes('quarterly')
          )
        ).toBe(true);
        validateSearchResult(result);
      });
    });

    it('should measure execution time', async () => {
      const request = createMockRequest('/api/content/search?q=company');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('executionTime');
      expect(typeof data.executionTime).toBe('number');
      expect(data.executionTime).toBeGreaterThanOrEqual(0);
    });
  });
});
