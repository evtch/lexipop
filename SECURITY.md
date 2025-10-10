# 🔒 Security Guidelines for Lexipop

## Critical Security Practices

### Environment Variables
- **NEVER** commit `.env.local` or any file containing real API keys
- **ALWAYS** use `.env.example` for documentation with placeholder values
- **VALIDATE** all environment variables are properly loaded before use

### API Keys & Secrets
- Store all sensitive data in `.env.local` (already in `.gitignore`)
- Use descriptive placeholder values in `.env.example`
- Never log actual secret values in console or files
- Rotate keys regularly and never share them

### Public Repository Considerations
- This repository is **PUBLIC** - anyone can see the code
- All real credentials must be in `.env.local` (not tracked by git)
- Be extra careful with commit messages and code comments
- Never include test data with real credentials

## Environment Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values:**
   ```bash
   # Edit .env.local with your real API keys
   NEYNAR_API_KEY=your_actual_api_key_here
   FARCASTER_DEVELOPER_FID=your_actual_fid_here
   ```

3. **Verify setup:**
   ```bash
   npm run dev
   # Check console for "✅ Environment validation complete"
   ```

## Required API Keys

### For Farcaster Integration:
- **Neynar API Key**: Get from [neynar.com](https://neynar.com)
- **Developer FID**: Your Farcaster ID number
- **Mnemonic Phrase**: 12-word phrase for signing (keep VERY secure)

### For Production:
- **Database URL**: Connection string for persistent storage
- **Domain**: Update manifest URLs to your production domain

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No real API keys in code or comments
- [ ] Environment variables validated on startup
- [ ] Secrets are never logged or exposed to client
- [ ] Production deployment uses secure environment variables

## Emergency Procedures

If you accidentally commit secrets:
1. **Immediately** rotate/regenerate the exposed keys
2. Remove the commit from git history if possible
3. Update `.env.local` with new credentials
4. Consider the old keys completely compromised

## Contact

For security concerns or questions, create an issue with the "security" label.