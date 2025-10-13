#!/usr/bin/env node
/**
 * 🔔 NOTIFICATION API ENDPOINTS TEST
 *
 * This script tests our notification API endpoints directly
 */

require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3004'; // or wherever the server runs
const TEST_FID = 12345;

console.log('🔔 Testing Notification API Endpoints');
console.log('====================================');
console.log('🌐 Base URL:', BASE_URL);
console.log('🎯 Test FID:', TEST_FID);
console.log('');

async function testGetNotifications() {
  console.log('📊 Testing GET /api/notifications...');

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`);
    const data = await response.json();

    console.log('📡 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    return response.ok;
  } catch (error) {
    console.error('❌ GET test failed:', error.message);
    return false;
  }
}

async function testIndividualNotification() {
  console.log('\n👤 Testing individual notification...');

  const payload = {
    type: 'custom',
    userFid: TEST_FID,
    title: '🧪 Test Individual',
    body: 'This is a test individual notification from the API endpoint!'
  };

  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('📡 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    return response.ok && data.success;
  } catch (error) {
    console.error('❌ Individual notification test failed:', error.message);
    return false;
  }
}

async function testBroadcastNotification() {
  console.log('\n📢 Testing broadcast notification...');

  const payload = {
    type: 'custom',
    title: '🧪 Test Broadcast',
    body: 'This is a test broadcast notification from the API endpoint!'
  };

  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('📡 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    return response.ok && data.success;
  } catch (error) {
    console.error('❌ Broadcast notification test failed:', error.message);
    return false;
  }
}

async function testTemplateNotification() {
  console.log('\n🎉 Testing template notification (perfect_game)...');

  const payload = {
    type: 'perfect_game',
    userFid: TEST_FID
  };

  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('📡 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    return response.ok && data.success;
  } catch (error) {
    console.error('❌ Template notification test failed:', error.message);
    return false;
  }
}

async function testEnvironmentEndpoint() {
  console.log('\n🔍 Testing environment endpoint...');

  const payload = {
    testType: 'environment'
  };

  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('📡 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    return response.ok && data.success;
  } catch (error) {
    console.error('❌ Environment test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting API endpoint tests...\n');

  const results = {
    get: await testGetNotifications(),
    individual: await testIndividualNotification(),
    broadcast: await testBroadcastNotification(),
    template: await testTemplateNotification(),
    environment: await testEnvironmentEndpoint(),
  };

  console.log('\n🏁 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = Object.values(results).every(Boolean);
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

  if (allPassed) {
    console.log('\n🎉 Neynar notifications are working correctly!');
    console.log('The system is ready for production use.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs and configuration.');
  }
}

runAllTests().catch(console.error);