// Seedream API 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import { seedreamClient } from '@/lib/platforms/seedream';
import { UsageLogService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;
    let endpoint = '';

    switch (action) {
      case 'image':
        endpoint = '/seedream/generate';
        result = await seedreamClient.generateImage(params);
        break;

      case 'upscale':
        endpoint = '/seedream/upscale';
        result = await seedreamClient.upscaleImage(params.imageUrl, params.scaleFactor);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 사용 로그 저장
    UsageLogService.add({
      platform: 'seedream',
      apiKeyId: 'default',
      endpoint,
      method: 'POST',
      statusCode: result.success ? 200 : 500,
      success: result.success,
      errorMessage: result.success ? undefined : result.error,
      duration: result.duration,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
