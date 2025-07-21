import { GET } from '@/app/api/departments/route';
import { mockUsers, mockContent } from '@/data';
import {
  createMockRequest,
  getResponseJson,
  validateApiResponse,
  validateDepartmentInfo,
} from '../utils/test-helpers';

describe('/api/departments', () => {
  describe('GET', () => {
    it('should return all departments with statistics', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validateApiResponse(data);
      
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      data.data.forEach(validateDepartmentInfo);
    });

    it('should include all unique departments from users', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // Get unique departments from mock data
      const expectedDepartments = Array.from(
        new Set(mockUsers.map(user => user.department).filter(Boolean))
      );
      
      expect(data.data.length).toBe(expectedDepartments.length);
      
      const returnedDepartments = data.data.map((dept: any) => dept.name);
      expectedDepartments.forEach(dept => {
        expect(returnedDepartments).toContain(dept);
      });
    });

    it('should calculate correct user counts for each department', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      data.data.forEach((dept: any) => {
        const expectedUserCount = mockUsers.filter(
          user => user.department === dept.name
        ).length;
        
        expect(dept.userCount).toBe(expectedUserCount);
        expect(dept.userCount).toBeGreaterThan(0); // Each department should have at least one user
      });
    });

    it('should calculate correct content counts for each department', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      data.data.forEach((dept: any) => {
        const expectedContentCount = mockContent.filter(
          content => content.author.department === dept.name
        ).length;
        
        expect(dept.contentCount).toBe(expectedContentCount);
        expect(dept.contentCount).toBeGreaterThanOrEqual(0); // Some departments might not have content
      });
    });

    it('should sort departments by user count descending', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i-1].userCount).toBeGreaterThanOrEqual(data.data[i].userCount);
      }
    });

    it('should have consistent data structure for all departments', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      data.data.forEach((dept: any) => {
        validateDepartmentInfo(dept);
        
        // Verify department name is a non-empty string
        expect(typeof dept.name).toBe('string');
        expect(dept.name.length).toBeGreaterThan(0);
        
        // Verify counts are non-negative integers
        expect(Number.isInteger(dept.userCount)).toBe(true);
        expect(Number.isInteger(dept.contentCount)).toBe(true);
        expect(dept.userCount).toBeGreaterThanOrEqual(0);
        expect(dept.contentCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should verify total user count matches mock data', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const totalUsersFromDepartments = data.data.reduce(
        (sum: number, dept: any) => sum + dept.userCount,
        0
      );
      
      const totalUsersInMockData = mockUsers.filter(user => user.department).length;
      
      expect(totalUsersFromDepartments).toBe(totalUsersInMockData);
    });

    it('should verify total content count matches mock data', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const totalContentFromDepartments = data.data.reduce(
        (sum: number, dept: any) => sum + dept.contentCount,
        0
      );
      
      const totalContentInMockData = mockContent.filter(
        content => content.author.department
      ).length;
      
      expect(totalContentFromDepartments).toBe(totalContentInMockData);
    });

    it('should include specific expected departments', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      const departmentNames = data.data.map((dept: any) => dept.name);
      
      // Check for some expected departments based on mock data
      expect(departmentNames).toContain('Engineering');
      expect(departmentNames).toContain('HR');
      expect(departmentNames).toContain('Marketing');
    });

    it('should not include departments with zero users', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // All returned departments should have at least one user
      data.data.forEach((dept: any) => {
        expect(dept.userCount).toBeGreaterThan(0);
      });
    });

    it('should handle departments with no content gracefully', async () => {
      const request = createMockRequest('/api/departments');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      
      // Some departments might have 0 content, which is valid
      data.data.forEach((dept: any) => {
        expect(dept.contentCount).toBeGreaterThanOrEqual(0);
        
        if (dept.contentCount === 0) {
          // Verify this is correct by checking mock data
          const actualContentCount = mockContent.filter(
            content => content.author.department === dept.name
          ).length;
          expect(actualContentCount).toBe(0);
        }
      });
    });

    it('should return consistent results on multiple calls', async () => {
      const request1 = createMockRequest('/api/departments');
      const response1 = await GET(request1);
      const data1 = await getResponseJson(response1);

      const request2 = createMockRequest('/api/departments');
      const response2 = await GET(request2);
      const data2 = await getResponseJson(response2);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Results should be identical
      expect(data1.data).toEqual(data2.data);
    });

    it('should handle empty query parameters gracefully', async () => {
      const request = createMockRequest('/api/departments?someParam=value');
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      validateApiResponse(data);
      
      // Should ignore unknown query parameters and return normal results
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });
});
