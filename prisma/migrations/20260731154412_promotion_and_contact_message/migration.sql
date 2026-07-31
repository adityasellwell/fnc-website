-- DropForeignKey
ALTER TABLE `_CouponProducts` DROP FOREIGN KEY `_CouponProducts_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CouponProducts` DROP FOREIGN KEY `_CouponProducts_B_fkey`;

-- DropForeignKey
ALTER TABLE `_OfferProducts` DROP FOREIGN KEY `_OfferProducts_A_fkey`;

-- DropForeignKey
ALTER TABLE `_OfferProducts` DROP FOREIGN KEY `_OfferProducts_B_fkey`;

-- DropTable
DROP TABLE `Coupon`;

-- DropTable
DROP TABLE `Offer`;

-- DropTable
DROP TABLE `_CouponProducts`;

-- DropTable
DROP TABLE `_OfferProducts`;

-- CreateTable
CREATE TABLE `Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('COUPON', 'OFFER') NOT NULL DEFAULT 'COUPON',
    `code` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `discountType` ENUM('PERCENT', 'FLAT', 'BOGO') NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `minOrderValue` DECIMAL(10, 2) NULL,
    `appliesTo` ENUM('PRODUCT', 'CATEGORY', 'CART') NOT NULL DEFAULT 'CART',
    `scopeCategoryId` VARCHAR(191) NULL,
    `bannerImage` VARCHAR(191) NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Promotion_code_key`(`code`),
    INDEX `Promotion_active_idx`(`active`),
    INDEX `Promotion_startsAt_endsAt_idx`(`startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PromotionProducts` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PromotionProducts_AB_unique`(`A`, `B`),
    INDEX `_PromotionProducts_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PromotionProducts` ADD CONSTRAINT `_PromotionProducts_A_fkey` FOREIGN KEY (`A`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PromotionProducts` ADD CONSTRAINT `_PromotionProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Promotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

