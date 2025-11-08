# OpenAI Integration Guide

This document explains how to use OpenAI as an alternative AI provider for the DreamScape AI application.

## Overview

DreamScape AI now supports two AI providers:
- **Google Gemini** (default) - Free tier available
- **OpenAI** (optional) - Pay-as-you-go pricing

You can switch between providers by setting the `AI_PROVIDER` environment variable.

## Setup Instructions

### 1. Get an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (you won't be able to see it again!)

### 2. Configure Environment Variables

Edit your `.env.local` file and add:

```env
# Set OpenAI as the provider
AI_PROVIDER=openai

# Add your OpenAI API key
OPENAI_API_KEY=sk-...your-key-here...

# Optional: Specify models (defaults shown)
OPENAI_MODEL=gpt-4o-mini           # For text generation
OPENAI_IMAGE_MODEL=dall-e-3         # For image generation
```

### 3. Install Dependencies

The OpenAI SDK is already included. Just run:

```bash
npm install
```

### 4. Start the Application

```bash
npm run dev
```

## Features Comparison

| Feature | Gemini | OpenAI |
|---------|--------|--------|
| Text Generation | ✅ Free (1.5M tokens/day) | ✅ Paid (~$0.15/1M tokens) |
| Dream Analysis | ✅ Supported | ✅ Supported |
| Dream Classification | ✅ Supported | ✅ Supported |
| Image Generation | ❌ Disabled (expensive) | ✅ Optional (DALL-E 3) |
| Video Generation | ❌ Disabled (expensive) | ❌ Not Available |
| Music Generation | ❌ Disabled (expensive) | ❌ Not Available |

## Pricing

### OpenAI Pricing (as of 2024)

**GPT-4o-mini** (Recommended for cost-effectiveness)
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**GPT-4o** (Higher quality, more expensive)
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

**DALL-E 3** (Image Generation)
- Standard (1024x1024): $0.040 per image
- Standard (1024x1792 or 1792x1024): $0.080 per image
- HD quality: 2x the standard price

### Estimated Costs

**Light Usage** (10 dream analyses/day):
- ~$0.01-0.05 per day
- ~$0.30-1.50 per month

**Medium Usage** (50 dream analyses/day):
- ~$0.05-0.25 per day
- ~$1.50-7.50 per month

**Heavy Usage** (200 dream analyses/day):
- ~$0.20-1.00 per day
- ~$6-30 per month

*Note: Actual costs depend on dream length and complexity. Images add $0.04-0.08 each.*

## Configuration Options

### Model Selection

You can choose different OpenAI models based on your needs:

**For Cost-Efficiency:**
```env
OPENAI_MODEL=gpt-4o-mini
```

**For Higher Quality:**
```env
OPENAI_MODEL=gpt-4o
```

**For Image Generation:**
```env
OPENAI_IMAGE_MODEL=dall-e-3
```

### Optional: Enable Image Generation

By default, image generation is available with OpenAI but not automatically used. To enable it in the world generation:

1. Ensure `OPENAI_IMAGE_MODEL` is set in `.env.local`
2. Images will be generated when creating dream worlds

**Warning:** Each image costs $0.04-0.08, so this can add up quickly!

## Switching Between Providers

You can easily switch between providers:

### Use Gemini (Free):
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
```

### Use OpenAI (Paid):
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
```

The application will automatically use the selected provider for all AI operations.

## Troubleshooting

### "OPENAI_API_KEY environment variable is required"

**Solution:** Make sure you've added `OPENAI_API_KEY` to your `.env.local` file.

### "Incorrect API key provided"

**Solution:** 
1. Check that your API key is correct
2. Ensure there are no extra spaces
3. Verify your OpenAI account has billing enabled

### "You exceeded your current quota"

**Solution:**
1. Check your OpenAI account billing
2. Add payment method if not already added
3. Verify you haven't exceeded rate limits

### Images not generating

**Solution:**
1. Ensure `OPENAI_IMAGE_MODEL=dall-e-3` is set
2. Verify your account has image generation enabled
3. Check that you have sufficient credits/quota

### Rate Limiting

OpenAI has rate limits that vary by tier:

**Free Tier:**
- 3 requests per minute
- 200 requests per day

**Paid Tier (Tier 1):**
- 500 requests per minute
- 10,000 requests per day

If you hit rate limits, the application will return an error. Consider implementing exponential backoff or upgrading your tier.

## Best Practices

1. **Start with gpt-4o-mini** - It's cost-effective and sufficient for most use cases
2. **Monitor your usage** - Check the [OpenAI Usage Dashboard](https://platform.openai.com/usage) regularly
3. **Set billing alerts** - Configure spending limits in your OpenAI account
4. **Use Gemini for development** - Save costs by using the free Gemini tier during development
5. **Cache results** - Consider caching dream analyses to avoid redundant API calls

## Security

- **Never commit API keys** - Keep `.env.local` in `.gitignore`
- **Use environment variables** - Never hardcode API keys
- **Rotate keys regularly** - Generate new keys periodically
- **Monitor for unusual activity** - Check your usage dashboard for unexpected spikes

## Support

For issues specific to:
- **OpenAI API**: Visit [OpenAI Help Center](https://help.openai.com/)
- **DreamScape AI**: Open an issue on the GitHub repository

## Additional Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
