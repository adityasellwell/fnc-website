-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `lastWinBackSmsAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `cartReminderSentAt` DATETIME(3) NULL;
