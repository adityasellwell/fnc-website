-- AlterTable
ALTER TABLE `Review` ADD COLUMN `orderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Review_orderId_idx` ON `Review`(`orderId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

