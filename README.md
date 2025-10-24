# AI Platform API Hub

다양한 AI 플랫폼의 API를 통합 관리할 수 있는 웹 애플리케이션입니다.

## 지원 플랫폼

- **OpenAI**: GPT-4, GPT-3.5, DALL-E 3/2, Whisper
- **Google Gemini**: Gemini Pro, Gemini Pro Vision
- **Google Veo 3.1**: AI 비디오 생성 (최대 60초, 1080p)
- **Kling AI**: 텍스트/이미지에서 비디오 생성
- **Seedream 4.0**: ByteDance의 4K AI 이미지 생성

## 주요 기능

- API 키 안전 관리 (암호화 저장)
- 통합 API 인터페이스
- 실시간 API 테스트 플레이그라운드
- 사용량 로그 및 추적
- 응답 시간 모니터링

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: JSON 기반 파일 저장소
- **AI SDK**:
  - OpenAI SDK
  - Google Generative AI SDK
  - Axios (Kling, Seedream, Veo)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY="your-secret-encryption-key-change-this-in-production"
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. API 키 추가

**방법 1: 자동 연결 (권장)**

1. `.env` 파일에 API 키를 입력:
   ```env
   OPENAI_API_KEY=sk-...
   GOOGLE_API_KEY=AI...
   KLING_API_KEY=...
   SEEDREAM_API_KEY=...
   AUTO_IMPORT_API_KEYS=true
   ```

2. [http://localhost:3000/setup](http://localhost:3000/setup)로 이동하여 "자동 연결 시작" 클릭
3. 또는 설정 페이지에서 "⚡ 환경 변수에서 자동 연결" 버튼 클릭

**방법 2: 수동 입력**

1. [http://localhost:3000/settings](http://localhost:3000/settings)로 이동
2. 각 플랫폼의 API 키를 추가
3. [http://localhost:3000/playground](http://localhost:3000/playground)에서 테스트

## 프로젝트 구조

```
API_Connector/
├── app/
│   ├── api/
│   │   ├── keys/          # API 키 관리 엔드포인트
│   │   └── platforms/     # 각 플랫폼별 API 엔드포인트
│   ├── settings/          # API 키 관리 페이지
│   ├── playground/        # API 테스트 인터페이스
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts             # JSON 데이터베이스 유틸리티
│   └── platforms/        # 각 플랫폼별 클라이언트
│       ├── openai.ts
│       ├── gemini.ts
│       ├── veo.ts
│       ├── kling.ts
│       └── seedream.ts
├── data/
│   └── db.json           # API 키 및 로그 저장소
└── prisma/
    └── schema.prisma     # 데이터베이스 스키마 (향후 마이그레이션용)
```

## 주요 페이지

- **홈 (`/`)**: 지원 플랫폼 개요 및 빠른 링크
- **초기 설정 마법사 (`/setup`)**: 환경 변수에서 API 키 자동 연결
- **API 키 관리 (`/settings`)**: API 키 수동 추가/수정/삭제
- **Playground (`/playground`)**: 실시간 API 테스트 인터페이스

## API 엔드포인트

### API 키 관리

- `GET /api/keys` - 모든 API 키 조회
- `POST /api/keys` - 새 API 키 추가
- `PATCH /api/keys` - API 키 업데이트
- `DELETE /api/keys?id={id}` - API 키 삭제

### 자동 연결

- `GET /api/auto-import` - 환경 변수에서 API 키 자동 가져오기
- `POST /api/auto-import` - JSON 데이터로 일괄 가져오기
- `GET /api/connection-status` - 플랫폼별 연결 상태 확인

### 플랫폼 호출

- `POST /api/platforms/openai` - OpenAI API 호출
- `POST /api/platforms/gemini` - Google Gemini API 호출
- `POST /api/platforms/veo` - Google Veo API 호출
- `POST /api/platforms/kling` - Kling AI API 호출
- `POST /api/platforms/seedream` - Seedream API 호출

## Vercel 배포

### 환경 변수 설정 (필수)

Vercel과 같은 서버리스 환경에서는 파일 시스템이 읽기 전용이므로, 반드시 환경 변수로 API 키를 설정해야 합니다.

1. Vercel 프로젝트 대시보드로 이동
2. **Settings** → **Environment Variables** 클릭
3. 다음 환경 변수를 추가:

```
ENCRYPTION_KEY=your-strong-encryption-key-here
SEEDREAM_API_KEY=your-seedream-api-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
KLING_API_KEY=your-kling-api-key
```

4. **Save** 클릭 후 프로젝트 재배포

### 주의사항

- Vercel에서는 `/tmp` 디렉토리만 쓰기 가능하지만, 요청마다 초기화됩니다
- 따라서 API 키를 UI에서 추가해도 저장되지 않습니다
- **반드시 환경 변수를 사용하세요**
- 환경 변수가 설정되면 자동으로 API 키가 로드됩니다

## 보안

- API 키는 AES-256-CBC 암호화로 저장됩니다 (로컬 개발 환경)
- Vercel 등 서버리스 환경에서는 환경 변수로 직접 관리됩니다
- 암호화 키는 환경 변수로 관리됩니다
- 프로덕션 환경에서는 강력한 암호화 키를 사용하세요

## API 키 발급 방법

### OpenAI
[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Google Gemini
[https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Google Veo 3.1
Google Gemini API를 통해 접근 (동일한 API 키 사용)

### Kling AI
- 공식: [https://app.klingai.com/](https://app.klingai.com/)
- 서드파티: PiAPI, UseAPI 등

### Seedream 4.0
- BytePlus: [https://console.byteplus.com/](https://console.byteplus.com/)
- 서드파티: Kie.ai, CometAPI 등

## 라이선스

MIT

## 기여

이슈 및 풀 리퀘스트를 환영합니다!
