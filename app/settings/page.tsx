'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiKey {
  id: string;
  platform: string;
  keyName?: string;
  isActive: boolean;
  createdAt: string;
  keyPreview: string;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'openai',
    apiKey: '',
    keyName: '',
  });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ platform: 'openai', apiKey: '', keyName: '' });
        setShowAddForm(false);
        fetchKeys();
      } else {
        alert('Failed to add API key: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to add key:', error);
      alert('Failed to add API key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/keys?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchKeys();
      } else {
        alert('Failed to delete API key: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete key:', error);
      alert('Failed to delete API key');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      const data = await response.json();

      if (data.success) {
        fetchKeys();
      } else {
        alert('Failed to update API key: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to update key:', error);
      alert('Failed to update API key');
    }
  };

  const platformNames: Record<string, string> = {
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    veo: 'Google Veo 3.1',
    kling: 'Kling AI',
    seedream: 'Seedream 4.0',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">API 키 관리</h1>
              <p className="text-gray-400 mt-2">각 플랫폼의 API 키를 안전하게 관리하세요</p>
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
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold"
          >
            + 새 API 키 추가
          </button>
        </div>

        {showAddForm && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">API 키 추가</h2>
            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">플랫폼</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="veo">Google Veo 3.1</option>
                  <option value="kling">Kling AI</option>
                  <option value="seedream">Seedream 4.0</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">API 키</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">키 이름 (선택사항)</label>
                <input
                  type="text"
                  value={formData.keyName}
                  onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                  placeholder="예: Production Key"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">로딩 중...</div>
        ) : keys.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-12 border border-gray-700 text-center">
            <p className="text-gray-400 text-lg">등록된 API 키가 없습니다.</p>
            <p className="text-gray-500 mt-2">위의 버튼을 클릭하여 첫 번째 API 키를 추가하세요.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {keys.map((key) => (
              <div
                key={key.id}
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {platformNames[key.platform] || key.platform}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          key.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {key.keyName && (
                      <p className="text-gray-400 text-sm mb-1">{key.keyName}</p>
                    )}
                    <p className="text-gray-500 text-sm font-mono">{key.keyPreview}</p>
                    <p className="text-gray-600 text-xs mt-2">
                      생성: {new Date(key.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(key.id, key.isActive)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      {key.isActive ? '비활성화' : '활성화'}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
