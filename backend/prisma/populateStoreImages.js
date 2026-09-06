const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const https = require("https");

const prisma = new PrismaClient();

const storeImageMappings = {
  6: {
    name: "Craft & Roast Coffeehouse",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    filename: "store-6-coffeehouse.jpg",
  },
  7: {
    name: "Urban Threads Boutique",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    filename: "store-7-boutique.jpg",
  },
  8: {
    name: "Tech Horizon Gadgets",
    url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80",
    filename: "store-8-tech.jpg",
  },
  13: {
    name: "Unique Boutique Store 1788713077241",
    url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
    filename: "store-13-boutique.jpg",
  },
  15: {
    name: "Unique Boutique Store 1788716631533",
    url: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=80",
    filename: "store-15-gadgets.jpg",
  },
  19: {
    name: "Artisan Bakery & Cafe",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    filename: "store-19-bakery.jpg",
  },
  20: {
    name: "Green Leaf Organic Market",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    filename: "store-20-market.jpg",
  },
  21: {
    name: "Apex Fitness & Gym",
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    filename: "store-21-gym.jpg",
  },
  22: {
    name: "Vintage Vinyl Records",
    url: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80",
    filename: "store-22-records.jpg",
  },
  23: {
    name: "Blue Ocean Bookstore",
    url: "https://images.unsplash.com/photo-1507842229458-5776ab68c928?auto=format&fit=crop&w=1200&q=80",
    filename: "store-23-bookstore.jpg",
  },
  24: {
    name: "Pixel Perfect Gaming Lounge",
    url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    filename: "store-24-gaming.jpg",
  },
  25: {
    name: "Summit Outdoor Gear",
    url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
    filename: "store-25-outdoors.jpg",
  },
};

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    function get(currentUrl) {
      https
        .get(currentUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return get(res.headers.location);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`Failed to download ${currentUrl}, status code: ${res.statusCode}`));
          }
          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close(() => resolve());
          });
          fileStream.on("error", (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    }
    get(url);
  });
}

async function main() {
  const uploadsDir = path.join(__dirname, "../uploads/stores");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Remove test file if present
  const testFile = path.join(uploadsDir, "test-coffee.jpg");
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }

  const stores = await prisma.store.findMany();
  console.log(`Found ${stores.length} stores in database.`);

  for (const store of stores) {
    const mapping = storeImageMappings[store.id];
    if (!mapping) {
      console.log(`No mapping defined for store id ${store.id} (${store.name}), skipping.`);
      continue;
    }

    const destPath = path.join(uploadsDir, mapping.filename);
    console.log(`Downloading storefront image for Store #${store.id}: "${store.name}"...`);

    try {
      await downloadImage(mapping.url, destPath);
      const stats = fs.statSync(destPath);
      console.log(`Saved ${mapping.filename} (${stats.size} bytes).`);

      const relativeUrl = `/uploads/stores/${mapping.filename}`;
      await prisma.store.update({
        where: { id: store.id },
        data: { imageUrl: relativeUrl },
      });
      console.log(`Updated database record for Store #${store.id} with imageUrl = "${relativeUrl}".`);
    } catch (err) {
      console.error(`Error processing store #${store.id}:`, err.message);
    }
  }

  console.log("\n--- Verification of all stores in database ---");
  const updatedStores = await prisma.store.findMany({
    select: { id: true, name: true, category: true, imageUrl: true, status: true },
  });
  console.log(JSON.stringify(updatedStores, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
