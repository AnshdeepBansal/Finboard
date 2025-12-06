import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get headers from query params
    const headersParam = searchParams.get('headers');
    const headers = headersParam ? JSON.parse(headersParam) : {};

    // Make the request server-side (no CORS restrictions)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers,
      },
      // Don't follow redirects automatically
      redirect: 'follow',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please try again later.',
            details: errorText,
            retryAfter: retryAfter ? parseInt(retryAfter, 10) : null,
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter || '60',
            },
          }
        );
      }
      
      // Handle other errors with better messages
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (response.status === 401) {
        errorMessage = 'Authentication failed. Please check your API credentials.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. You may not have permission to access this resource.';
      } else if (response.status === 404) {
        errorMessage = 'API endpoint not found. Please check the URL.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. The API is temporarily unavailable.';
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Try to parse as JSON anyway, fallback to text
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Response is not valid JSON', text },
          { status: 400 }
        );
      }
    }

    // Return the data with CORS headers to allow browser access
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, headers = {} } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Make the request server-side (no CORS restrictions)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers,
      },
      body: body.body ? JSON.stringify(body.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please try again later.',
            details: errorText,
            retryAfter: retryAfter ? parseInt(retryAfter, 10) : null,
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter || '60',
            },
          }
        );
      }
      
      // Handle other errors with better messages
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (response.status === 401) {
        errorMessage = 'Authentication failed. Please check your API credentials.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. You may not have permission to access this resource.';
      } else if (response.status === 404) {
        errorMessage = 'API endpoint not found. Please check the URL.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. The API is temporarily unavailable.';
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Try to parse as JSON anyway, fallback to text
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Response is not valid JSON', text },
          { status: 400 }
        );
      }
    }

    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
