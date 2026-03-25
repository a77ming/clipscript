import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, baseURL } = body;

    if (!apiKey || !baseURL) {
      return NextResponse.json(
        { error: 'Missing API key or base URL.' },
        { status: 400 }
      );
    }

    const normalizedURL = baseURL.trim().replace(/\/+$/, '');
    const apiBase = normalizedURL.endsWith('/v1') ? normalizedURL : `${normalizedURL}/v1`;

    const response = await fetch(`${apiBase}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch models: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const models = (data.data || []).map((m: any) => m.id).sort();

    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch models.' },
      { status: 500 }
    );
  }
}
