import React from 'react';
import HomeClient from './HomeClient';
import { fetchAllBlogs } from '@/lib/notion';

// ISR fallback (revalidate once a day to refresh in dev/standalone, ignored in static export)
export const revalidate = 86400;

export default async function HomePage() {
  const blogs = await fetchAllBlogs();
  return <HomeClient initialBlogs={blogs} />;
}
