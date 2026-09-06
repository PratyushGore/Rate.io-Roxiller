const http = require("http");
const app = require("./src/app");
const prisma = require("./src/config/prisma");

let server;
const PORT = 5556;
const BASE_URL = `http://localhost:${PORT}`;

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log("🚀 Starting Phase 2 End-to-End API Verification...\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = "") => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details}`);
      failed++;
    }
  };

  // 1. Health Check
  const healthRes = await request("GET", "/health");
  assert(healthRes.status === 200 && healthRes.body.data.status === "UP", "Health Check");

  // 2. Auth Tests
  console.log("\n--- Task 2.1: Auth API Tests ---");

  // Signup with ADMIN role (Must fail)
  const signupAdminRes = await request("POST", "/api/auth/signup", {
    name: "Hacker Admin",
    email: "hacker@admin.com",
    password: "Password@123",
    role: "ADMIN",
  });
  assert(signupAdminRes.status === 400, "Reject public signup with role ADMIN (400)");

  // Signup as USER
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const signupUserRes = await request("POST", "/api/auth/signup", {
    name: "Jane Customer Account",
    email: uniqueEmail,
    address: "123 Main St",
    password: "Secret@123",
    role: "USER",
  });
  assert(signupUserRes.status === 201, "Successful USER signup (201)");
  assert(signupUserRes.body.data.user && !signupUserRes.body.data.user.password, "Signup response excludes password");
  assert(!!signupUserRes.body.data.token, "Signup returns JWT token");
  const newUserId = signupUserRes.body.data.user.id;
  const newUserToken = signupUserRes.body.data.token;

  // Duplicate email signup
  const dupSignupRes = await request("POST", "/api/auth/signup", {
    name: "Duplicate User",
    email: uniqueEmail,
    password: "Secret@123",
    role: "USER",
  });
  assert(dupSignupRes.status === 409, "Reject duplicate email signup (409)");

  // Login failure
  const badLoginRes = await request("POST", "/api/auth/login", {
    email: uniqueEmail,
    password: "WrongPassword!",
  });
  assert(badLoginRes.status === 401, "Reject login with invalid password (401)");

  // Login success (Admin)
  const adminLoginRes = await request("POST", "/api/auth/login", {
    email: "admin@platform.com",
    password: "Admin@123",
  });
  assert(adminLoginRes.status === 200 && adminLoginRes.body.data.user.role === "ADMIN", "Admin login returns role ADMIN (200)");
  const adminToken = adminLoginRes.body.data.token;

  // Login success (Store Owner 1)
  const ownerLoginRes = await request("POST", "/api/auth/login", {
    email: "owner1@craftcoffee.com",
    password: "Owner@123",
  });
  assert(ownerLoginRes.status === 200 && ownerLoginRes.body.data.user.role === "STORE_OWNER", "Owner 1 login returns role STORE_OWNER (200)");
  const owner1Token = ownerLoginRes.body.data.token;
  const owner1Id = ownerLoginRes.body.data.user.id;

  // Login success (User 1)
  const user1LoginRes = await request("POST", "/api/auth/login", {
    email: "user1@example.com",
    password: "User@123",
  });
  assert(user1LoginRes.status === 200 && user1LoginRes.body.data.user.role === "USER", "User 1 login returns role USER (200)");
  const user1Token = user1LoginRes.body.data.token;

  // Get current user (GET /api/auth/me)
  const meRes = await request("GET", "/api/auth/me", null, {
    Authorization: `Bearer ${user1Token}`,
  });
  assert(meRes.status === 200 && meRes.body.data.email === "user1@example.com", "GET /api/auth/me returns current user profile");

  // Change password for new user
  const changePassRes = await request("PATCH", "/api/auth/password", {
    oldPassword: "Secret@123",
    newPassword: "BrandNewSecret@123",
  }, {
    Authorization: `Bearer ${newUserToken}`,
  });
  assert(changePassRes.status === 200, "Password change succeeds (200)");

  // 3. Store & Rating Tests
  console.log("\n--- Task 2.2: Store & Rating API Tests ---");

  // Anonymous store catalog
  const anonStoresRes = await request("GET", "/api/stores");
  assert(anonStoresRes.status === 200, "Anonymous GET /api/stores returns 200");
  assert(anonStoresRes.body.data.every(s => s.status === "APPROVED"), "Only APPROVED stores returned");
  assert(anonStoresRes.body.data.every(s => s.userRating === null), "Anonymous call has userRating = null");

  // Authenticated store catalog (user1 has rated Store 1 with rating 5)
  const authStoresRes = await request("GET", "/api/stores", null, {
    Authorization: `Bearer ${user1Token}`,
  });
  const store1 = authStoresRes.body.data.find(s => s.name.includes("Craft & Roast"));
  assert(store1 && store1.userRating === 5, "GET /api/stores with Bearer includes userRating for user1");
  assert(store1 && store1.averageRating === 4.5, "Store 1 has averageRating 4.5");

  // Store 3 should be Unrated (seeded without ratings)
  const store3FromList = authStoresRes.body.data.find(s => s.name.includes("Tech Horizon"));
  assert(store3FromList && store3FromList.ratingDisplay === "Unrated" && store3FromList.averageRating === 0, "Store 3 displays Unrated / 0.0");

  // Search and Sort
  const searchStoresRes = await request("GET", "/api/stores?search=coffee&sortBy=rating&order=desc");
  assert(searchStoresRes.status === 200 && searchStoresRes.body.data.length >= 1, "Search by 'coffee' returns matching stores");

  // Store detail
  const storeDetailRes = await request("GET", `/api/stores/${store1.id}`, null, {
    Authorization: `Bearer ${user1Token}`,
  });
  assert(storeDetailRes.status === 200, "GET /api/stores/:id returns 200");
  assert(storeDetailRes.body.data.ratingDistribution && typeof storeDetailRes.body.data.ratingDistribution[4] === "number", "Store detail includes ratingDistribution");
  assert(storeDetailRes.body.data.userRating === 5, "Store detail includes caller's userRating");

  // Rate a store: Owner rating own store (Must fail 400)
  const ownerRateRes = await request("POST", "/api/ratings", {
    storeId: store1.id,
    rating: 5,
  }, {
    Authorization: `Bearer ${owner1Token}`,
  });
  assert(ownerRateRes.status === 403, "Store owner rating endpoint rejected with 403 (requireRole USER)");

  // Rate a store: User rates store 3
  const rateRes = await request("POST", "/api/ratings", {
    storeId: store3FromList.id,
    rating: 5,
  }, {
    Authorization: `Bearer ${newUserToken}`,
  });
  assert(rateRes.status === 200, "USER successfully rates store (200)");
  assert(rateRes.body.data.averageRating === 5.0 && rateRes.body.data.totalRatings === 1, "Rating updates store average and count");

  // Rate upsert: User updates rating for store 3 to 4
  const rateUpsertRes = await request("POST", "/api/ratings", {
    storeId: store3FromList.id,
    rating: 4,
  }, {
    Authorization: `Bearer ${newUserToken}`,
  });
  assert(rateUpsertRes.status === 200 && rateUpsertRes.body.data.averageRating === 4.0, "Rating upsert correctly updates existing user rating");

  // Store creation by STORE_OWNER -> defaults to PENDING
  const ownerCreateStoreRes = await request("POST", "/api/stores", {
    name: "Owner's Brand New Bakery",
    email: "contact@newbakery.com",
    address: "77 Pastry Lane, Baker City",
  }, {
    Authorization: `Bearer ${owner1Token}`,
  });
  assert(ownerCreateStoreRes.status === 201 && ownerCreateStoreRes.body.data.status === "PENDING", "Store created by STORE_OWNER defaults to PENDING");
  const pendingStoreId = ownerCreateStoreRes.body.data.id;

  // Store creation by ADMIN -> defaults to APPROVED
  const adminCreateStoreRes = await request("POST", "/api/stores", {
    name: "Admin Approved Mega Mart",
    email: "contact@megamart.com",
    address: "99 Admin Boulevard",
  }, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminCreateStoreRes.status === 201 && adminCreateStoreRes.body.data.status === "APPROVED", "Store created by ADMIN defaults to APPROVED");
  const approvedStoreId = adminCreateStoreRes.body.data.id;

  // 4. Admin Tests
  console.log("\n--- Task 2.3: Admin API Tests ---");

  // Non-admin access to admin endpoint
  const userAdminAttempt = await request("GET", "/api/admin/metrics", null, {
    Authorization: `Bearer ${user1Token}`,
  });
  assert(userAdminAttempt.status === 403, "Non-admin blocked from /api/admin/* with 403");

  // Admin metrics
  const adminMetricsRes = await request("GET", "/api/admin/metrics", null, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminMetricsRes.status === 200 && adminMetricsRes.body.data.totalUsers >= 9, "Admin metrics returns totalUsers count");
  assert(typeof adminMetricsRes.body.data.totalStores === "number", "Admin metrics returns totalStores count");

  // List stores by admin (includes PENDING)
  const adminStoresRes = await request("GET", "/api/admin/stores?status=PENDING", null, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminStoresRes.status === 200 && adminStoresRes.body.data.some(s => s.id === pendingStoreId), "Admin can list PENDING stores");

  // Moderation: reject transition to PENDING (Must fail 400)
  const invalidTransitionRes = await request("PATCH", `/api/admin/stores/${pendingStoreId}/status`, {
    status: "PENDING",
  }, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(invalidTransitionRes.status === 400, "Reject transition to PENDING with 400");

  // Moderation: approve store
  const approveStoreRes = await request("PATCH", `/api/admin/stores/${pendingStoreId}/status`, {
    status: "APPROVED",
  }, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(approveStoreRes.status === 200 && approveStoreRes.body.data.status === "APPROVED", "Admin approves store (200)");

  // Admin create user
  const adminCreateUserRes = await request("POST", "/api/admin/users", {
    name: "Admin Created Owner",
    email: `admincreated_${Date.now()}@example.com`,
    password: "Password@123",
    address: "500 Corporate Dr",
    role: "STORE_OWNER",
  }, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminCreateUserRes.status === 201 && adminCreateUserRes.body.data.role === "STORE_OWNER", "Admin creates user with role STORE_OWNER");
  const tempUserId = adminCreateUserRes.body.data.id;

  // Admin promote/change role
  const adminRoleUpdateRes = await request("PATCH", `/api/admin/users/${tempUserId}/role`, {
    role: "USER",
  }, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminRoleUpdateRes.status === 200 && adminRoleUpdateRes.body.data.role === "USER", "Admin updates user role to USER");

  // Admin delete self (Must fail 400)
  const adminSelfDeleteRes = await request("DELETE", `/api/admin/users/${adminLoginRes.body.data.user.id}`, null, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminSelfDeleteRes.status === 400, "Admin cannot delete own account (400)");

  // Admin delete temp user
  const adminDeleteUserRes = await request("DELETE", `/api/admin/users/${tempUserId}`, null, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminDeleteUserRes.status === 200, "Admin deletes created temp user (200)");

  // 5. Owner Tests
  console.log("\n--- Task 2.4: Owner API Tests ---");

  // Non-owner access to owner endpoint
  const userOwnerAttempt = await request("GET", "/api/owner/stores", null, {
    Authorization: `Bearer ${user1Token}`,
  });
  assert(userOwnerAttempt.status === 403, "Non-owner blocked from /api/owner/* with 403");

  // Owner lists own stores
  const ownerStoresRes = await request("GET", "/api/owner/stores", null, {
    Authorization: `Bearer ${owner1Token}`,
  });
  assert(ownerStoresRes.status === 200 && ownerStoresRes.body.data.length >= 1, "STORE_OWNER retrieves own stores");
  assert(ownerStoresRes.body.data.every(s => s.ownerId === owner1Id), "All returned stores belong to owner1");

  // Owner store detail and analytics with ratingsLog
  const ownerAnalyticsRes = await request("GET", `/api/owner/stores/${store1.id}`, null, {
    Authorization: `Bearer ${owner1Token}`,
  });
  assert(ownerAnalyticsRes.status === 200, "Owner retrieves store analytics (200)");
  assert(Array.isArray(ownerAnalyticsRes.body.data.ratingsLog), "Analytics includes ratingsLog array");
  assert(ownerAnalyticsRes.body.data.ratingsLog.length >= 4, "ratingsLog contains individual ratings");
  assert(
    ownerAnalyticsRes.body.data.ratingsLog[0].customerName &&
    typeof ownerAnalyticsRes.body.data.ratingsLog[0].value === "number" &&
    ownerAnalyticsRes.body.data.ratingsLog[0].createdAt,
    "ratingsLog entry has customerName, value, and createdAt"
  );

  // Sorting ratingsLog by value descending
  const ownerSortValueRes = await request("GET", `/api/owner/stores/${store1.id}?sortBy=value&order=desc`, null, {
    Authorization: `Bearer ${owner1Token}`,
  });
  const logValues = ownerSortValueRes.body.data.ratingsLog.map(r => r.value);
  const isSortedDesc = logValues.slice(1).every((val, i) => logValues[i] >= val);
  assert(isSortedDesc, "ratingsLog correctly sorted by value desc");

  // Accessing store owned by someone else (Must fail 403)
  // Store 2 is owned by owner 2
  const store2 = authStoresRes.body.data.find(s => s.name.includes("Urban Threads"));
  const forbiddenStoreRes = await request("GET", `/api/owner/stores/${store2.id}`, null, {
    Authorization: `Bearer ${owner1Token}`,
  });
  assert(forbiddenStoreRes.status === 403, "Owner accessing another owner's store returns 403");

  // Clean up created test stores
  await prisma.rating.deleteMany({ where: { storeId: { in: [pendingStoreId, approvedStoreId] } } });
  await prisma.store.deleteMany({ where: { id: { in: [pendingStoreId, approvedStoreId] } } });
  await prisma.rating.deleteMany({ where: { userId: newUserId } });
  await prisma.user.deleteMany({ where: { id: newUserId } });

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
};

server = app.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    server.close(() => {
      prisma.$disconnect();
      process.exit(0);
    });
  }
});
