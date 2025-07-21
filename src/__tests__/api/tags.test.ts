import { GET } from '@/app/api/tags/route';
import { mockContent } from '@/data';
import {
  createMockRequest,
  getResponseJson,
  validateApiResponse,
  validateTagInfo,
} from '../utils/test-helpers';

describe('/api/tags', () => {
  describe('GET', () => {
    it('should return all tags with statistics', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validateApiResponse(data);
      
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      data.data.forEach(validateTagInfo);
    });

    it('should include all unique tags from content', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // Get all unique tags from mock data
      const allTags = new Set<string>();
      mockContent.forEach(content => {
        content.tags.forEach(tag => allTags.add(tag));
      });
      
      const expectedTagCount = allTags.size;
      expect(data.data.length).toBe(expectedTagCount);
      
      const returnedTags = data.data.map((tag: any) => tag.name);
      Array.from(allTags).forEach(tag => {
        expect(returnedTags).toContain(tag);
      });
    });

    it('should calculate correct usage counts for each tag', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      data.data.forEach((tag: any) => {
        let expectedCount = 0;
        mockContent.forEach(content => {
          if (content.tags.includes(tag.name)) {
            expectedCount++;
          }
        });
        
        expect(tag.count).toBe(expectedCount);
        expect(tag.count).toBeGreaterThan(0); // Each tag should be used at least once
      });
    });

    it('should sort tags by count descending', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].count).toBeGreaterThanOrEqual(data.data[i].count);
      }
    });

    it('should categorize tags correctly', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      data.data.forEach((tag: any) => {
        validateTagInfo(tag);
        
        if (tag.category) {
          expect(['general', 'department', 'event', 'policy']).toContain(tag.category);
        }
      });
    });

    it('should categorize event-related tags correctly', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const eventTags = ['meeting', 'event', 'training', 'celebration'];
      
      data.data.forEach((tag: any) => {
        if (eventTags.includes(tag.name)) {
          expect(tag.category).toBe('event');
        }
      });
    });

    it('should categorize policy-related tags correctly', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const policyTags = ['policy', 'guidelines', 'mandatory'];
      
      data.data.forEach((tag: any) => {
        if (policyTags.includes(tag.name)) {
          expect(tag.category).toBe('policy');
        }
      });
    });

    it('should categorize department-related tags correctly', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const departmentTags = ['engineering', 'hr', 'marketing', 'finance', 'operations', 'design', 'legal', 'sales'];
      
      data.data.forEach((tag: any) => {
        if (departmentTags.includes(tag.name.toLowerCase())) {
          expect(tag.category).toBe('department');
        }
      });
    });

    it('should have consistent data structure for all tags', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      data.data.forEach((tag: any) => {
        validateTagInfo(tag);
        
        // Verify tag name is a non-empty string
        expect(typeof tag.name).toBe('string');
        expect(tag.name.length).toBeGreaterThan(0);
        
        // Verify count is a positive integer
        expect(Number.isInteger(tag.count)).toBe(true);
        expect(tag.count).toBeGreaterThan(0);
        
        // Verify category if present
        if (tag.category) {
          expect(typeof tag.category).toBe('string');
          expect(['general', 'department', 'event', 'policy']).toContain(tag.category);
        }
      });
    });

    it('should verify total tag usage matches mock data', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const totalTagUsage = data.data.reduce(
        (sum: number, tag: any) => sum + tag.count,
        0
      );
      
      const expectedTotalUsage = mockContent.reduce(
        (sum, content) => sum + content.tags.length,
        0
      );
      
      expect(totalTagUsage).toBe(expectedTotalUsage);
    });

    it('should include specific expected tags', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const tagNames = data.data.map((tag: any) => tag.name);
      
      // Check for some expected tags based on mock data
      expect(tagNames).toContain('announcement');
      expect(tagNames).toContain('meeting');
      expect(tagNames).toContain('policy');
    });

    it('should not include tags with zero usage', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // All returned tags should have at least one usage
      data.data.forEach((tag: any) => {
        expect(tag.count).toBeGreaterThan(0);
      });
    });

    it('should handle tags with multiple usages correctly', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // Find tags that appear in multiple content items
      const tagUsageCounts = new Map<string, number>();
      mockContent.forEach(content => {
        content.tags.forEach(tag => {
          tagUsageCounts.set(tag, (tagUsageCounts.get(tag) || 0) + 1);
        });
      });
      
      data.data.forEach((tag: any) => {
        const expectedCount = tagUsageCounts.get(tag.name) || 0;
        expect(tag.count).toBe(expectedCount);
      });
    });

    it('should return consistent results on multiple calls', async () => {
      const request1 = createMockRequest('/api/tags');
      const response1 = await GET(request1);
      const data1 = await getResponseJson(response1);

      const request2 = createMockRequest('/api/tags');
      const response2 = await GET(request2);
      const data2 = await getResponseJson(response2);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Results should be identical
      expect(data1.data).toEqual(data2.data);
    });

    it('should handle empty query parameters gracefully', async () => {
      const request = createMockRequest('/api/tags?someParam=value');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validateApiResponse(data);
      
      // Should ignore unknown query parameters and return normal results
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should have proper tag distribution', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // Verify that we have a reasonable distribution of tag categories
      const categories = data.data.map((tag: any) => tag.category).filter(Boolean);
      const uniqueCategories = new Set(categories);
      
      expect(uniqueCategories.size).toBeGreaterThan(0);
      expect(uniqueCategories.size).toBeLessThanOrEqual(4); // We have 4 defined categories
    });

    it('should handle case sensitivity in tag categorization', async () => {
      const request = createMockRequest('/api/tags');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // The categorization logic should handle case insensitivity
      data.data.forEach((tag: any) => {
        if (tag.name.toLowerCase() === 'engineering') {
          expect(tag.category).toBe('department');
        }
      });
    });
  });
});
