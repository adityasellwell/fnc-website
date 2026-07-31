-- AlterTable
ALTER TABLE `Order` ADD COLUMN `packingNotes` TEXT NULL,
    ADD COLUMN `riderName` VARCHAR(191) NULL,
    ADD COLUMN `riderPhone` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `StoreInventory` (
    `id` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StoreInventory_productId_idx`(`productId`),
    UNIQUE INDEX `StoreInventory_storeId_productId_key`(`storeId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_storeId_idx` ON `Order`(`storeId`);

-- AddForeignKey
ALTER TABLE `StoreInventory` ADD CONSTRAINT `StoreInventory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreInventory` ADD CONSTRAINT `StoreInventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

