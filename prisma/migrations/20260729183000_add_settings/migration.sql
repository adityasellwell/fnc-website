-- CreateTable
CREATE TABLE `Settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `deliveryRadiusKm` DOUBLE NOT NULL DEFAULT 5.0,
    `deliveryCharge` DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    `minOrderValue` DECIMAL(10, 2) NOT NULL DEFAULT 200.00,
    `freeDeliveryThreshold` DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    `zomatoUrl` VARCHAR(191) NULL,
    `swiggyUrl` VARCHAR(191) NULL,
    `socialLinks` JSON NULL,
    `businessInfo` JSON NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
