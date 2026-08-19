-- AlterTable
ALTER TABLE `Product` ADD COLUMN `customAttributes` JSON NULL,
    ADD COLUMN `sku` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Product_sku_key` ON `Product`(`sku`);
