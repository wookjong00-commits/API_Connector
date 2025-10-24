// Seedream 4.0 API 통합
import axios from 'axios';
import { ApiKeyService, decryptApiKey } from '../db';

export interface SeedreamImageRequest {
  model?: string;
  prompt: string;
  negative_prompt?: string;
  image_url?: string[];
  mask?: string;
  width?: number;
  height?: number;
  size?: string; // 2K, 4K 등
  aspect_ratio?: string;
  num_images?: number;
  guidance_scale?: number;
  steps?: number;
  seed?: number;
  scheduler?: string;
  style_strength?: number;
  color_preserve?: boolean;
  contrast_enhance?: boolean;
  prompt_language?: string;
  response_format?: string;
  watermark?: boolean;
  output_type?: string;
  enable_face_beautify?: boolean;
  enable_artifact_fix?: boolean;
  sequential_image_generation?: string;
  stream?: boolean;
  metadata?: any;
}

export class SeedreamClient {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://ark.ap-southeast.bytepluses.com/api/v3';

  constructor() {
    this.initClient();
  }

  private initClient() {
    // 먼저 DB에서 API 키를 찾음
    const apiKey = ApiKeyService.getActive('seedream');
    if (apiKey) {
      try {
        this.apiKey = decryptApiKey(apiKey.encryptedKey);
        return;
      } catch (error) {
        console.error('Failed to decrypt Seedream API key from DB:', error);
      }
    }

    // DB에 없으면 환경 변수에서 직접 읽기 (Vercel 등 서버리스 환경 대응)
    if (process.env.SEEDREAM_API_KEY) {
      this.apiKey = process.env.SEEDREAM_API_KEY;
      console.log('Using Seedream API key from environment variable');
    }
  }

  // API 키를 다시 로드하는 메서드 (API 키가 추가/변경된 경우 사용)
  private refreshApiKey() {
    const apiKey = ApiKeyService.getActive('seedream');
    if (!apiKey) {
      this.apiKey = null;
      return;
    }

    try {
      this.apiKey = decryptApiKey(apiKey.encryptedKey);
    } catch (error) {
      console.error('Failed to refresh Seedream API key:', error);
      this.apiKey = null;
    }
  }

  async generateImage(request: SeedreamImageRequest) {
    // 매 요청마다 API 키를 다시 확인하여 최신 상태 유지
    this.refreshApiKey();

    if (!this.apiKey) {
      throw new Error('Seedream client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      // Seedream API 요청 바디 구성
      const requestBody: any = {
        model: request.model || 'seedream-4-0-250828', // 필수 파라미터
        prompt: request.prompt, // 필수 파라미터
      };

      // 선택적 파라미터 추가
      if (request.negative_prompt) requestBody.negative_prompt = request.negative_prompt;
      if (request.image_url) requestBody.image_url = request.image_url;
      if (request.mask) requestBody.mask = request.mask;
      if (request.size) requestBody.size = request.size;
      if (request.width) requestBody.width = request.width;
      if (request.height) requestBody.height = request.height;
      if (request.aspect_ratio) requestBody.aspect_ratio = request.aspect_ratio;
      if (request.num_images) requestBody.num_images = request.num_images;
      if (request.guidance_scale !== undefined) requestBody.guidance_scale = request.guidance_scale;
      if (request.steps) requestBody.steps = request.steps;
      if (request.seed) requestBody.seed = request.seed;
      if (request.scheduler) requestBody.scheduler = request.scheduler;
      if (request.style_strength !== undefined) requestBody.style_strength = request.style_strength;
      if (request.color_preserve !== undefined) requestBody.color_preserve = request.color_preserve;
      if (request.contrast_enhance !== undefined) requestBody.contrast_enhance = request.contrast_enhance;
      if (request.prompt_language) requestBody.prompt_language = request.prompt_language;
      if (request.response_format) requestBody.response_format = request.response_format;
      if (request.watermark !== undefined) requestBody.watermark = request.watermark;
      if (request.output_type) requestBody.output_type = request.output_type;
      if (request.enable_face_beautify !== undefined) requestBody.enable_face_beautify = request.enable_face_beautify;
      if (request.enable_artifact_fix !== undefined) requestBody.enable_artifact_fix = request.enable_artifact_fix;
      if (request.sequential_image_generation) requestBody.sequential_image_generation = request.sequential_image_generation;
      if (request.stream !== undefined) requestBody.stream = request.stream;
      if (request.metadata) requestBody.metadata = request.metadata;

      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        requestBody,
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

      // 더 상세한 에러 메시지 추출
      let errorMessage = 'Unknown error';
      if (error.response?.data) {
        // API가 에러 객체를 반환하는 경우
        if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string'
            ? error.response.data.error
            : error.response.data.error.message || JSON.stringify(error.response.data.error);
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  async upscaleImage(imageUrl: string, scaleFactor: number = 2) {
    // 매 요청마다 API 키를 다시 확인하여 최신 상태 유지
    this.refreshApiKey();

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
    // 최신 API 키 상태를 확인
    this.refreshApiKey();
    return this.apiKey !== null;
  }
}

export const seedreamClient = new SeedreamClient();
