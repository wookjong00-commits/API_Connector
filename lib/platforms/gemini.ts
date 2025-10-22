// Google Gemini API 통합
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiKeyService, decryptApiKey } from '../db';

export interface GeminiTextRequest {
  model?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = ApiKeyService.getActive('gemini');
    if (!apiKey) {
      return;
    }

    try {
      const decryptedKey = decryptApiKey(apiKey.encryptedKey);
      this.client = new GoogleGenerativeAI(decryptedKey);
    } catch (error) {
      console.error('Failed to initialize Gemini client:', error);
    }
  }

  async generateText(request: GeminiTextRequest) {
    if (!this.client) {
      throw new Error('Gemini client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: request.model || 'gemini-pro',
      });

      const result = await model.generateContent(request.prompt);
      const response = await result.response;
      const text = response.text();

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          text,
          response,
        },
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  async generateTextWithImage(prompt: string, imageData: string) {
    if (!this.client) {
      throw new Error('Gemini client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-pro-vision',
      });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          text,
          response,
        },
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}

export const geminiClient = new GeminiClient();
