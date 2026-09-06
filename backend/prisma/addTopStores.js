const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existingCount = await prisma.store.count({ where: { status: "APPROVED" } });
  console.log(`Current approved stores: ${existingCount}`);

  if (existingCount >= 10) {
    console.log("Already have 10 or more approved stores.");
    return;
  }

  // Get owner accounts
  const owners = await prisma.user.findMany({ where: { role: "STORE_OWNER" } });
  const users = await prisma.user.findMany({ where: { role: "USER" } });

  if (owners.length === 0 || users.length === 0) {
    console.error("Not enough owners or users to seed stores.");
    return;
  }

  const newStoresData = [
    {
      name: "Artisan Bakery & Cafe",
      email: "hello@artisanbakery.com",
      address: "101 Flour Ave, San Francisco, CA 94102",
      category: "Food & Beverage",
      tags: "pastries,coffee,organic,breakfast",
      ratings: [5, 5], // avg 5.0 -> Rank 1
    },
    {
      name: "Green Leaf Organic Market",
      email: "info@greenleafmarket.com",
      address: "244 Eco Boulevard, Austin, TX 78701",
      category: "Grocery",
      tags: "organic,fresh,produce,vegan",
      ratings: [5, 5, 4, 5], // avg 4.8 -> Rank 2
    },
    {
      name: "Apex Fitness & Gym",
      email: "membership@apexfit.com",
      address: "710 Iron Street, Chicago, IL 60601",
      category: "Health & Fitness",
      tags: "gym,fitness,crossfit,training",
      ratings: [5, 5, 4], // avg 4.7 -> Rank 3
    },
    {
      name: "Vintage Vinyl Records",
      email: "contact@vintagevinyl.com",
      address: "55 Melody Lane, Nashville, TN 37203",
      category: "Music & Entertainment",
      tags: "vinyl,music,vintage,audiophile",
      ratings: [5, 4, 5], // avg 4.7 -> Rank 4
    },
    {
      name: "Blue Ocean Bookstore",
      email: "reads@blueoceanbooks.com",
      address: "320 Harbor Road, Boston, MA 02108",
      category: "Books & Stationery",
      tags: "books,stationery,reading,cafe",
      ratings: [4, 4, 4], // avg 4.0 -> Rank 7
    },
    {
      name: "Pixel Perfect Gaming Lounge",
      email: "play@pixelperfect.gg",
      address: "88 Cyber Lane, Los Angeles, CA 90012",
      category: "Gaming & Esports",
      tags: "esports,pc,consoles,vr",
      ratings: [4, 4, 3, 4], // avg 3.8 -> Rank 8
    },
    {
      name: "Summit Outdoor Gear",
      email: "explore@summitgear.com",
      address: "990 Mountain Ridge Way, Denver, CO 80202",
      category: "Sports & Outdoors",
      tags: "hiking,camping,climbing,gear",
      ratings: [4, 3, 3], // avg 3.3 -> Rank 9
    },
  ];

  for (let i = 0; i < newStoresData.length; i++) {
    const item = newStoresData[i];
    const owner = owners[i % owners.length];

    // Check if store already exists
    const existing = await prisma.store.findFirst({
      where: { name: item.name },
    });

    if (!existing) {
      const store = await prisma.store.create({
        data: {
          name: item.name,
          email: item.email,
          address: item.address,
          category: item.category,
          tags: item.tags,
          status: "APPROVED",
          ownerId: owner.id,
        },
      });

      console.log(`Created store #${store.id}: ${store.name}`);

      // Seed ratings with distinct users
      for (let r = 0; r < item.ratings.length; r++) {
        const ratingVal = item.ratings[r];
        const user = users[r % users.length];

        await prisma.rating.create({
          data: {
            storeId: store.id,
            userId: user.id,
            rating: ratingVal,
          },
        });
      }
    }
  }

  const finalCount = await prisma.store.count({ where: { status: "APPROVED" } });
  console.log(`Final approved stores count: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
