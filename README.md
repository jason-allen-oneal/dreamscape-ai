This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

This project supports **two AI providers** with flexible configuration:
- **Google Gemini** (default) - Free tier available
- **OpenAI** (optional) - Pay-as-you-go pricing

### Required Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. **Option A: Using Google Gemini (Free)**
   
   Get a **free** Gemini API key from [Google AI Studio](https://ai.google.dev/)
   
   Update `.env.local`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_api_key_here
   GEN_MODEL=gemini-1.5-flash
   ```

3. **Option B: Using OpenAI (Paid)**
   
   Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   
   Update `.env.local`:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   ```

### AI Provider Comparison

#### Google Gemini (Default)
- ✅ **Text generation (Gemini 1.5 Flash)**: FREE with generous limits
  - 15 requests per minute
  - 1 million tokens per minute
  - 1,500 requests per day
- ❌ Video generation (Veo) - Disabled (expensive)
- ❌ Image generation (Imagen) - Disabled (expensive)
- ❌ Music generation (Lyria) - Disabled (expensive)

#### OpenAI (Optional)
- ✅ **Text generation (GPT-4o-mini)**: Pay-as-you-go (~$0.15/1M input tokens)
- ✅ **Image generation (DALL-E 3)**: Optional ($0.04-$0.08 per image)
- ❌ Video generation - Not supported
- ❌ Music generation - Not supported

### Cost-Saving Measures

To keep costs minimal, expensive media generation features are disabled by default.
The application focuses on text-based dream analysis and descriptions, which work excellently with both providers.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
