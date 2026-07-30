-- AlterTable
ALTER TABLE `Review` ADD COLUMN `customerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Review_customerId_idx` ON `Review`(`customerId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

