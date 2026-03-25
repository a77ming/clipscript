import { Subtitle } from './srt-parser';
import { ReelScript } from './ai-analyzer';
import { DEFAULT_API_KEY, DEFAULT_BASE_URL, DEFAULT_MODEL } from './config';

export class ClientAIAnalyzer {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(
    apiKey?: string,
    baseURL?: string,
    model?: string
  ) {
    const getStoredValue = (key: string) => {
      if (typeof window === 'undefined') return '';
      try {
        return localStorage.getItem(key) || '';
      } catch {
        return '';
      }
    };

    const normalizeBaseURL = (url: string) => {
      const trimmed = url.trim().replace(/\/+$/, '');
      if (!trimmed) return '';
      if (trimmed.endsWith('/v1')) return trimmed;
      return `${trimmed}/v1`;
    };

    const storedApiKey = getStoredValue('openai_api_key');
    const storedBaseURL = getStoredValue('openai_base_url');
    const storedModel = getStoredValue('openai_model');

    this.apiKey = apiKey || storedApiKey || DEFAULT_API_KEY;
    this.baseURL = normalizeBaseURL(baseURL || storedBaseURL || DEFAULT_BASE_URL);
    this.model = model || storedModel || DEFAULT_MODEL;
  }

  async analyzeHighlights(
    subtitles: Subtitle[],
    synopsis: string,
    maxHighlights: number = 5,
    minDuration: number = 8,
    maxDuration: number = 15
  ): Promise<ReelScript[]> {
    const subtitleText = subtitles
      .map((sub) => `[${sub.start_time} - ${sub.end_time}] ${sub.text}`)
      .join('\n');

    const { generatePrompt } = await import('./prompts');
    const prompt = generatePrompt(synopsis, subtitleText, maxHighlights, minDuration, maxDuration);

    const extractJsonArray = (resultText: string) => {
      const jsonStart = resultText.indexOf('[');
      const jsonEnd = resultText.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = resultText.substring(jsonStart, jsonEnd);
        console.log('Extracted JSON length:', jsonString.length);
        try {
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (err) {
          console.error('Failed to parse JSON:', err);
        }
      }

      return [];
    };

    const buildSupplementPrompt = (existing: ReelScript[], missing: number) => {
      const existingTimes = existing
        .map((item) => `${item.start_time} - ${item.end_time}`)
        .filter(Boolean)
        .slice(0, 50)
        .join('\n');

      return `Return ${missing} more clip candidates.

Requirements:
1. Return only a JSON array with exactly ${missing} items.
2. Keep the same schema as the previous response.
3. Avoid duplicating these ranges unless absolutely necessary. If you reuse a range, justify it with a different editorial angle.

Existing ranges:
${existingTimes || '(none)'}

Creative brief:
${synopsis || '(No extra brief provided. Infer the strongest angle from the subtitles.)'}

Transcript:
${subtitleText}
`;
    };

    const callChat = async (promptText: string, maxTokens: number) => {
      console.log('Calling model API...');
      console.log('Base URL:', this.baseURL);
      console.log('Model:', this.model);

      const matchedModel = this.model;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: matchedModel,
          messages: [
            {
              role: 'system',
              content: 'You are an expert editor for short-form social clips. Return only useful, specific clip ideas with editorial value.',
            },
            { role: 'user', content: promptText },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });

      console.log('API status:', response.status);

      const rawText = await response.text();

      if (!response.ok) {
        console.error('API error response:', rawText);

        if (response.status === 401) {
          throw new Error('The API key is invalid or expired.');
        } else if (response.status === 429) {
          throw new Error('The provider rate-limited the request or the account has insufficient quota.');
        } else if (response.status === 500) {
          throw new Error('The model provider returned a server error.');
        }

        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      try {
        const data = JSON.parse(rawText);
        return data.choices?.[0]?.message?.content || '';
      } catch (err) {
        console.warn('Provider returned non-JSON payload, falling back to raw text parsing.');
        return rawText || '';
      }
    };

    try {
      const baseTokens = Math.min(6000, 1200 + maxHighlights * 350);
      let resultText = await callChat(prompt, baseTokens);
      console.log('API response received. Parsing clip ideas...');

      let reelScripts = extractJsonArray(resultText);
      console.log('Parsed clip count:', reelScripts.length);

      let attempts = 2;
      while (reelScripts.length < maxHighlights && attempts > 0) {
        const missing = maxHighlights - reelScripts.length;
        console.warn(`Not enough clips returned. Requesting ${missing} more...`);

        const supplementPrompt = buildSupplementPrompt(reelScripts, missing);
        const supplementTokens = Math.min(4000, 800 + missing * 350);
        const supplementText = await callChat(supplementPrompt, supplementTokens);
        const supplementScripts = extractJsonArray(supplementText);

        if (supplementScripts.length > 0) {
          reelScripts = reelScripts.concat(supplementScripts);
          console.log('Clip count after supplement:', reelScripts.length);
        }

        attempts -= 1;
      }

      if (reelScripts.length < maxHighlights) {
        throw new Error(`The model returned too few clip candidates: expected ${maxHighlights}, got ${reelScripts.length}. Retry or lower the clip count.`);
      }

      if (reelScripts.length > maxHighlights) {
        reelScripts = reelScripts.slice(0, maxHighlights);
      }

      return reelScripts;
    } catch (error: any) {
      console.error('AI analysis failed:', {
        message: error.message,
        stack: error.stack,
      });

      if (error.message) {
        throw error;
      }

      throw new Error(`AI analysis failed: ${error.message || 'Unknown error'}`);
    }
  }
}
