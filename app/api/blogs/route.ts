import { NextRequest, NextResponse } from 'next/server';
import { fetchAllBlogs, fetchBlogBySlug } from '@/lib/notion';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const blog = await fetchBlogBySlug(slug);
      if (!blog) {
        return NextResponse.json({ error: 'Security writeup not found' }, { status: 404 });
      }
      return NextResponse.json(blog);
    }

    const blogs = await fetchAllBlogs();
    const isMock = !process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID;

    return NextResponse.json({
      blogs,
      liveConnected: !isMock,
      configuredDatabase: process.env.NOTION_DATABASE_ID || null
    });
  } catch (error: any) {
    console.error('API /api/blogs error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
