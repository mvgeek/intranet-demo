import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/data';
import { UserQuery, PaginatedResponse, User, ApiError } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query: UserQuery = {
      department: searchParams.get('department') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as UserQuery['sortBy']) || 'name',
      sortOrder: (searchParams.get('sortOrder') as UserQuery['sortOrder']) || 'asc',
    };

    // Validate pagination parameters
    if (query.page! < 1) {
      const error: ApiError = {
        message: 'Page number must be greater than 0',
        code: 'INVALID_PAGE',
      };
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    if (query.limit! < 1 || query.limit! > 100) {
      const error: ApiError = {
        message: 'Limit must be between 1 and 100',
        code: 'INVALID_LIMIT',
      };
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    // Filter users
    let filteredUsers = [...mockUsers];

    // Filter by department
    if (query.department) {
      filteredUsers = filteredUsers.filter(
        user => user.department?.toLowerCase() === query.department!.toLowerCase()
      );
    }

    // Filter by search term (name or email)
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (query.sortBy) {
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'department':
          aValue = a.department || '';
          bValue = b.department || '';
          break;
        case 'name':
        default:
          aValue = a.name;
          bValue = b.name;
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return query.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / query.limit!);
    const startIndex = (query.page! - 1) * query.limit!;
    const endIndex = startIndex + query.limit!;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Prepare response
    const response: PaginatedResponse<User> = {
      data: paginatedUsers,
      meta: {
        page: query.page!,
        limit: query.limit!,
        total,
        totalPages,
        hasNext: query.page! < totalPages,
        hasPrev: query.page! > 1,
      },
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/users:', error);
    
    const apiError: ApiError = {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
    
    return NextResponse.json(
      { success: false, error: apiError },
      { status: 500 }
    );
  }
}
