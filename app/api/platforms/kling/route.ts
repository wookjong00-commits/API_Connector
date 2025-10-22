// Kling AI API 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import { klingClient } from '@/lib/platforms/kling';
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
      case 'video':
        endpoint = '/v1/video/text-to-video';
        result = await klingClient.generateVideo(params);
        break;

      case 'status':
        endpoint = `/v1/video/task/${params.taskId}`;
        result = await klingClient.getTaskStatus(params.taskId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 사용 로그 저장
    UsageLogService.add({
      platform: 'kling',
      apiKeyId: 'default',
      endpoint,
      method: 'POST',
      statusCode: result.success ? 200 : 500,
      success: result.success,
      errorMessage: result.success ? undefined : result.error,
      duration: ('duration' in result ? result.duration : undefined) as number | undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
