import { NextRequest, NextResponse } from 'next/server';
import { mockContent } from '@/data';
import { SearchQuery, SearchResponse, SearchResult, ContentItem, ApiError } from '@/types';

// Simple text search scoring function
function calculateScore(item: ContentItem, query: string): number {
  if (!query) return 1;
  
  const searchTerm = query.toLowerCase();
  let score = 0;
  
  // Title matches get highest score
  if (item.title.toLowerCase().includes(searchTerm)) {
    score += 10;
  }
  
  // Content matches get medium score
  if (item.content.toLowerCase().includes(searchTerm)) {
    score += 5;
  }
  
  // Tag matches get lower score
  const tagMatches = item.tags.filter(tag => 
    tag.toLowerCase().includes(searchTerm)
  ).length;
  score += tagMatches * 2;
  
  // Author name matches
  if (item.author.name.toLowerCase().includes(searchTerm)) {
    score += 3;
  }
  
  return score;
}

// Generate highlights for search results
function generateHighlights(item: ContentItem, query: string): SearchResult['highlights'] {
  if (!query) return undefined;
  
  const searchTerm = query.toLowerCase();
  const highlights: SearchResult['highlights'] = {};
  
  // Title highlights
  if (item.title.toLowerCase().includes(searchTerm)) {
    highlights.title = [item.title];
  }
  
  // Content highlights (show snippet around match)
  if (item.content.toLowerCase().includes(searchTerm)) {
    const index = item.content.toLowerCase().indexOf(searchTerm);
    const start = Math.max(0, index - 50);
    const end = Math.min(item.content.length, index + searchTerm.length + 50);
    const snippet = item.content.substring(start, end);
    highlights.content = [snippet];
  }
  
  // Tag highlights
  const matchingTags = item.tags.filter(tag => 
    tag.toLowerCase().includes(searchTerm)
  );
  if (matchingTags.length > 0) {
    highlights.tags = matchingTags;
  }
  
  return Object.keys(highlights).length > 0 ? highlights : undefined;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query: SearchQuery = {
      q: searchParams.get('q') || undefined,
      type: searchParams.get('type') as ContentItem['type'] || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      author: searchParams.get('author') || undefined,
      department: searchParams.get('department') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as SearchQuery['sortBy']) || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as SearchQuery['sortOrder']) || 'desc',
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

    // Filter and score content
    let results: SearchResult[] = mockContent
      .filter(item => {
        // Filter by type
        if (query.type && item.type !== query.type) return false;
        
        // Filter by author
        if (query.author) {
          const authorMatch = item.author.name.toLowerCase().includes(query.author.toLowerCase()) ||
                             item.author.email.toLowerCase().includes(query.author.toLowerCase());
          if (!authorMatch) return false;
        }
        
        // Filter by department
        if (query.department && item.author.department?.toLowerCase() !== query.department.toLowerCase()) {
          return false;
        }
        
        // Filter by tags
        if (query.tags && query.tags.length > 0) {
          const hasMatchingTag = query.tags.some(tag => 
            item.tags.some(itemTag => 
              itemTag.toLowerCase().includes(tag.toLowerCase())
            )
          );
          if (!hasMatchingTag) return false;
        }
        
        // Filter by date range
        if (query.dateFrom) {
          const fromDate = new Date(query.dateFrom);
          if (!isNaN(fromDate.getTime()) && item.createdAt < fromDate) return false;
        }
        
        if (query.dateTo) {
          const toDate = new Date(query.dateTo);
          if (!isNaN(toDate.getTime()) && item.createdAt > toDate) return false;
        }
        
        return true;
      })
      .map(item => ({
        item,
        score: calculateScore(item, query.q || ''),
        highlights: generateHighlights(item, query.q || ''),
      }))
      .filter(result => !query.q || result.score > 0); // Only include items with matches if search query provided

    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (query.sortBy) {
        case 'createdAt':
          comparison = a.item.createdAt.getTime() - b.item.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.item.updatedAt.getTime() - b.item.updatedAt.getTime();
          break;
        case 'title':
          comparison = a.item.title.localeCompare(b.item.title);
          break;
        case 'relevance':
        default:
          comparison = a.score - b.score;
          break;
      }
      
      return query.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate pagination
    const total = results.length;
    const totalPages = Math.ceil(total / query.limit!);
    const startIndex = (query.page! - 1) * query.limit!;
    const endIndex = startIndex + query.limit!;
    const paginatedResults = results.slice(startIndex, endIndex);

    const executionTime = Date.now() - startTime;

    // Prepare response
    const response: SearchResponse = {
      data: paginatedResults,
      meta: {
        page: query.page!,
        limit: query.limit!,
        total,
        totalPages,
        hasNext: query.page! < totalPages,
        hasPrev: query.page! > 1,
      },
      query,
      executionTime,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/content/search:', error);
    
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
