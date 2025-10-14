# Neynar Notification Setup

## Environment Variables

Add these to your `.env.local` file:

```env
# Neynar API Credentials
NEYNAR_API_KEY=26B498E6-29AE-47D5-A3E5-584D34277E4F
NEYNAR_CLIENT_ID=257f73a8-be43-4d35-a4e3-c6ec9ff97672
```

## API Endpoints

- **Send Notifications**: `https://api.neynar.com/v2/farcaster/frame/notifications`
- **Webhook Receiver**: `https://www.lexipop.xyz/api/webhooks/notifications`
- **Neynar App Webhook**: `https://api.neynar.com/f/app/257f73a8-be43-4d35-a4e3-c6ec9ff97672/event`

## Testing

Test notifications with:

```bash
curl -X PUT "https://www.lexipop.xyz/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{"testType": "custom"}'
```

## Updated Structure

The notification payload now uses the correct Neynar format:

```typescript
{
  targetFids: number[],        // Changed from target_fids
  notification: {
    title: string,
    body: string,
    target_url: string
  },
  filters?: {
    exclude_fids?: number[],
    following_fid?: number,     // Changed from following_fids
    minimum_user_score?: number // Changed from user_score_threshold
  }
}
```

## Headers

Requests now include both API key and client ID:

```typescript
{
  'api_key': NEYNAR_API_KEY,
  'client_id': NEYNAR_CLIENT_ID,
  'Content-Type': 'application/json'
}
```