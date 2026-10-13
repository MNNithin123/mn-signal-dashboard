import { NextRequest, NextResponse } from 'next/server';

/**
 * Demo mode is public when no Notion variables are configured.
 * Once either Notion variable is added, require HTTP Basic Auth for the whole
 * app so the dashboard and its API are not exposed publicly by accident.
 * This is a simple single-workspace gate, not multi-user authentication.
 */
export function middleware(request: NextRequest) {
  const notionConfigured = Boolean(
    process.env.NOTION_API_KEY || process.env.NOTION_DATABASE_ID,
  );

  if (!notionConfigured) {
    return NextResponse.next();
  }

  const username = process.env.DASHBOARD_USERNAME;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!username || !password) {
    return new NextResponse(
      'Live Notion mode is configured, but dashboard access is not. Set DASHBOARD_USERNAME and DASHBOARD_PASSWORD in Vercel Environment Variables, then redeploy.',
      {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      },
    );
  }

  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Basic ')) {
    try {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(':');
      const suppliedUsername = separator >= 0 ? decoded.slice(0, separator) : '';
      const suppliedPassword = separator >= 0 ? decoded.slice(separator + 1) : '';

      if (suppliedUsername === username && suppliedPassword === password) {
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store');
        return response;
      }
    } catch {
      // Malformed credentials are handled as an authentication failure below.
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="MN Signal Dashboard", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
