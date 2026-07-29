-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `clerkId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Customer_clerkId_key` ON `Customer`(`clerkId`);

