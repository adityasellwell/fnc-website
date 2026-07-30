-- AlterTable
ALTER TABLE `Order` ADD COLUMN `browser` VARCHAR(191) NULL,
    ADD COLUMN `deliveryDistance` DOUBLE NULL,
    ADD COLUMN `device` VARCHAR(191) NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `SearchLog` (
    `id` VARCHAR(191) NOT NULL,
    `query` VARCHAR(191) NOT NULL,
    `results` INTEGER NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NULL,
    `device` VARCHAR(191) NULL,
    `browser` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SearchLog_query_idx`(`query`),
    INDEX `SearchLog_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
