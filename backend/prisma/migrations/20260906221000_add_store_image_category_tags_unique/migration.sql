-- AlterTable
ALTER TABLE `stores` ADD COLUMN `category` VARCHAR(50) NOT NULL DEFAULT 'General',
    ADD COLUMN `imageUrl` VARCHAR(255) NULL,
    ADD COLUMN `tags` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `stores_category_idx` ON `stores`(`category`);

-- CreateIndex
CREATE INDEX `stores_tags_idx` ON `stores`(`tags`);

-- CreateIndex
CREATE UNIQUE INDEX `stores_ownerId_name_address_key` ON `stores`(`ownerId`, `name`, `address`);
