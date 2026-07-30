-- AlterTable Customer
ALTER TABLE `Customer` DROP INDEX `Customer_clerkId_key`;
ALTER TABLE `Customer` DROP COLUMN `clerkId`;
ALTER TABLE `Customer` ADD COLUMN `authProvider` VARCHAR(191) NULL,
    ADD COLUMN `authUid` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Customer_authUid_key` ON `Customer`(`authUid`);

-- AlterTable User
ALTER TABLE `User` DROP INDEX `User_clerkId_key`;
ALTER TABLE `User` DROP COLUMN `clerkId`;
ALTER TABLE `User` ADD COLUMN `authProvider` VARCHAR(191) NULL,
    ADD COLUMN `authUid` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `User_authUid_key` ON `User`(`authUid`);
