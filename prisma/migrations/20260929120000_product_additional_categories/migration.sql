-- CreateTable
CREATE TABLE `_ProductAdditionalCategories` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProductAdditionalCategories_AB_unique`(`A`, `B`),
    INDEX `_ProductAdditionalCategories_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProductAdditionalCategories` ADD CONSTRAINT `_ProductAdditionalCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductAdditionalCategories` ADD CONSTRAINT `_ProductAdditionalCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
