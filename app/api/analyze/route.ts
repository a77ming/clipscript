import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MODEL } from '@/lib/config';
import { generatePrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, baseURL, model, subtitles, synopsis, maxHighlights, minDuration, maxDuration } = body;

    if (!apiKey || !baseURL) {
      return NextResponse.json(
        { error: 'Missing API key or base URL.' },
        { status: 400 }
      );
    }

    const subtitleText = subtitles
      .map((sub: any) => `[${sub.start_time} - ${sub.end_time}] ${sub.text}`)
      .join('\n');

    const prompt = generatePrompt(
      synopsis || '',
      subtitleText,
      maxHighlights,
      minDuration,
      maxDuration
    );

    const normalizedURL = baseURL.trim().replace(/\/+$/, '');
    const apiBase = normalizedURL.endsWith('/v1') ? normalizedURL : `${normalizedURL}/v1`;

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert editor for short-form social clips. Return only a valid JSON array and obey the requested clip count exactly.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AI API error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json/, '').replace(/```$/, '');
    }
    if (content.startsWith('```')) {
      content = content.replace(/^```/, '').replace(/```$/, '');
    }
    content = content.trim();

    let reelScripts: any[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        reelScripts = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error('Failed to parse JSON:', parseErr, 'raw content:', content);
    }

    if (!Array.isArray(reelScripts) || reelScripts.length < maxHighlights) {
      console.log(`AI returned ${reelScripts.length} clips, need ${maxHighlights}. Requesting more...`);

      const missing = maxHighlights - (reelScripts?.length || 0);
      if (missing > 0 && reelScripts.length > 0) {
        const supplementPrompt = `Return ${missing} more clip candidates.

${reelScripts.map((r: any) => `${r.start_time} - ${r.end_time}`).join('\n')}

Avoid duplicating those exact ranges when possible. Each clip must be between ${minDuration} and ${maxDuration} seconds.

Return only a JSON array with exactly ${missing} items.`;

        const supplementResponse = await fetch(`${apiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: model || DEFAULT_MODEL,
            messages: [
              { role: 'system', content: 'Return only a valid JSON array.' },
              { role: 'user', content: supplementPrompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (supplementResponse.ok) {
          const supplementData = await supplementResponse.json();
          let supplementContent = supplementData.choices?.[0]?.message?.content || '';
          supplementContent = supplementContent.trim();

          try {
            const supplementMatch = supplementContent.match(/\[[\s\S]*\]/);
            if (supplementMatch) {
              const supplementScripts = JSON.parse(supplementMatch[0]);
              if (Array.isArray(supplementScripts)) {
                reelScripts = [...reelScripts, ...supplementScripts];
              }
            }
          } catch (e) {
            console.error('Failed to parse supplemental clips:', e);
          }
        }
      }
    }

    if (reelScripts.length > maxHighlights) {
      reelScripts = reelScripts.slice(0, maxHighlights);
    }

    if (!reelScripts || reelScripts.length === 0) {
      return NextResponse.json(
        { error: 'AI did not produce any usable clip candidates. Please retry with a stronger brief or different constraints.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reelScripts, count: reelScripts.length });
  } catch (error: any) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed.' },
      { status: 500 }
    );
  }
}
