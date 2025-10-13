#!/usr/bin/env node
/**
 * 🔔 NEYNAR NOTIFICATIONS TEST SCRIPT
 *
 * This script tests the Neynar API directly to debug notification issues
 */

require('dotenv').config({ path: '.env.local' });

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const TEST_FID = 12345; // Test user FID

console.log('🔔 Testing Neynar Notifications');
console.log('================================');
console.log('🔑 API Key present:', !!NEYNAR_API_KEY);
console.log('🎯 Test FID:', TEST_FID);
console.log('');

async function testNeynarAPI() {
  if (!NEYNAR_API_KEY) {
    console.error('❌ NEYNAR_API_KEY not found in environment');
    return;
  }

  const payload = {
    target_fids: [TEST_FID],
    notification: {
      title: "🧪 Test from Lexipop",
      body: "This is a test notification to verify Neynar integration is working properly!",
      target_url: "https://www.lexipop.xyz/miniapp"
    }
  };

  console.log('📦 Test Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  try {
    const url = 'https://api.neynar.com/v2/farcaster/frame/notifications/';
    console.log('🌐 Request URL:', url);

    const headers = {
      'x-api-key': NEYNAR_API_KEY,
      'Content-Type': 'application/json',
    };

    console.log('📋 Request headers:');
    console.log(JSON.stringify({ ...headers, 'x-api-key': '[PRESENT]' }, null, 2));
    console.log('');

    console.log('📤 Sending request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Response body:', responseText);

    if (!response.ok) {
      console.error('❌ API call failed');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Response:', responseText);
      return;
    }

    console.log('✅ Notification API call successful!');

    try {
      const result = JSON.parse(responseText);
      console.log('📊 Parsed response:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('📄 Raw response (not JSON):', responseText);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Test broadcast notification (with test target_fids)
async function testBroadcastNotification() {
  if (!NEYNAR_API_KEY) {
    console.error('❌ NEYNAR_API_KEY not found in environment');
    return;
  }

  console.log('\n📢 Testing Broadcast Notification:');
  console.log('==================================');

  // For testing, we'll use a few test FIDs. In production, this would be fetched from database
  const testFids = [TEST_FID, 1, 2, 3]; // Including our test FID and some other test values

  const payload = {
    target_fids: testFids,
    notification: {
      title: "📢 Broadcast Test",
      body: "This is a broadcast test notification from Lexipop!",
      target_url: "https://www.lexipop.xyz/miniapp"
    }
  };

  console.log('📦 Broadcast Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  try {
    const url = 'https://api.neynar.com/v2/farcaster/frame/notifications/';
    console.log('🌐 Request URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Broadcast Response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📄 Broadcast Response body:', responseText);

    if (response.ok) {
      console.log('✅ Broadcast notification successful!');
    } else {
      console.error('❌ Broadcast notification failed');
    }

  } catch (error) {
    console.error('❌ Broadcast error:', error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('Starting Neynar API tests...\n');

  await testNeynarAPI();
  await testBroadcastNotification();

  console.log('\n🏁 Tests completed!');
}

runAllTests().catch(console.error);