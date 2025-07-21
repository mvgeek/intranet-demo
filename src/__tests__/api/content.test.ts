import { GET } from '@/app/api/content/route';
import { mockContent } from '@/data';
import {
  createMockRequest,
  getResponseJson,
  validatePaginatedResponse,
  validateErrorResponse,
  validateContentItem,
} from '../utils/test-helpers';

describe('/api/content', () => {
  describe('GET', () => {
    it('should return all content with default pagination', async () => {
      const request = createMockRequest('/api/content');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      expect(data.data.length).toBeLessThanOrEqual(10); // default limit
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
      expect(data.meta.total).toBe(mockContent.length);
      
      data.data.forEach(validateContentItem);
    });

    it('should handle pagination correctly', async () => {
      const request = createMockRequest('/api/content?page=1&limit=3');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      expect(data.data.length).toBe(3);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(3);
      expect(data.meta.hasNext).toBe(true);
      expect(data.meta.hasPrev).toBe(false);
    });

    it('should filter content by type', async () => {
      const request = createMockRequest('/api/content?type=announcement');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((item: any) => {
        expect(item.type).toBe('announcement');
        validateContentItem(item);
      });
    });

    it('should filter content by author name', async () => {
      const request = createMockRequest('/api/content?author=John');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((item: any) => {
        expect(
          item.author.name.toLowerCase().includes('john') ||
          item.author.email.toLowerCase().includes('john')
        ).toBe(true);
        validateContentItem(item);
      });
    });

    it('should filter content by author email', async () => {
      const request = createMockRequest('/api/content?author=jane.smith');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((item: any) => {
        expect(
          item.author.name.toLowerCase().includes('jane.smith') ||
          item.author.email.toLowerCase().includes('jane.smith')
        ).toBe(true);
        validateContentItem(item);
      });
    });

    it('should filter content by single tag', async () => {
      const request = createMockRequest('/api/content?tags=announcement');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((item: any) => {
        expect(
          item.tags.some((tag: string) => 
            tag.toLowerCase().includes('announcement')
          )
        ).toBe(true);
        validateContentItem(item);
      });
    });

    it('should filter content by multiple tags', async () => {
      const request = createMockRequest('/api/content?tags=meeting,quarterly');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((item: any) => {
        expect(
          item.tags.some((tag: string) => 
            tag.toLowerCase().includes('meeting') ||
            tag.toLowerCase().includes('quarterly')
          )
        ).toBe(true);
        validateContentItem(item);
      });
    });

    it('should filter content by date range', async () => {
      const request = createMockRequest('/api/content?dateFrom=2024-01-20&dateTo=2024-02-01');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      const fromDate = new Date('2024-01-20');
      const toDate = new Date('2024-02-01');
      
      data.data.forEach((item: any) => {
        const itemDate = new Date(item.createdAt);
        expect(itemDate >= fromDate && itemDate <= toDate).toBe(true);
        validateContentItem(item);
      });
    });

    it('should filter content from a specific date', async () => {
      const request = createMockRequest('/api/content?dateFrom=2024-02-01');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      const fromDate = new Date('2024-02-01');
      
      data.data.forEach((item: any) => {
        const itemDate = new Date(item.createdAt);
        expect(itemDate >= fromDate).toBe(true);
        validateContentItem(item);
      });
    });

    it('should filter content to a specific date', async () => {
      const request = createMockRequest('/api/content?dateTo=2024-01-31');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      const toDate = new Date('2024-01-31');
      
      data.data.forEach((item: any) => {
        const itemDate = new Date(item.createdAt);
        expect(itemDate <= toDate).toBe(true);
        validateContentItem(item);
      });
    });

    it('should sort content by createdAt descending (default)', async () => {
      const request = createMockRequest('/api/content');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        const date1 = new Date(data.data[i-1].createdAt);
        const date2 = new Date(data.data[i].createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });

    it('should sort content by createdAt ascending', async () => {
      const request = createMockRequest('/api/content?sortBy=createdAt&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        const date1 = new Date(data.data[i-1].createdAt);
        const date2 = new Date(data.data[i].createdAt);
        expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
      }
    });

    it('should sort content by title', async () => {
      const request = createMockRequest('/api/content?sortBy=title&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].title.localeCompare(data.data[i].title)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort content by updatedAt', async () => {
      const request = createMockRequest('/api/content?sortBy=updatedAt&sortOrder=desc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        const date1 = new Date(data.data[i-1].updatedAt);
        const date2 = new Date(data.data[i].updatedAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });

    it('should return empty results for non-existent type', async () => {
      const request = createMockRequest('/api/content?type=nonexistent');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      expect(data.data.length).toBe(0);
      expect(data.meta.total).toBe(0);
    });

    it('should return empty results for non-matching author', async () => {
      const request = createMockRequest('/api/content?author=NonExistentAuthor');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      expect(data.data.length).toBe(0);
      expect(data.meta.total).toBe(0);
    });

    it('should return error for invalid page number', async () => {
      const request = createMockRequest('/api/content?page=0');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      validateErrorResponse(data);
      expect(data.error.code).toBe('INVALID_PAGE');
    });

    it('should return error for invalid limit', async () => {
      const request = createMockRequest('/api/content?limit=101');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      validateErrorResponse(data);
      expect(data.error.code).toBe('INVALID_LIMIT');
    });

    it('should handle combined filters', async () => {
      const request = createMockRequest('/api/content?type=event&author=Jane&tags=meeting&sortBy=title&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((item: any) => {
        expect(item.type).toBe('event');
        expect(
          item.author.name.toLowerCase().includes('jane') ||
          item.author.email.toLowerCase().includes('jane')
        ).toBe(true);
        expect(
          item.tags.some((tag: string) => 
            tag.toLowerCase().includes('meeting')
          )
        ).toBe(true);
        validateContentItem(item);
      });
    });

    it('should handle invalid date formats gracefully', async () => {
      const request = createMockRequest('/api/content?dateFrom=invalid-date');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      // Should return all content since invalid date is ignored
      expect(data.meta.total).toBe(mockContent.length);
    });
  });
});
