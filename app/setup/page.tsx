'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConnectionStatus {
  platform: string;
  connected: boolean;
  keyName?: string;
}

interface AutoImportResult {
  platform: string;
  success: boolean;
  message: string;
}

export default function SetupWizardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus[]>([]);
  const [autoImportResults, setAutoImportResults] = useState<AutoImportResult[]>([]);

  // 연결 상태 확인
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/connection-status');
      const data = await response.json();
      if (data.success) {
        setConnectionStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // 환경 변수에서 자동 연결
  const handleAutoImport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auto-import');
      const data = await response.json();

      if (data.success) {
        setAutoImportResults(data.data);
        setStep(3);
        await checkConnectionStatus();
      } else {
        alert('자동 연결 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to auto-import:', error);
      alert('자동 연결 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const platformNames: Record<string, string> = {
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    veo: 'Google Veo 3.1',
    kling: 'Kling AI',
    seedream: 'Seedream 4.0',
  };

  const platformIcons: Record<string, string> = {
    openai: '🤖',
    gemini: '✨',
    veo: '🎬',
    kling: '🎥',
    seedream: '🖼️',
  };

  const connectedCount = connectionStatus.filter(s => s.connected).length;
  const totalPlatforms = connectionStatus.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">초기 설정 마법사</h1>
              <p className="text-gray-400 mt-2">API 키를 빠르게 연결하세요</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              건너뛰기
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                1
              </div>
              <span className="ml-2 text-gray-300">방법 선택</span>
            </div>
            <div className="w-16 h-1 bg-gray-700"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 text-gray-300">API 키 연결</span>
            </div>
            <div className="w-16 h-1 bg-gray-700"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                3
              </div>
              <span className="ml-2 text-gray-300">완료</span>
            </div>
          </div>
        </div>

        {/* Step 1: 방법 선택 */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">API 키 연결 방법을 선택하세요</h2>
              <p className="text-gray-400 mb-6">
                환경 변수를 통한 자동 연결 또는 수동 입력 중 선택할 수 있습니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-blue-500 transition-colors">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold text-white mb-2">자동 연결</h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    .env 파일에 API 키를 입력하면 자동으로 연결됩니다.
                  </p>
                  <ol className="text-gray-400 text-sm space-y-2 mb-4">
                    <li>1. .env 파일을 엽니다</li>
                    <li>2. 각 플랫폼의 API 키를 입력합니다</li>
                    <li>3. AUTO_IMPORT_API_KEYS=true 설정</li>
                    <li>4. 아래 버튼을 클릭합니다</li>
                  </ol>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold"
                  >
                    자동 연결 시작
                  </button>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-green-500 transition-colors">
                  <div className="text-4xl mb-4">✍️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">수동 입력</h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    설정 페이지에서 직접 API 키를 입력합니다.
                  </p>
                  <ol className="text-gray-400 text-sm space-y-2 mb-4">
                    <li>1. 각 플랫폼에서 API 키 발급</li>
                    <li>2. 설정 페이지로 이동</li>
                    <li>3. 플랫폼별로 API 키 입력</li>
                    <li>4. 저장 후 테스트</li>
                  </ol>
                  <Link
                    href="/settings"
                    className="block w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-semibold text-center"
                  >
                    설정 페이지로 이동
                  </Link>
                </div>
              </div>
            </div>

            {/* 현재 연결 상태 */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                현재 연결 상태 ({connectedCount}/{totalPlatforms})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {connectionStatus.map((status) => (
                  <div
                    key={status.platform}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      status.connected
                        ? 'bg-green-900/20 border border-green-700'
                        : 'bg-gray-700/30 border border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{platformIcons[status.platform]}</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {platformNames[status.platform]}
                      </div>
                      <div className={`text-xs ${
                        status.connected ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        {status.connected ? '연결됨' : '연결 안됨'}
                      </div>
                    </div>
                    {status.connected && (
                      <div className="text-green-400">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 자동 연결 실행 */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">환경 변수에서 API 키 가져오기</h2>
              <p className="text-gray-400 mb-6">
                .env 파일에 설정된 API 키를 자동으로 연결합니다.
              </p>

              <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm mb-2">예시 .env 파일:</p>
                <pre className="text-green-400 text-xs overflow-x-auto">
{`OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AI...
KLING_API_KEY=...
SEEDREAM_API_KEY=...
AUTO_IMPORT_API_KEYS=true`}
                </pre>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAutoImport}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
                >
                  {loading ? '연결 중...' : '자동 연결 시작'}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  이전
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 결과 */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 mb-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-white mb-2">자동 연결 완료!</h2>
                <p className="text-gray-400">
                  {autoImportResults.filter(r => r.success).length}개의 API 키가 성공적으로 연결되었습니다.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {autoImportResults.map((result) => (
                  <div
                    key={result.platform}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      result.success
                        ? 'bg-green-900/20 border border-green-700'
                        : 'bg-red-900/20 border border-red-700'
                    }`}
                  >
                    <span className="text-xl">
                      {platformIcons[result.platform]}
                    </span>
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">
                        {platformNames[result.platform]}
                      </div>
                      <div className={`text-sm ${
                        result.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result.message}
                      </div>
                    </div>
                    <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                      {result.success ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link
                  href="/playground"
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-semibold text-center"
                >
                  Playground에서 테스트
                </Link>
                <Link
                  href="/settings"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  설정 관리
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  홈으로
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
