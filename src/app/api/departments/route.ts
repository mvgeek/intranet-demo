import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, mockContent } from '@/data';
import { DepartmentInfo, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get all unique departments from users
    const departments = Array.from(
      new Set(mockUsers.map(user => user.department).filter(Boolean))
    ) as string[];

    // Calculate stats for each department
    const departmentStats: DepartmentInfo[] = departments.map(dept => {
      const userCount = mockUsers.filter(user => user.department === dept).length;
      const contentCount = mockContent.filter(
        content => content.author.department === dept
      ).length;

      return {
        name: dept as DepartmentInfo['name'],
        userCount,
        contentCount,
      };
    });

    // Sort by user count descending
    departmentStats.sort((a, b) => b.userCount - a.userCount);

    const response: ApiResponse<DepartmentInfo[]> = {
      data: departmentStats,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/departments:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Internal server error', 
          code: 'INTERNAL_ERROR' 
        } 
      },
      { status: 500 }
    );
  }
}
