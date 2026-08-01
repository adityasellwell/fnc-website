-- AlterTable
ALTER TABLE `Customer` MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Banner` MODIFY `placement` ENUM('HERO', 'CATEGORY', 'POPUP', 'PROMO_STRIP') NOT NULL;

