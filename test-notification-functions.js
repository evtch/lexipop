#!/usr/bin/env node
/**
 * 🔔 NOTIFICATION FUNCTIONS TEST
 *
 * This script tests notification functions directly without needing a server
 */

// Mock the Prisma client since we can't run the full Next.js environment
global.prisma = {
  userStats: {
    findMany: async () => [
      { userFid: 12345 },
      { userFid: 67890 },
      { userFid: 11111 }
    ]
  }
};

// Set up environment
process.env.NEYNAR_API_KEY = '26B498E6-29AE-47D5-A3E5-584D34277E4F';

console.log('🔔 Testing Notification Functions Directly');
console.log('==========================================');
console.log('🔑 API Key present:', !!process.env.NEYNAR_API_KEY);
console.log('');

async function testNotificationFunctionsDirect() {
  try {
    // Import our notification functions
    const {
      notifyUser,
      notifyUserCustom,
      broadcastNotification,
      broadcastCustomNotification
    } = require('./src/lib/notifications.ts');

    console.log('📦 Imported notification functions successfully');

    // Test individual notification
    console.log('\n👤 Testing individual notification...');
    const individualResult = await notifyUser(12345, 'perfect_game');
    console.log('Result:', JSON.stringify(individualResult, null, 2));

    // Test custom individual notification
    console.log('\n🎨 Testing custom individual notification...');
    const customResult = await notifyUserCustom(
      12345,
      '🧪 Custom Test',
      'This is a custom test notification!'
    );
    console.log('Result:', JSON.stringify(customResult, null, 2));

    // Test broadcast notification
    console.log('\n📢 Testing broadcast notification...');
    const broadcastResult = await broadcastNotification('daily_reminder_1');
    console.log('Result:', JSON.stringify(broadcastResult, null, 2));

    // Test custom broadcast notification
    console.log('\n📢 Testing custom broadcast notification...');
    const customBroadcastResult = await broadcastCustomNotification(
      '🎉 Custom Broadcast',
      'This is a custom broadcast notification!'
    );
    console.log('Result:', JSON.stringify(customBroadcastResult, null, 2));

    console.log('\n✅ All function tests completed!');

  } catch (error) {
    console.error('❌ Error testing functions:', error);
  }
}

// Since we can't directly import TS files in Node without compilation,
// let's manually create the test functions using the corrected API format
async function testWithManualFunctions() {
  console.log('🔧 Testing with manual function implementations...');

  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

  async function sendTestNotification(payload) {
    try {
      const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notifications/', {
        method: 'POST',
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📄 Response body:', responseText);

      if (response.ok) {
        return { success: true, response: JSON.parse(responseText) };
      } else {
        return { success: false, error: responseText };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Test 1: Individual notification
  console.log('\n👤 Testing individual notification (manual)...');
  const individualPayload = {
    target_fids: [12345],
    notification: {
      title: '🎉 Perfect Game!',
      body: 'Incredible! You answered all 5 questions correctly. You\'re a vocabulary master!',
      target_url: 'https://www.lexipop.xyz/miniapp'
    }
  };

  console.log('📦 Payload:', JSON.stringify(individualPayload, null, 2));
  const individualResult = await sendTestNotification(individualPayload);
  console.log('📊 Result:', JSON.stringify(individualResult, null, 2));

  // Test 2: Broadcast notification (with mock user FIDs)
  console.log('\n📢 Testing broadcast notification (manual)...');
  const broadcastPayload = {
    target_fids: [12345, 67890, 11111], // Mock user FIDs
    notification: {
      title: '🧠 Ready to Learn?',
      body: 'Test your vocabulary knowledge! New words are waiting for you in Lexipop.',
      target_url: 'https://www.lexipop.xyz/miniapp'
    }
  };

  console.log('📦 Payload:', JSON.stringify(broadcastPayload, null, 2));
  const broadcastResult = await sendTestNotification(broadcastPayload);
  console.log('📊 Result:', JSON.stringify(broadcastResult, null, 2));

  // Test 3: Custom notification
  console.log('\n🎨 Testing custom notification (manual)...');
  const customPayload = {
    target_fids: [12345],
    notification: {
      title: '🧪 Custom Test',
      body: 'This is a custom notification to test the updated Neynar integration!',
      target_url: 'https://www.lexipop.xyz/miniapp'
    }
  };

  console.log('📦 Payload:', JSON.stringify(customPayload, null, 2));
  const customResult = await sendTestNotification(customPayload);
  console.log('📊 Result:', JSON.stringify(customResult, null, 2));

  console.log('\n🏁 Manual function tests completed!');
}

testWithManualFunctions().catch(console.error);