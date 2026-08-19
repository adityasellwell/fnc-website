-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `variantLabel` VARCHAR(191) NULL;
-- CreateTable
CREATE TABLE `VariantOption` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('WEIGHT', 'PIECES') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `VariantOption_type_idx`(`type`),
    UNIQUE INDEX `VariantOption_type_label_key`(`type`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantOptionId` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `ProductVariant_productId_idx`(`productId`),
    UNIQUE INDEX `ProductVariant_productId_variantOptionId_key`(`productId`, `variantOptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_variantOptionId_fkey` FOREIGN KEY (`variantOptionId`) REFERENCES `VariantOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
