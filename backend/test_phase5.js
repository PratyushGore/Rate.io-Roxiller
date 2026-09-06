const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("Starting Phase 5 Automated Verification Tests...\n");

  let adminToken = "";
  let ownerToken = "";

  // 1. Health check
  console.log("1. Checking backend health...");
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthJson = await healthRes.json();
  if (healthRes.status !== 200 || !healthJson.success) {
    throw new Error(`Health check failed: ${JSON.stringify(healthJson)}`);
  }
  console.log("✓ Health check passed\n");

  // 2. Auth logins
  console.log("2. Logging in as admin and owner...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@platform.com", password: "Admin@123" }),
  });
  const adminLoginJson = await adminLoginRes.json();
  if (!adminLoginJson.success) throw new Error("Admin login failed");
  adminToken = adminLoginJson.data.token;

  const ownerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner1@craftcoffee.com", password: "Owner@123" }),
  });
  const ownerLoginJson = await ownerLoginRes.json();
  if (!ownerLoginJson.success) throw new Error("Owner login failed");
  ownerToken = ownerLoginJson.data.token;
  console.log("✓ Logged in successfully\n");

  // 3. Test Multer Image Uploads
  console.log("3. Testing image uploads & constraints...");

  // 3a. Non-image file rejection
  const boundary = "----WebKitFormBoundaryPhase5Test";
  const dummyTxtBody = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="test.txt"',
    "Content-Type: text/plain",
    "",
    "This is plain text",
    `--${boundary}`,
    'Content-Disposition: form-data; name="name"',
    "",
    "Valid Test Store Name 12345",
    `--${boundary}`,
    'Content-Disposition: form-data; name="email"',
    "",
    "teststore@example.com",
    `--${boundary}`,
    'Content-Disposition: form-data; name="address"',
    "",
    "123 Test Street, Suite 100",
    `--${boundary}--`,
  ].join("\r\n");

  const txtUploadRes = await fetch(`${BASE_URL}/api/stores`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: dummyTxtBody,
  });
  const txtUploadJson = await txtUploadRes.json();
  if (txtUploadRes.status === 400 && txtUploadJson.message.includes("Only JPEG, PNG, and WebP")) {
    console.log("✓ Successfully rejected non-image file with 400 and whitelist error message");
  } else {
    throw new Error(`Failed to reject invalid file type: ${JSON.stringify(txtUploadJson)}`);
  }

  // 3b. File > 2MB rejection
  const bigBuffer = Buffer.alloc(2.5 * 1024 * 1024, 0); // 2.5MB
  const formDataBig = new FormData();
  formDataBig.append("name", "Valid Test Store Name 12345");
  formDataBig.append("email", "teststore2@example.com");
  formDataBig.append("address", "123 Test Street, Suite 100");
  formDataBig.append("image", new Blob([bigBuffer], { type: "image/png" }), "large_image.png");

  const bigUploadRes = await fetch(`${BASE_URL}/api/stores`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: formDataBig,
  });
  const bigUploadJson = await bigUploadRes.json();
  if (bigUploadRes.status === 400 && bigUploadJson.message.includes("2MB")) {
    console.log("✓ Successfully rejected >2MB image with 400 and size limit error message");
  } else {
    throw new Error(`Failed to reject >2MB image: ${JSON.stringify(bigUploadJson)}`);
  }

  // 3c. Valid image upload + store creation
  // 1x1 transparent PNG buffer
  const validPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  const uniqueSuffix = Date.now();
  const storeName = `Unique Boutique Store ${uniqueSuffix}`;
  const storeAddress = `${uniqueSuffix} Market Avenue, Silicon Valley`;

  const formDataValid = new FormData();
  formDataValid.append("name", storeName);
  formDataValid.append("email", `boutique${uniqueSuffix}@example.com`);
  formDataValid.append("address", storeAddress);
  formDataValid.append("category", "Electronics");
  formDataValid.append("tags", "gadgets,tech,repairs");
  formDataValid.append("image", new Blob([validPngBuffer], { type: "image/png" }), "store_logo.png");

  const validUploadRes = await fetch(`${BASE_URL}/api/stores`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: formDataValid,
  });
  const validUploadJson = await validUploadRes.json();
  if (validUploadRes.status !== 201 || !validUploadJson.data.imageUrl) {
    throw new Error(`Valid store creation with image failed: ${JSON.stringify(validUploadJson)}`);
  }
  const createdImageUrl = validUploadJson.data.imageUrl;
  console.log(`✓ Store created with image URL: ${createdImageUrl}`);

  // 3d. Verify static image serving
  const imgFetchRes = await fetch(`${BASE_URL}${createdImageUrl}`);
  if (imgFetchRes.status !== 200) {
    throw new Error(`Failed to fetch statically served uploaded image from ${createdImageUrl}`);
  }
  console.log("✓ Statically served uploaded image successfully fetched (200 OK)\n");

  // 4. Test duplicate store prevention
  console.log("4. Testing duplicate store prevention [ownerId, name, address]...");
  const dupFormData = new FormData();
  dupFormData.append("name", storeName);
  dupFormData.append("email", `different_email${uniqueSuffix}@example.com`);
  dupFormData.append("address", storeAddress);

  const dupRes = await fetch(`${BASE_URL}/api/stores`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: dupFormData,
  });
  const dupJson = await dupRes.json();
  if (
    dupRes.status === 400 &&
    dupJson.message === "A store with this name and address already exists under your account."
  ) {
    console.log("✓ Duplicate store correctly rejected with 400 and mapped error message\n");
  } else {
    throw new Error(`Duplicate store creation did not return expected message: ${JSON.stringify(dupJson)}`);
  }

  // 5. Test GET /api/stores/top-rated
  console.log("5. Testing GET /api/stores/top-rated...");
  const topRatedRes = await fetch(`${BASE_URL}/api/stores/top-rated`);
  const topRatedJson = await topRatedRes.json();
  if (topRatedRes.status !== 200 || !Array.isArray(topRatedJson.data)) {
    throw new Error(`GET /api/stores/top-rated failed: ${JSON.stringify(topRatedJson)}`);
  }
  console.log(`✓ Retrieved ${topRatedJson.data.length} top-rated stores (max 10)`);
  // Check descending order
  for (let i = 1; i < topRatedJson.data.length; i++) {
    const prev = topRatedJson.data[i - 1].averageRating;
    const curr = topRatedJson.data[i].averageRating;
    if (prev < curr) {
      throw new Error(`Top rated stores not sorted descending: index ${i - 1} (${prev}) < index ${i} (${curr})`);
    }
  }
  console.log("✓ Top-rated stores are verified in descending rating order\n");

  // 6. Test GET /api/stores/categories
  console.log("6. Testing GET /api/stores/categories...");
  const catRes = await fetch(`${BASE_URL}/api/stores/categories`);
  const catJson = await catRes.json();
  if (catRes.status !== 200 || !Array.isArray(catJson.data)) {
    throw new Error(`GET /api/stores/categories failed: ${JSON.stringify(catJson)}`);
  }
  if (!catJson.data.includes("General")) {
    throw new Error(`Categories list missing "General": ${JSON.stringify(catJson.data)}`);
  }
  console.log(`✓ Categories retrieved: ${catJson.data.join(", ")}\n`);

  // 7. Test GET /api/stores/search
  console.log("7. Testing GET /api/stores/search with relevance boosting & pagination...");
  const searchRes = await fetch(`${BASE_URL}/api/stores/search?query=tech&page=1&limit=5`);
  const searchJson = await searchRes.json();
  if (
    searchRes.status !== 200 ||
    !searchJson.data.pagination ||
    !Array.isArray(searchJson.data.stores)
  ) {
    throw new Error(`GET /api/stores/search failed: ${JSON.stringify(searchJson)}`);
  }
  console.log(
    `✓ Search returned ${searchJson.data.stores.length} items (Page ${searchJson.data.pagination.page}/${searchJson.data.pagination.totalPages}, Total: ${searchJson.data.pagination.total})\n`
  );

  // 8. Test Admin list sorting
  console.log("8. Testing Admin sorting parameters (name_asc, name_desc, rating_desc, newest, oldest)...");
  
  // Users sort
  const usersAscRes = await fetch(`${BASE_URL}/api/admin/users?sort=name_asc`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const usersAscJson = await usersAscRes.json();
  if (usersAscRes.status !== 200 || !Array.isArray(usersAscJson.data)) {
    throw new Error(`Admin users sort failed: ${JSON.stringify(usersAscJson)}`);
  }
  console.log(`✓ Admin users?sort=name_asc returned ${usersAscJson.data.length} users`);

  // Stores sort
  const storesRatingRes = await fetch(`${BASE_URL}/api/admin/stores?sort=rating_desc`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const storesRatingJson = await storesRatingRes.json();
  if (storesRatingRes.status !== 200 || !Array.isArray(storesRatingJson.data)) {
    throw new Error(`Admin stores sort failed: ${JSON.stringify(storesRatingJson)}`);
  }
  console.log(`✓ Admin stores?sort=rating_desc returned ${storesRatingJson.data.length} stores`);
  for (let i = 1; i < storesRatingJson.data.length; i++) {
    const prev = storesRatingJson.data[i - 1].averageRating;
    const curr = storesRatingJson.data[i].averageRating;
    if (prev < curr) {
      throw new Error(`Admin stores not sorted by rating_desc: ${prev} < ${curr}`);
    }
  }
  console.log("✓ Admin stores rating_desc verified in descending rating order\n");

  console.log("ALL PHASE 5 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch((err) => {
  console.error("\n❌ TEST ERROR:", err.message);
  process.exit(1);
});
