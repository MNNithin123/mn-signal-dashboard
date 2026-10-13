import { NextResponse } from 'next/server';
import { fetchNotionLeads } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Notion is not configured yet. Add NOTION_API_KEY and NOTION_DATABASE_ID in Vercel Environment Variables, then redeploy.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const leads = await fetchNotionLeads();
    return NextResponse.json(
      { success: true, leads },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    // Detailed error stays in server logs; do not leak integration details to visitors.
    console.error('MN Signal: Notion lead fetch failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Could not load leads from Notion. Check the integration token, database ID, database sharing permissions, and property setup in Vercel.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
