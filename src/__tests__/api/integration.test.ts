import { GET as getUsersGET } from '@/app/api/users/route';
import { GET as getContentGET } from '@/app/api/content/route';
import { GET as getSearchGET } from '@/app/api/content/search/route';
import { GET as getDepartmentsGET } from '@/app/api/departments/route';
import { GET as getTagsGET } from '@/app/api/tags/route';
import { mockUsers, mockContent } from '@/data';
import {
  createMockRequest,
  getResponseJson,
  validatePaginatedResponse,
  validateApiResponse,
} from '../utils/test-helpers';

describe('API Integration Tests', () => {
  describe('Cross-endpoint data consistency', () => {
    it('should have consistent user data between users and content endpoints', async () => {
      // Get users
      const usersRequest = createMockRequest('/api/users');
      const usersResponse = await getUsersGET(usersRequest);
      const usersData = await getResponseJson(usersResponse);

      // Get content
      const contentRequest = createMockRequest('/api/content');
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      expect(usersResponse.status).toBe(200);
      expect(contentResponse.status).toBe(200);

      // Verify that all authors in content exist in users
      const userIds = new Set(usersData.data.map((user: any) => user.id));
      
      contentData.data.forEach((item: any) => {
        expect(userIds.has(item.author.id)).toBe(true);
      });
    });

    it('should have consistent department data across all endpoints', async () => {
      // Get departments
      const deptRequest = createMockRequest('/api/departments');
      const deptResponse = await getDepartmentsGET(deptRequest);
      const deptData = await getResponseJson(deptResponse);

      // Get users
      const usersRequest = createMockRequest('/api/users');
      const usersResponse = await getUsersGET(usersRequest);
      const usersData = await getResponseJson(usersResponse);

      // Get content
      const contentRequest = createMockRequest('/api/content');
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      expect(deptResponse.status).toBe(200);
      expect(usersResponse.status).toBe(200);
      expect(contentResponse.status).toBe(200);

      // Verify department consistency
      const departmentNames = new Set(deptData.data.map((dept: any) => dept.name));
      
      // All user departments should exist in departments endpoint
      usersData.data.forEach((user: any) => {
        if (user.department) {
          expect(departmentNames.has(user.department)).toBe(true);
        }
      });

      // All content author departments should exist in departments endpoint
      contentData.data.forEach((item: any) => {
        if (item.author.department) {
          expect(departmentNames.has(item.author.department)).toBe(true);
        }
      });
    });

    it('should have consistent tag data between content and tags endpoints', async () => {
      // Get tags
      const tagsRequest = createMockRequest('/api/tags');
      const tagsResponse = await getTagsGET(tagsRequest);
      const tagsData = await getResponseJson(tagsResponse);

      // Get content
      const contentRequest = createMockRequest('/api/content');
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      expect(tagsResponse.status).toBe(200);
      expect(contentResponse.status).toBe(200);

      // Verify tag consistency
      const tagNames = new Set(tagsData.data.map((tag: any) => tag.name));
      
      // All content tags should exist in tags endpoint
      contentData.data.forEach((item: any) => {
        item.tags.forEach((tag: string) => {
          expect(tagNames.has(tag)).toBe(true);
        });
      });
    });

    it('should maintain data consistency between content and search endpoints', async () => {
      // Get all content
      const contentRequest = createMockRequest('/api/content?limit=100');
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      // Get all content via search (no query)
      const searchRequest = createMockRequest('/api/content/search?limit=100');
      const searchResponse = await getSearchGET(searchRequest);
      const searchData = await getResponseJson(searchResponse);

      expect(contentResponse.status).toBe(200);
      expect(searchResponse.status).toBe(200);

      // Both should return the same total count
      expect(contentData.meta.total).toBe(searchData.meta.total);

      // Extract items from search results
      const searchItems = searchData.data.map((result: any) => result.item);
      
      // Content should be the same (ignoring order)
      const contentIds = new Set(contentData.data.map((item: any) => item.id));
      const searchIds = new Set(searchItems.map((item: any) => item.id));
      
      expect(contentIds).toEqual(searchIds);
    });
  });

  describe('Filtering consistency', () => {
    it('should filter by department consistently across endpoints', async () => {
      const department = 'Engineering';

      // Filter users by department
      const usersRequest = createMockRequest(`/api/users?department=${department}`);
      const usersResponse = await getUsersGET(usersRequest);
      const usersData = await getResponseJson(usersResponse);

      // Filter content by department (via author)
      const searchRequest = createMockRequest(`/api/content/search?department=${department}`);
      const searchResponse = await getSearchGET(searchRequest);
      const searchData = await getResponseJson(searchResponse);

      expect(usersResponse.status).toBe(200);
      expect(searchResponse.status).toBe(200);

      // All users should be from the specified department
      usersData.data.forEach((user: any) => {
        expect(user.department).toBe(department);
      });

      // All content authors should be from the specified department
      searchData.data.forEach((result: any) => {
        expect(result.item.author.department).toBe(department);
      });
    });

    it('should filter by author consistently between content and search', async () => {
      const authorName = 'John';

      // Filter content by author
      const contentRequest = createMockRequest(`/api/content?author=${authorName}`);
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      // Filter search by author
      const searchRequest = createMockRequest(`/api/content/search?author=${authorName}`);
      const searchResponse = await getSearchGET(searchRequest);
      const searchData = await getResponseJson(searchResponse);

      expect(contentResponse.status).toBe(200);
      expect(searchResponse.status).toBe(200);

      // Both should return the same items (ignoring order and search scoring)
      const contentIds = new Set(contentData.data.map((item: any) => item.id));
      const searchIds = new Set(searchData.data.map((result: any) => result.item.id));
      
      expect(contentIds).toEqual(searchIds);
    });

    it('should filter by tags consistently between content and search', async () => {
      const tags = 'meeting';

      // Filter content by tags
      const contentRequest = createMockRequest(`/api/content?tags=${tags}`);
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      // Filter search by tags
      const searchRequest = createMockRequest(`/api/content/search?tags=${tags}`);
      const searchResponse = await getSearchGET(searchRequest);
      const searchData = await getResponseJson(searchResponse);

      expect(contentResponse.status).toBe(200);
      expect(searchResponse.status).toBe(200);

      // Both should return the same items (ignoring order and search scoring)
      const contentIds = new Set(contentData.data.map((item: any) => item.id));
      const searchIds = new Set(searchData.data.map((result: any) => result.item.id));
      
      expect(contentIds).toEqual(searchIds);
    });
  });

  describe('Pagination consistency', () => {
    it('should handle pagination consistently across endpoints', async () => {
      const limit = 3;
      const page = 1;

      // Test users pagination
      const usersRequest = createMockRequest(`/api/users?page=${page}&limit=${limit}`);
      const usersResponse = await getUsersGET(usersRequest);
      const usersData = await getResponseJson(usersResponse);

      // Test content pagination
      const contentRequest = createMockRequest(`/api/content?page=${page}&limit=${limit}`);
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      // Test search pagination
      const searchRequest = createMockRequest(`/api/content/search?page=${page}&limit=${limit}`);
      const searchResponse = await getSearchGET(searchRequest);
      const searchData = await getResponseJson(searchResponse);

      expect(usersResponse.status).toBe(200);
      expect(contentResponse.status).toBe(200);
      expect(searchResponse.status).toBe(200);

      // All should respect pagination parameters
      expect(usersData.data.length).toBeLessThanOrEqual(limit);
      expect(contentData.data.length).toBeLessThanOrEqual(limit);
      expect(searchData.data.length).toBeLessThanOrEqual(limit);

      expect(usersData.meta.page).toBe(page);
      expect(contentData.meta.page).toBe(page);
      expect(searchData.meta.page).toBe(page);

      expect(usersData.meta.limit).toBe(limit);
      expect(contentData.meta.limit).toBe(limit);
      expect(searchData.meta.limit).toBe(limit);
    });
  });

  describe('Data integrity', () => {
    it('should maintain referential integrity between users and content', async () => {
      // Get all users
      const usersRequest = createMockRequest('/api/users?limit=100');
      const usersResponse = await getUsersGET(usersRequest);
      const usersData = await getResponseJson(usersResponse);

      // Get all content
      const contentRequest = createMockRequest('/api/content?limit=100');
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      expect(usersResponse.status).toBe(200);
      expect(contentResponse.status).toBe(200);

      const userMap = new Map();
      usersData.data.forEach((user: any) => {
        userMap.set(user.id, user);
      });

      // Verify that every content item has a valid author
      contentData.data.forEach((item: any) => {
        const author = userMap.get(item.author.id);
        expect(author).toBeDefined();
        expect(author.name).toBe(item.author.name);
        expect(author.email).toBe(item.author.email);
        expect(author.department).toBe(item.author.department);
      });
    });

    it('should have accurate statistics in departments endpoint', async () => {
      // Get departments
      const deptRequest = createMockRequest('/api/departments');
      const deptResponse = await getDepartmentsGET(deptRequest);
      const deptData = await getResponseJson(deptResponse);

      // Get all users and content for verification
      const usersRequest = createMockRequest('/api/users?limit=100');
      const usersResponse = await getUsersGET(usersRequest);
      const usersData = await getResponseJson(usersResponse);

      const contentRequest = createMockRequest('/api/content?limit=100');
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      expect(deptResponse.status).toBe(200);
      expect(usersResponse.status).toBe(200);
      expect(contentResponse.status).toBe(200);

      // Verify department statistics
      deptData.data.forEach((dept: any) => {
        const actualUserCount = usersData.data.filter(
          (user: any) => user.department === dept.name
        ).length;
        
        const actualContentCount = contentData.data.filter(
          (item: any) => item.author.department === dept.name
        ).length;

        expect(dept.userCount).toBe(actualUserCount);
        expect(dept.contentCount).toBe(actualContentCount);
      });
    });

    it('should have accurate statistics in tags endpoint', async () => {
      // Get tags
      const tagsRequest = createMockRequest('/api/tags');
      const tagsResponse = await getTagsGET(tagsRequest);
      const tagsData = await getResponseJson(tagsResponse);

      // Get all content for verification
      const contentRequest = createMockRequest('/api/content?limit=100');
      const contentResponse = await getContentGET(contentRequest);
      const contentData = await getResponseJson(contentResponse);

      expect(tagsResponse.status).toBe(200);
      expect(contentResponse.status).toBe(200);

      // Count tag usage manually
      const tagCounts = new Map<string, number>();
      contentData.data.forEach((item: any) => {
        item.tags.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      // Verify tag statistics
      tagsData.data.forEach((tag: any) => {
        const actualCount = tagCounts.get(tag.name) || 0;
        expect(tag.count).toBe(actualCount);
      });
    });
  });

  describe('Error handling consistency', () => {
    it('should handle invalid pagination parameters consistently', async () => {
      const invalidParams = '?page=0&limit=0';

      const usersRequest = createMockRequest(`/api/users${invalidParams}`);
      const usersResponse = await getUsersGET(usersRequest);

      const contentRequest = createMockRequest(`/api/content${invalidParams}`);
      const contentResponse = await getContentGET(contentRequest);

      const searchRequest = createMockRequest(`/api/content/search${invalidParams}`);
      const searchResponse = await getSearchGET(searchRequest);

      // All should return 400 status
      expect(usersResponse.status).toBe(400);
      expect(contentResponse.status).toBe(400);
      expect(searchResponse.status).toBe(400);

      // All should have consistent error structure
      const usersError = await getResponseJson(usersResponse);
      const contentError = await getResponseJson(contentResponse);
      const searchError = await getResponseJson(searchResponse);

      expect(usersError.success).toBe(false);
      expect(contentError.success).toBe(false);
      expect(searchError.success).toBe(false);

      expect(usersError.error.code).toBe('INVALID_PAGE');
      expect(contentError.error.code).toBe('INVALID_PAGE');
      expect(searchError.error.code).toBe('INVALID_PAGE');
    });
  });
});
