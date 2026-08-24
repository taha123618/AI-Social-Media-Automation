#!/usr/bin/env node

/**
 * Analytics Feature Test Script
 * Tests all analytics endpoints and returns results
 */

const API_BASE = 'http://localhost:3000/api';

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name: string, url: string, options: RequestInit = {}) {
  try {
    log(`\n🧪 Testing ${name}...`, 'blue');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (response.ok) {
      log(`✅ ${name} - SUCCESS`, 'green');
      return { success: true, data };
    } else {
      log(`❌ ${name} - FAILED: ${data.error || response.statusText}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error: any) {
    log(`❌ ${name} - ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Starting Analytics Feature Tests...\n', 'yellow');

  // Note: These tests require authentication
  // In production, you would use a real session token
  const headers = {
    // Add your auth token here if needed
    // 'Cookie': 'next-auth.session-token=xxx'
  };

  const businessId = 'test_business_id'; // Replace with actual ID

  // Test 1: Lead Tracking Summary
  await testEndpoint(
    'Lead Tracking Summary',
    `${API_BASE}/analytics/leads/summary?businessId=${businessId}&days=30`,
    { headers }
  );

  // Test 2: Consistency Score
  await testEndpoint(
    'Consistency Score',
    `${API_BASE}/analytics/consistency/score?businessId=${businessId}&days=90`,
    { headers }
  );

  // Test 3: Revenue Attribution
  await testEndpoint(
    'Revenue Attribution',
    `${API_BASE}/analytics/revenue?businessId=${businessId}&days=90`,
    { headers }
  );

  // Test 4: Review Dashboard Data
  await testEndpoint(
    'Review System',
    `${API_BASE}/reviews?businessId=${businessId}`,
    { headers }
  );

  log('\n✅ All tests completed!\n', 'yellow');
  log('📝 Note: If tests show 401 Unauthorized, you need to:', 'blue');
  log('   1. Log into the application at http://localhost:3000', 'blue');
  log('   2. Copy your session cookie from browser DevTools', 'blue');
  log('   3. Add it to the headers in this test script', 'blue');
  log('\n🎯 Or test manually by visiting:\n', 'blue');
  log('   - Reviews Dashboard: http://localhost:3000/reviews', 'blue');
  log('   - Analytics Dashboard: http://localhost:3000/analytics', 'blue');
  log('', 'blue');
}

// Run tests
runTests().catch(console.error);
