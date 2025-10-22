// API 키 자동 연결 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyAutoImportService } from '@/lib/auto-import';

// GET: 환경 변수에서 자동 연결
export async function GET() {
  try {
    const results = await ApiKeyAutoImportService.importFromEnv();

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: JSON 데이터로 일괄 가져오기
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.keys || typeof body.keys !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid keys format' },
        { status: 400 }
      );
    }

    const results = await ApiKeyAutoImportService.importFromJSON(body.keys);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
