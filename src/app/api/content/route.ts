import { NextRequest, NextResponse } from 'next/server';
import { mockContent } from '@/data';
import { ContentQuery, PaginatedResponse, ContentItem, ApiError } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query: ContentQuery = {
      type: searchParams.get('type') as ContentItem['type'] || undefined,
      author: searchParams.get('author') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      sortBy: (searchParams.get('sortBy') as ContentQuery['sortBy']) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as ContentQuery['sortOrder']) || 'desc',
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

    // Filter content
    let filteredContent = [...mockContent];

    // Filter by type
    if (query.type) {
      filteredContent = filteredContent.filter(item => item.type === query.type);
    }

    // Filter by author
    if (query.author) {
      filteredContent = filteredContent.filter(
        item => item.author.name.toLowerCase().includes(query.author!.toLowerCase()) ||
                item.author.email.toLowerCase().includes(query.author!.toLowerCase())
      );
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      filteredContent = filteredContent.filter(item =>
        query.tags!.some(tag => 
          item.tags.some(itemTag => 
            itemTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Filter by date range
    if (query.dateFrom) {
      const fromDate = new Date(query.dateFrom);
      if (!isNaN(fromDate.getTime())) {
        filteredContent = filteredContent.filter(item => item.createdAt >= fromDate);
      }
    }

    if (query.dateTo) {
      const toDate = new Date(query.dateTo);
      if (!isNaN(toDate.getTime())) {
        filteredContent = filteredContent.filter(item => item.createdAt <= toDate);
      }
    }

    // Sort content
    filteredContent.sort((a, b) => {
      let comparison = 0;

      switch (query.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'createdAt':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return query.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate pagination
    const total = filteredContent.length;
    const totalPages = Math.ceil(total / query.limit!);
    const startIndex = (query.page! - 1) * query.limit!;
    const endIndex = startIndex + query.limit!;
    const paginatedContent = filteredContent.slice(startIndex, endIndex);

    // Prepare response
    const response: PaginatedResponse<ContentItem> = {
      data: paginatedContent,
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
    console.error('Error in /api/content:', error);
    
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
