'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlaygroundPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('openai');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // OpenAI
  const [openaiAction, setOpenaiAction] = useState<'chat' | 'image'>('chat');
  const [openaiPrompt, setOpenaiPrompt] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4');

  // Gemini
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-pro');

  // Kling
  const [klingPrompt, setKlingPrompt] = useState('');
  const [klingDuration, setKlingDuration] = useState(5);

  // Seedream
  const [seedreamPrompt, setSeedreamPrompt] = useState('');
  const [seedreamWidth, setSeedreamWidth] = useState(1024);
  const [seedreamHeight, setSeedreamHeight] = useState(1024);

  // Veo
  const [veoPrompt, setVeoPrompt] = useState('');
  const [veoDuration, setVeoDuration] = useState(10);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      let endpoint = '';
      let body: any = {};

      switch (selectedPlatform) {
        case 'openai':
          endpoint = '/api/platforms/openai';
          body = {
            action: openaiAction,
            prompt: openaiPrompt,
            model: openaiModel,
          };
          break;

        case 'gemini':
          endpoint = '/api/platforms/gemini';
          body = {
            action: 'text',
            prompt: geminiPrompt,
            model: geminiModel,
          };
          break;

        case 'kling':
          endpoint = '/api/platforms/kling';
          body = {
            action: 'video',
            prompt: klingPrompt,
            duration: klingDuration,
          };
          break;

        case 'seedream':
          endpoint = '/api/platforms/seedream';
          body = {
            action: 'image',
            prompt: seedreamPrompt,
            width: seedreamWidth,
            height: seedreamHeight,
          };
          break;

        case 'veo':
          endpoint = '/api/platforms/veo';
          body = {
            action: 'video',
            prompt: veoPrompt,
            duration: veoDuration,
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to call API:', error);
      setResult({ success: false, error: 'Failed to call API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">API Playground</h1>
              <p className="text-gray-400 mt-2">각 AI 플랫폼을 테스트해보세요</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 플랫폼 선택 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-4">플랫폼 선택</h2>
              <div className="space-y-2">
                {[
                  { id: 'openai', name: 'OpenAI', icon: '🤖' },
                  { id: 'gemini', name: 'Google Gemini', icon: '✨' },
                  { id: 'veo', name: 'Google Veo 3.1', icon: '🎬' },
                  { id: 'kling', name: 'Kling AI', icon: '🎥' },
                  { id: 'seedream', name: 'Seedream 4.0', icon: '🖼️' },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedPlatform === platform.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">테스트 파라미터</h2>

              {selectedPlatform === 'openai' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">액션</label>
                    <select
                      value={openaiAction}
                      onChange={(e) => setOpenaiAction(e.target.value as 'chat' | 'image')}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="chat">텍스트 생성 (Chat)</option>
                      <option value="image">이미지 생성 (DALL-E)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">모델</label>
                    <select
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="dall-e-3">DALL-E 3</option>
                      <option value="dall-e-2">DALL-E 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={openaiPrompt}
                      onChange={(e) => setOpenaiPrompt(e.target.value)}
                      placeholder="프롬프트를 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                </div>
              )}

              {selectedPlatform === 'gemini' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">모델</label>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={geminiPrompt}
                      onChange={(e) => setGeminiPrompt(e.target.value)}
                      placeholder="프롬프트를 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                </div>
              )}

              {selectedPlatform === 'kling' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={klingPrompt}
                      onChange={(e) => setKlingPrompt(e.target.value)}
                      placeholder="비디오 설명을 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">길이 (초)</label>
                    <select
                      value={klingDuration}
                      onChange={(e) => setKlingDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value={5}>5초</option>
                      <option value={10}>10초</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedPlatform === 'seedream' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={seedreamPrompt}
                      onChange={(e) => setSeedreamPrompt(e.target.value)}
                      placeholder="이미지 설명을 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">너비</label>
                      <input
                        type="number"
                        value={seedreamWidth}
                        onChange={(e) => setSeedreamWidth(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">높이</label>
                      <input
                        type="number"
                        value={seedreamHeight}
                        onChange={(e) => setSeedreamHeight(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatform === 'veo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={veoPrompt}
                      onChange={(e) => setVeoPrompt(e.target.value)}
                      placeholder="비디오 설명을 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">길이 (초)</label>
                    <input
                      type="number"
                      value={veoDuration}
                      onChange={(e) => setVeoDuration(Number(e.target.value))}
                      min={5}
                      max={60}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
              >
                {loading ? '처리 중...' : '실행'}
              </button>
            </div>

            {/* 결과 */}
            {result && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">결과</h2>
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? '성공' : '실패'}
                    </span>
                    {result.duration && (
                      <span className="text-gray-400 text-sm">
                        ({result.duration}ms)
                      </span>
                    )}
                  </div>
                  <pre className="text-gray-300 text-sm overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
