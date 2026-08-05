-- AlterTable
ALTER TABLE `Order` ADD COLUMN `deliveryOtp` VARCHAR(191) NULL,
    ADD COLUMN `deliveryPartnerId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `DeliveryPartner` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `pinHash` VARCHAR(191) NOT NULL,
    `pinSalt` VARCHAR(191) NOT NULL,
    `vehicleType` VARCHAR(191) NULL,
    `vehicleNumber` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE', 'BUSY', 'OFFLINE') NOT NULL DEFAULT 'OFFLINE',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `storeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DeliveryPartner_phone_key`(`phone`),
    INDEX `DeliveryPartner_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_deliveryPartnerId_idx` ON `Order`(`deliveryPartnerId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_deliveryPartnerId_fkey` FOREIGN KEY (`deliveryPartnerId`) REFERENCES `DeliveryPartner`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryPartner` ADD CONSTRAINT `DeliveryPartner_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

