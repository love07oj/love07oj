import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  type: string;
  platform: string;
  difficulty: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  date: string;
  cover: string;
  summary: string;
  blocks?: Array<{
    type: string;
    content: string;
    language?: string;
    caption?: string;
  }>;
}

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('Error: NOTION_TOKEN and NOTION_DATABASE_ID env variables must be set.');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

function parseNotionPage(page: any): BlogPost {
  const props = page.properties;
  
  // Extract Title
  let title = 'Untitled Writeup';
  if (props.Title?.title?.length > 0) {
    title = props.Title.title.map((t: any) => t.plain_text).join('');
  }
  
  // Extract Slug
  let slug = '';
  if (props.Slug?.rich_text?.length > 0) {
    slug = props.Slug.rich_text.map((t: any) => t.plain_text).join('');
  } else {
    slug = page.id; // fallback
  }
  // Trim and convert slug to a clean, URL-safe format block by replacing spaces with hyphens
  slug = slug.trim().toLowerCase().replace(/\s+/g, '-');

  // Extract Type (Select)
  const type = (props.Type?.select?.name || 'Vulnerability Analysis').trim();

  // Extract Platform (Select)
  const platform = (props.Platform?.select?.name || 'Local Lab').trim();

  // Extract Difficulty (Select)
  const difficulty = props.Difficulty?.select?.name || 'Medium';

  // Extract Tags (Multi-select)
  const tags = (props.Tags?.multi_select || []).map((t: any) => t.name);

  // Extract Published (Checkbox)
  const published = props.Published?.checkbox !== undefined ? props.Published.checkbox : true;

  // Extract Featured (Checkbox)
  const featured = props.Featured?.checkbox !== undefined ? props.Featured.checkbox : false;

  // Extract Date
  let date = new Date(page.created_time).toISOString().split('T')[0];
  if (props.Date?.date?.start) {
    date = props.Date.date.start;
  }

  // Extract Cover image
  let cover = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200';
  if (page.cover) {
    if (page.cover.type === 'external') {
      cover = page.cover.external.url;
    } else if (page.cover.type === 'file') {
      cover = page.cover.file.url;
    }
  } else if (props.Cover?.files?.length > 0) {
    const fileObj = props.Cover.files[0];
    if (fileObj.type === 'external') {
      cover = fileObj.external.url;
    } else if (fileObj.type === 'file') {
      cover = fileObj.file.url;
    }
  }

  // Extract Summary
  let summary = 'No summary provided for this security writeup.';
  if (props.Summary?.rich_text?.length > 0) {
    summary = props.Summary.rich_text.map((t: any) => t.plain_text).join('');
  }

  return {
    id: page.id,
    title,
    slug,
    type,
    platform,
    difficulty,
    tags,
    published,
    featured,
    date,
    cover,
    summary,
  };
}

function parseNotionBlocks(blocks: any[]): Array<{ type: string; content: string; language?: string; caption?: string }> {
  const result: Array<{ type: string; content: string; language?: string; caption?: string }> = [];
  
  for (const block of blocks) {
    const type = block.type;
    let content = '';
    
    if (type === 'paragraph') {
      content = block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'paragraph', content });
    } else if (type === 'heading_1') {
      content = block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'heading_1', content });
    } else if (type === 'heading_2') {
      content = block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'heading_2', content });
    } else if (type === 'heading_3') {
      content = block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'heading_3', content });
    } else if (type === 'bulleted_list_item') {
      content = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'bulleted_list_item', content });
    } else if (type === 'numbered_list_item') {
      content = block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'numbered_list_item', content });
    } else if (type === 'code') {
      content = block.code.rich_text.map((t: any) => t.plain_text).join('');
      const language = block.code.language || 'text';
      result.push({ type: 'code', content, language });
    } else if (type === 'quote') {
      content = block.quote.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'quote', content });
    } else if (type === 'image') {
      const imgUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
      const caption = block.image.caption?.map((t: any) => t.plain_text).join('') || '';
      result.push({ type: 'image', content: imgUrl, caption });
    } else if (type === 'callout') {
      content = block.callout.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'callout', content });
    }
  }
  
  return result;
}

async function queryNotionDatabaseOrDataSource(
  client: any,
  databaseId: string,
  body: any
): Promise<any> {
  try {
    const dbMeta = await client.databases.retrieve({ database_id: databaseId });
    if (dbMeta && dbMeta.data_sources && dbMeta.data_sources.length > 0) {
      const dataSourceId = dbMeta.data_sources[0].id;
      console.log(`[NOTION_RESOLVER] Detected database tied to data source: ${dataSourceId}. Querying data source.`);
      return await client.request({
        path: `data_sources/${dataSourceId}/query`,
        method: 'POST',
        body,
      });
    }
  } catch (err) {
    console.warn('[NOTION_RESOLVER] Pre-query database metadata retrieval failed. Falling back to direct database query:', err);
  }

  console.log(`[NOTION_RESOLVER] Querying database: ${databaseId} directly.`);
  return await client.request({
    path: `databases/${databaseId}/query`,
    method: 'POST',
    body,
  });
}

async function sync() {
  console.log('[SYNC] Starting Notion synchronization...');
  
  const response = await queryNotionDatabaseOrDataSource(client, NOTION_DATABASE_ID!, {
    filter: {
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  const blogs: BlogPost[] = response.results.map((page: any) => parseNotionPage(page));

  console.log(`[SYNC] Retrieved ${blogs.length} published blog(s) from Notion.`);

  // Create workspace directories
  const dataDir = path.join(process.cwd(), 'data');
  const postsDir = path.join(dataDir, 'posts');

  fs.mkdirSync(postsDir, { recursive: true });

  // Write metadata list to data/blogs.json (no blocks included)
  fs.writeFileSync(path.join(dataDir, 'blogs.json'), JSON.stringify(blogs, null, 2), 'utf-8');
  console.log('[SYNC] Successfully wrote data/blogs.json.');

  // Fetch block content for each blog post and write individual post file
  for (const blog of blogs) {
    console.log(`[SYNC] Fetching blocks for post: "${blog.title}" (${blog.slug})...`);
    try {
      const blockResponse = await client.blocks.children.list({
        block_id: blog.id,
        page_size: 100,
      });

      const parsedBlocks = parseNotionBlocks(blockResponse.results);
      const completePost: BlogPost = {
        ...blog,
        blocks: parsedBlocks,
      };

      const postFilePath = path.join(postsDir, `${blog.slug}.json`);
      fs.writeFileSync(postFilePath, JSON.stringify(completePost, null, 2), 'utf-8');
      console.log(`[SYNC] Successfully wrote ${postFilePath}.`);
    } catch (err) {
      console.error(`[SYNC] Error fetching blocks for post ${blog.slug}:`, err);
    }
  }

  console.log('[SYNC] Notion synchronization fully complete!');
}

sync().catch((err) => {
  console.error('[SYNC] Sync failed:', err);
  process.exit(1);
});
