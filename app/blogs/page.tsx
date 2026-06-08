import React from 'react';
import BlogsClient from './BlogsClient';
import { fetchAllBlogs } from '@/lib/notion';

// ISR cached for 24 hours (86400 seconds)
export const revalidate = 86400;

export default async function BlogsPage() {
  // Fetch blogs directly in the Server Component
  const blogs = await fetchAllBlogs();
  const liveConnected = !!(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID);

  return <BlogsClient initialBlogs={blogs} liveConnected={liveConnected} />;
}
