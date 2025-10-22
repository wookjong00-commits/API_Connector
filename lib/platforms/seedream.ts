// Seedream 4.0 API 통합
import axios from 'axios';
import { ApiKeyService, decryptApiKey } from '../db';

export interface SeedreamImageRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  guidanceScale?: number;
}

export class SeedreamClient {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.kie.ai/v1'; // Kie.ai 사용 예시

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = ApiKeyService.getActive('seedream');
    if (!apiKey) {
      return;
    }

    try {
      this.apiKey = decryptApiKey(apiKey.encryptedKey);
    } catch (error) {
      console.error('Failed to initialize Seedream client:', error);
    }
  }

  async generateImage(request: SeedreamImageRequest) {
    if (!this.apiKey) {
      throw new Error('Seedream client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const response = await axios.post(
        `${this.baseUrl}/seedream/generate`,
        {
          prompt: request.prompt,
          negative_prompt: request.negativePrompt || '',
          width: request.width || 1024,
          height: request.height || 1024,
          num_images: request.numImages || 1,
          guidance_scale: request.guidanceScale || 7.5,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: response.data,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        duration,
      };
    }
  }

  async upscaleImage(imageUrl: string, scaleFactor: number = 2) {
    if (!this.apiKey) {
      throw new Error('Seedream client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const response = await axios.post(
        `${this.baseUrl}/seedream/upscale`,
        {
          image_url: imageUrl,
          scale_factor: scaleFactor,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: response.data,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        duration,
      };
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }
}

export const seedreamClient = new SeedreamClient();
