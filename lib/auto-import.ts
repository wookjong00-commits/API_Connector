// API 키 자동 연결 서비스
import { ApiKeyService } from './db';

export interface AutoImportResult {
  platform: string;
  success: boolean;
  message: string;
}

export class ApiKeyAutoImportService {
  /**
   * 환경 변수에서 API 키를 읽어와 자동으로 등록
   */
  static async importFromEnv(): Promise<AutoImportResult[]> {
    const results: AutoImportResult[] = [];

    // 자동 임포트 활성화 여부 확인
    if (process.env.AUTO_IMPORT_API_KEYS !== 'true') {
      console.log('API 키 자동 연결이 비활성화되어 있습니다.');
      return results;
    }

    const envMappings = [
      { platform: 'openai', envKey: 'OPENAI_API_KEY', displayName: 'OpenAI' },
      { platform: 'gemini', envKey: 'GOOGLE_API_KEY', displayName: 'Google Gemini' },
      { platform: 'veo', envKey: 'GOOGLE_API_KEY', displayName: 'Google Veo' },
      { platform: 'kling', envKey: 'KLING_API_KEY', displayName: 'Kling AI' },
      { platform: 'seedream', envKey: 'SEEDREAM_API_KEY', displayName: 'Seedream' },
    ];

    for (const mapping of envMappings) {
      const apiKey = process.env[mapping.envKey];

      if (!apiKey || apiKey.trim() === '') {
        results.push({
          platform: mapping.platform,
          success: false,
          message: `${mapping.displayName}: 환경 변수에 API 키가 없습니다.`,
        });
        continue;
      }

      try {
        // 이미 등록된 키가 있는지 확인
        const existingKey = ApiKeyService.getActive(mapping.platform);

        if (existingKey) {
          results.push({
            platform: mapping.platform,
            success: true,
            message: `${mapping.displayName}: 이미 등록된 API 키가 있습니다. 건너뜁니다.`,
          });
          continue;
        }

        // 새 API 키 등록
        ApiKeyService.add(
          mapping.platform,
          apiKey.trim(),
          `Auto-imported from ENV (${mapping.envKey})`
        );

        results.push({
          platform: mapping.platform,
          success: true,
          message: `${mapping.displayName}: API 키가 성공적으로 등록되었습니다.`,
        });

        console.log(`✓ ${mapping.displayName} API 키가 자동으로 연결되었습니다.`);
      } catch (error: any) {
        results.push({
          platform: mapping.platform,
          success: false,
          message: `${mapping.displayName}: 등록 실패 - ${error.message}`,
        });
        console.error(`✗ ${mapping.displayName} API 키 등록 실패:`, error.message);
      }
    }

    return results;
  }

  /**
   * JSON 파일에서 API 키 일괄 가져오기
   */
  static async importFromJSON(jsonData: {
    [platform: string]: { apiKey: string; keyName?: string };
  }): Promise<AutoImportResult[]> {
    const results: AutoImportResult[] = [];

    for (const [platform, data] of Object.entries(jsonData)) {
      try {
        if (!data.apiKey || data.apiKey.trim() === '') {
          results.push({
            platform,
            success: false,
            message: `${platform}: API 키가 비어있습니다.`,
          });
          continue;
        }

        // 기존 키를 비활성화하고 새 키 추가
        const existingKey = ApiKeyService.getActive(platform);
        if (existingKey) {
          ApiKeyService.update(existingKey.id, { isActive: false });
        }

        ApiKeyService.add(platform, data.apiKey.trim(), data.keyName || 'Imported from JSON');

        results.push({
          platform,
          success: true,
          message: `${platform}: API 키가 성공적으로 등록되었습니다.`,
        });
      } catch (error: any) {
        results.push({
          platform,
          success: false,
          message: `${platform}: 등록 실패 - ${error.message}`,
        });
      }
    }

    return results;
  }

  /**
   * 모든 API 키를 JSON 형식으로 내보내기 (암호화된 상태)
   */
  static exportToJSON(): { [platform: string]: { keyPreview: string; keyName?: string; isActive: boolean } } {
    const allKeys = ApiKeyService.getAll();
    const exportData: { [platform: string]: { keyPreview: string; keyName?: string; isActive: boolean } } = {};

    for (const key of allKeys) {
      exportData[key.platform] = {
        keyPreview: key.encryptedKey.slice(0, 20) + '...',
        keyName: key.keyName,
        isActive: key.isActive,
      };
    }

    return exportData;
  }

  /**
   * 플랫폼별 연결 상태 확인
   */
  static checkConnectionStatus(): {
    platform: string;
    connected: boolean;
    keyName?: string;
  }[] {
    const platforms = ['openai', 'gemini', 'veo', 'kling', 'seedream'];
    const status = [];

    for (const platform of platforms) {
      const key = ApiKeyService.getActive(platform);
      status.push({
        platform,
        connected: !!key,
        keyName: key?.keyName,
      });
    }

    return status;
  }
}
