// 연결 상태 확인 엔드포인트
import { NextResponse } from 'next/server';
import { ApiKeyAutoImportService } from '@/lib/auto-import';

export async function GET() {
  try {
    const status = ApiKeyAutoImportService.checkConnectionStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
