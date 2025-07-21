import { GET } from '@/app/api/users/route';
import { mockUsers } from '@/data';
import {
  createMockRequest,
  getResponseJson,
  validatePaginatedResponse,
  validateErrorResponse,
  validateUser,
} from '../utils/test-helpers';

describe('/api/users', () => {
  describe('GET', () => {
    it('should return all users with default pagination', async () => {
      const request = createMockRequest('/api/users');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      expect(data.data.length).toBeLessThanOrEqual(10); // default limit
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
      expect(data.meta.total).toBe(mockUsers.length);
      
      data.data.forEach(validateUser);
    });

    it('should handle pagination correctly', async () => {
      const request = createMockRequest('/api/users?page=1&limit=3');
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

    it('should handle second page pagination', async () => {
      const request = createMockRequest('/api/users?page=2&limit=3');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      expect(data.meta.page).toBe(2);
      expect(data.meta.limit).toBe(3);
      expect(data.meta.hasPrev).toBe(true);
    });

    it('should filter users by department', async () => {
      const request = createMockRequest('/api/users?department=Engineering');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((user: any) => {
        expect(user.department).toBe('Engineering');
        validateUser(user);
      });
    });

    it('should search users by name', async () => {
      const request = createMockRequest('/api/users?search=John');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((user: any) => {
        expect(
          user.name.toLowerCase().includes('john') ||
          user.email.toLowerCase().includes('john')
        ).toBe(true);
        validateUser(user);
      });
    });

    it('should search users by email', async () => {
      const request = createMockRequest('/api/users?search=doe@company.com');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((user: any) => {
        expect(
          user.name.toLowerCase().includes('doe@company.com') ||
          user.email.toLowerCase().includes('doe@company.com')
        ).toBe(true);
        validateUser(user);
      });
    });

    it('should sort users by name ascending', async () => {
      const request = createMockRequest('/api/users?sortBy=name&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].name.localeCompare(data.data[i].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort users by name descending', async () => {
      const request = createMockRequest('/api/users?sortBy=name&sortOrder=desc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].name.localeCompare(data.data[i].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort users by email', async () => {
      const request = createMockRequest('/api/users?sortBy=email&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].email.localeCompare(data.data[i].email)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort users by department', async () => {
      const request = createMockRequest('/api/users?sortBy=department&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      for (let i = 1; i < data.data.length; i++) {
        const dept1 = data.data[i-1].department || '';
        const dept2 = data.data[i].department || '';
        expect(dept1.localeCompare(dept2)).toBeLessThanOrEqual(0);
      }
    });

    it('should return empty results for non-existent department', async () => {
      const request = createMockRequest('/api/users?department=NonExistent');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      expect(data.data.length).toBe(0);
      expect(data.meta.total).toBe(0);
    });

    it('should return empty results for non-matching search', async () => {
      const request = createMockRequest('/api/users?search=NonExistentUser');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      expect(data.data.length).toBe(0);
      expect(data.meta.total).toBe(0);
    });

    it('should return error for invalid page number', async () => {
      const request = createMockRequest('/api/users?page=0');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      validateErrorResponse(data);
      expect(data.error.code).toBe('INVALID_PAGE');
    });

    it('should return error for invalid limit', async () => {
      const request = createMockRequest('/api/users?limit=0');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      validateErrorResponse(data);
      expect(data.error.code).toBe('INVALID_LIMIT');
    });

    it('should return error for limit exceeding maximum', async () => {
      const request = createMockRequest('/api/users?limit=101');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      validateErrorResponse(data);
      expect(data.error.code).toBe('INVALID_LIMIT');
    });

    it('should handle combined filters', async () => {
      const request = createMockRequest('/api/users?department=Engineering&search=John&sortBy=name&sortOrder=asc');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validatePaginatedResponse(data);
      
      data.data.forEach((user: any) => {
        expect(user.department).toBe('Engineering');
        expect(
          user.name.toLowerCase().includes('john') ||
          user.email.toLowerCase().includes('john')
        ).toBe(true);
        validateUser(user);
      });
    });
  });
});
