import OpenAI from 'openai';
import { Subtitle } from './srt-parser';
import { generatePrompt } from './prompts';
import { DEFAULT_BASE_URL, DEFAULT_MODEL } from './config';

export interface ReelScript {
  title: string;
  hook_subtitle: string;
  start_time: string;
  end_time: string;
  cut_sequence: string;
  scene_descriptions: string[];
  subtitle_strategy: {
    original_subtitles: string[];
    info_captions?: string[];
    emphasis_elements?: string[];
    new_subtitles_voiceover?: string;
  };
  voiceover_script?: string;
  voiceover_style?: string;
  editing_direction: string;
  originality_elements?: string[];
  target_emotion?: string;
  reason: string;
}

export class AIAnalyzer {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, baseURL: string = DEFAULT_BASE_URL, model: string = DEFAULT_MODEL) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });
    this.model = model;
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

    const prompt = generatePrompt(
      synopsis,
      subtitleText,
      maxHighlights,
      minDuration,
      maxDuration
    );

    try {
      console.log('Calling model API...');
      console.log('Base URL:', this.client.baseURL);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert editor for short-form social clips. Return only clip ideas with strong editorial value and valid JSON-compatible content.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 6000,
      });

      console.log('API response received. Parsing clip ideas...');

      const resultText = response.choices[0].message.content || '';
      console.log('Response length:', resultText.length);

      const jsonStart = resultText.indexOf('[');
      const jsonEnd = resultText.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = resultText.substring(jsonStart, jsonEnd);
        console.log('Extracted JSON length:', jsonString.length);

        const reelScripts = JSON.parse(jsonString);
        console.log('Parsed clip count:', reelScripts.length);
        return reelScripts;
      }

      console.error('No valid JSON array found in model response.');
      return [];
    } catch (error: any) {
      console.error('AI analysis failed:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack,
      });

      if (error.status === 401) {
        throw new Error('The API key is invalid or expired. Check your provider settings and try again.');
      } else if (error.status === 429) {
        throw new Error('The provider rate-limited the request or the account has insufficient quota.');
      } else if (error.status === 500) {
        throw new Error('The model provider returned a server error. Try again in a moment.');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('The configured API host could not be resolved. Check the base URL and your network connection.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('The configured API endpoint refused the connection.');
      } else if (error instanceof SyntaxError) {
        throw new Error('The provider returned malformed JSON. Try fewer clips or a narrower duration range.');
      }

      console.error('Full error object:', JSON.stringify(error, null, 2));

      throw new Error(`AI analysis failed: ${error.message || 'Unknown error'} (code: ${error.code || 'N/A'}, status: ${error.status || 'N/A'})`);
    }
  }
}
