const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing tables in reverse-dependency order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed 1 ADMIN
  const adminPassword = bcrypt.hashSync("Admin@123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@platform.com",
      password: adminPassword,
      role: "ADMIN",
      address: "100 Admin Plaza, Suite 100, New York, NY 10001",
    },
  });
  console.log(`Created ADMIN: ${admin.email}`);

  // 2. Seed 3 STORE_OWNERs
  const ownerPassword = bcrypt.hashSync("Owner@123", 10);

  const owner1 = await prisma.user.create({
    data: {
      name: "Alice Montgomery",
      email: "owner1@craftcoffee.com",
      password: ownerPassword,
      role: "STORE_OWNER",
      address: "12 Roast Street, Seattle, WA 98101",
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: "Bob Davenport",
      email: "owner2@urbanthreads.com",
      password: ownerPassword,
      role: "STORE_OWNER",
      address: "45 Fashion Ave, Portland, OR 97201",
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: "Carlos Rivera",
      email: "owner3@techhorizon.com",
      password: ownerPassword,
      role: "STORE_OWNER",
      address: "88 Silicon Way, San Jose, CA 95113",
    },
  });
  console.log("Created 3 STORE_OWNER accounts");

  // 3. Seed 3 APPROVED Stores (1 per owner)
  const store1 = await prisma.store.create({
    data: {
      name: "Craft & Roast Coffeehouse",
      email: "contact@craftcoffee.com",
      address: "12 Roast Street, Seattle, WA 98101",
      status: "APPROVED",
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Urban Threads Boutique",
      email: "contact@urbanthreads.com",
      address: "45 Fashion Ave, Portland, OR 97201",
      status: "APPROVED",
      ownerId: owner2.id,
    },
  });

  // Store 3 deliberately has ZERO ratings to test the "Unrated" display path
  const store3 = await prisma.store.create({
    data: {
      name: "Tech Horizon Gadgets",
      email: "contact@techhorizon.com",
      address: "88 Silicon Way, San Jose, CA 95113",
      status: "APPROVED",
      ownerId: owner3.id,
    },
  });
  console.log("Created 3 APPROVED stores (Store 3 reserved for Unrated state testing)");

  // 4. Seed 5 USERs
  const userPassword = bcrypt.hashSync("User@123", 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "David Kim",
        email: "user1@example.com",
        password: userPassword,
        role: "USER",
        address: "201 Cedar St, Seattle, WA 98121",
      },
    }),
    prisma.user.create({
      data: {
        name: "Elena Rostova",
        email: "user2@example.com",
        password: userPassword,
        role: "USER",
        address: "305 Pine St, Seattle, WA 98101",
      },
    }),
    prisma.user.create({
      data: {
        name: "Franklin Vance",
        email: "user3@example.com",
        password: userPassword,
        role: "USER",
        address: "412 Oak Blvd, Portland, OR 97202",
      },
    }),
    prisma.user.create({
      data: {
        name: "Grace Hopper",
        email: "user4@example.com",
        password: userPassword,
        role: "USER",
        address: "515 Maple Dr, Portland, OR 97204",
      },
    }),
    prisma.user.create({
      data: {
        name: "Hassan Ali",
        email: "user5@example.com",
        password: userPassword,
        role: "USER",
        address: "620 Birch Rd, San Jose, CA 95125",
      },
    }),
  ]);
  console.log("Created 5 USER accounts");

  // 5. Seed spread of ratings across stores
  // Store 1 Ratings (Avg: (5+4+5+4)/4 = 4.5)
  await prisma.rating.createMany({
    data: [
      { userId: users[0].id, storeId: store1.id, rating: 5 },
      { userId: users[1].id, storeId: store1.id, rating: 4 },
      { userId: users[2].id, storeId: store1.id, rating: 5 },
      { userId: users[3].id, storeId: store1.id, rating: 4 },
    ],
  });

  // Store 2 Ratings (Avg: (3+4+5)/3 = 4.0)
  await prisma.rating.createMany({
    data: [
      { userId: users[0].id, storeId: store2.id, rating: 3 },
      { userId: users[2].id, storeId: store2.id, rating: 4 },
      { userId: users[4].id, storeId: store2.id, rating: 5 },
    ],
  });

  // Store 3 has 0 ratings (Unrated path)
  console.log("Created rating records across stores (Store 3 left unrated)");
  console.log("✅ Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
