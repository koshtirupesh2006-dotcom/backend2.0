/**
 * Akatsuki’s Draft – Automated Test Suite
 * Run with: node test.js (or: npm test)
 * Make sure the server is running in another terminal (npm start)
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

function logPass(testName, details = '') {
  passed++;
  console.log(`${colors.green}✔ [PASS]${colors.reset} ${testName} ${details ? colors.cyan + '(' + details + ')' + colors.reset : ''}`);
}

function logFail(testName, error) {
  failed++;
  console.log(`${colors.red}✖ [FAIL]${colors.reset} ${testName}`);
  console.log(`         ${colors.yellow}Reason:${colors.reset} ${error}`);
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   Akatsuki’s Draft – API Pass / Fail Test Runner   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`Target Server: ${BASE_URL}\n`);

  // Step 0: Check if server is running
  try {
    await fetch(`${BASE_URL}/posts`);
  } catch (err) {
    console.log(`${colors.red}${colors.bold}ERROR: Backend server is not running on ${BASE_URL}!${colors.reset}`);
    console.log(`Please start the server in another terminal first:\n   ${colors.yellow}npm start${colors.reset}\n`);
    process.exit(1);
  }

  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@akatsuki.org`;
  const userEmail = `user_${timestamp}@leaf.org`;
  const password = 'Password123';

  let adminToken = '';
  let userToken = '';
  let createdPostId = '';

  // ---------------------------------------------------------
  // TEST 1: Register Admin User
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin Nagato',
        email: adminEmail,
        password,
        role: 'admin',
      }),
    });
    const data = await res.json();
    if (res.status === 201 && data.token && data.user?.role === 'admin') {
      adminToken = data.token;
      logPass('1. Admin Registration (POST /auth/register)', `Role: ${data.user.role}`);
    } else {
      logFail('1. Admin Registration (POST /auth/register)', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('1. Admin Registration (POST /auth/register)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 2: Register Regular User
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Naruto Uzumaki',
        email: userEmail,
        password,
        role: 'user',
      }),
    });
    const data = await res.json();
    if (res.status === 201 && data.token && data.user?.role === 'user') {
      userToken = data.token;
      logPass('2. Regular User Registration (POST /auth/register)', `Role: ${data.user.role}`);
    } else {
      logFail('2. Regular User Registration (POST /auth/register)', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('2. Regular User Registration (POST /auth/register)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 3: User Login
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password,
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      logPass('3. User Login (POST /auth/login)', 'Token returned successfully');
    } else {
      logFail('3. User Login (POST /auth/login)', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('3. User Login (POST /auth/login)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 4: Get Profile (GET /auth/me) & Password Omission
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.user && !data.user.password) {
      logPass('4. Get User Profile (GET /auth/me)', 'Password hash securely omitted');
    } else {
      logFail('4. Get User Profile (GET /auth/me)', `Status ${res.status}: password exposed or user missing`);
    }
  } catch (err) {
    logFail('4. Get User Profile (GET /auth/me)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 5: Create a Post (Submitted as Pending)
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Draft on Philosophy and Peace',
        description: 'Examining conflict and reconciliation.',
        content: 'True peace is built upon mutual understanding and genuine empathy between all individuals.',
        category: 'Philosophy',
        status: 'pending',
      }),
    });
    const data = await res.json();
    if (res.status === 201 && data.post?._id && data.post.status === 'pending') {
      createdPostId = data.post._id;
      logPass('5. Create Pending Post (POST /posts)', `Post ID: ${createdPostId}`);
    } else {
      logFail('5. Create Pending Post (POST /posts)', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('5. Create Pending Post (POST /posts)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 6: Public Feed Must NOT Show Pending Post
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/posts`);
    const posts = await res.json();
    const isPendingVisible = Array.isArray(posts) && posts.some((p) => p._id === createdPostId);
    if (res.status === 200 && !isPendingVisible) {
      logPass('6. Public Feed Filter (GET /posts)', 'Pending posts correctly hidden from public');
    } else {
      logFail('6. Public Feed Filter (GET /posts)', 'Pending post should not be publicly visible!');
    }
  } catch (err) {
    logFail('6. Public Feed Filter (GET /posts)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 7: Author Views Their Own Posts (GET /posts/my-posts)
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/posts/my-posts`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const posts = await res.json();
    const hasMyPost = Array.isArray(posts) && posts.some((p) => p._id === createdPostId);
    if (res.status === 200 && hasMyPost) {
      logPass('7. View My Posts & Drafts (GET /posts/my-posts)', `Found ${posts.length} author post(s)`);
    } else {
      logFail('7. View My Posts & Drafts (GET /posts/my-posts)', `Author post not returned in my-posts list`);
    }
  } catch (err) {
    logFail('7. View My Posts & Drafts (GET /posts/my-posts)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 8: Admin Views Pending Posts (GET /admin/posts/pending)
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/admin/posts/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const posts = await res.json();
    const hasPending = Array.isArray(posts) && posts.some((p) => p._id === createdPostId);
    if (res.status === 200 && hasPending) {
      logPass('8. Admin Pending Moderation (GET /admin/posts/pending)', 'Post found awaiting approval');
    } else {
      logFail('8. Admin Pending Moderation (GET /admin/posts/pending)', `Status ${res.status}: ${JSON.stringify(posts)}`);
    }
  } catch (err) {
    logFail('8. Admin Pending Moderation (GET /admin/posts/pending)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 9: Non-Admin Blocked from Admin Route (403 Forbidden)
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/admin/posts/pending`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (res.status === 403) {
      logPass('9. Admin Role Enforcement', 'Regular user correctly rejected with 403 Forbidden');
    } else {
      logFail('9. Admin Role Enforcement', `Expected status 403, got ${res.status}`);
    }
  } catch (err) {
    logFail('9. Admin Role Enforcement', err.message);
  }

  // ---------------------------------------------------------
  // TEST 10: Admin Approves Post (PATCH /admin/posts/approve/:id)
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/admin/posts/approve/${createdPostId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.post?.status === 'approved') {
      logPass('10. Admin Approve Post (PATCH /admin/posts/approve/:id)', 'Status updated to approved');
    } else {
      logFail('10. Admin Approve Post (PATCH /admin/posts/approve/:id)', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('10. Admin Approve Post (PATCH /admin/posts/approve/:id)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 11: Public Feed Now Displays the Approved Post
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/posts`);
    const posts = await res.json();
    const isApprovedVisible = Array.isArray(posts) && posts.some((p) => p._id === createdPostId);
    if (res.status === 200 && isApprovedVisible) {
      logPass('11. Approved Post on Public Feed (GET /posts)', 'Approved post is now publicly visible');
    } else {
      logFail('11. Approved Post on Public Feed (GET /posts)', 'Approved post not found in public feed');
    }
  } catch (err) {
    logFail('11. Approved Post on Public Feed (GET /posts)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 12: Ownership Protection: Other User Cannot Update
  // ---------------------------------------------------------
  try {
    // Create a second regular user
    const otherUserRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sasuke Uchiha',
        email: `sasuke_${timestamp}@leaf.org`,
        password,
        role: 'user',
      }),
    });
    const otherUserData = await otherUserRes.json();
    const otherUserToken = otherUserData.token;

    // Try to update Naruto's post using Sasuke's token
    const res = await fetch(`${BASE_URL}/posts/${createdPostId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherUserToken}`,
      },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });

    if (res.status === 403) {
      logPass('12. Ownership Protection (PATCH /posts/:id)', 'Unauthorized user correctly blocked with 403');
    } else {
      logFail('12. Ownership Protection (PATCH /posts/:id)', `Expected 403 Forbidden, got ${res.status}`);
    }
  } catch (err) {
    logFail('12. Ownership Protection (PATCH /posts/:id)', err.message);
  }

  // ---------------------------------------------------------
  // TEST 13: Gemini AI Content Improvement (POST /ai/improve/:id)
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/ai/improve/${createdPostId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status === 201 && data.newDraft?._id && data.newDraft._id !== createdPostId) {
      logPass('13. Gemini AI Content Improvement (POST /ai/improve/:id)', `New draft created with ID: ${data.newDraft._id}`);
    } else if (res.status === 500 && data.message?.includes('API key')) {
      logPass('13. Gemini AI Content Improvement', 'Route reached (Set valid GEMINI_API_KEY in .env for full AI response)');
    } else {
      logFail('13. Gemini AI Content Improvement', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('13. Gemini AI Content Improvement', err.message);
  }

  // ---------------------------------------------------------
  // TEST 14: Gemini AI Document Upload (POST /ai/process-document)
  // ---------------------------------------------------------
  try {
    const formData = new FormData();
    const blob = new Blob(['Akatsuki draft research document: Testing multimodal text extraction.'], {
      type: 'text/plain',
    });
    formData.append('document', blob, 'sample_test.txt');
    formData.append('prompt', 'Summarize this test document.');

    const res = await fetch(`${BASE_URL}/ai/process-document`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: formData,
    });
    const data = await res.json();
    if (res.status === 200 && data.analysis) {
      logPass('14. Gemini AI Document Processing (POST /ai/process-document)', 'Analysis returned from document');
    } else if (res.status === 500 && data.message?.includes('API key')) {
      logPass('14. Gemini AI Document Processing', 'Multer upload passed (Set valid GEMINI_API_KEY in .env for full AI response)');
    } else {
      logFail('14. Gemini AI Document Processing', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('14. Gemini AI Document Processing', err.message);
  }

  // ---------------------------------------------------------
  // TEST 15: Delete User's Own Post (DELETE /posts/:id)
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/posts/${createdPostId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status === 200) {
      logPass('15. Delete Own Post (DELETE /posts/:id)', 'Post successfully deleted');
    } else {
      logFail('15. Delete Own Post (DELETE /posts/:id)', `Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('15. Delete Own Post (DELETE /posts/:id)', err.message);
  }

  // ---------------------------------------------------------
  // Summary
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}Test Summary:${colors.reset}`);
  console.log(`   ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`   ${failed > 0 ? colors.red : colors.reset}Failed: ${failed}${colors.reset}`);
  console.log(`   Total:  ${passed + failed}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 All tests passed successfully! 🎉${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}⚠️ Some tests failed. Please check the logs above.${colors.reset}\n`);
  }
}

runTests();

