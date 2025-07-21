import { NextRequest, NextResponse } from 'next/server';
import { mockContent } from '@/data';
import { TagInfo, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get all tags from content and count their usage
    const tagCounts = new Map<string, number>();
    
    mockContent.forEach(content => {
      content.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Convert to TagInfo array
    const tags: TagInfo[] = Array.from(tagCounts.entries()).map(([name, count]) => {
      // Categorize tags based on common patterns
      let category: TagInfo['category'] = 'general';

      if (['policy', 'guidelines', 'mandatory'].includes(name)) {
        category = 'policy';
      } else if (['meeting', 'event', 'training', 'celebration'].includes(name)) {
        category = 'event';
      } else if (['engineering', 'hr', 'marketing', 'finance', 'operations', 'design', 'legal', 'sales'].includes(name.toLowerCase())) {
        category = 'department';
      } else if (['announcement', 'news'].includes(name)) {
        category = 'general';
      }

      return {
        name,
        count,
        category,
      };
    });

    // Sort by count descending
    tags.sort((a, b) => b.count - a.count);

    const response: ApiResponse<TagInfo[]> = {
      data: tags,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/tags:', error);
    
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
