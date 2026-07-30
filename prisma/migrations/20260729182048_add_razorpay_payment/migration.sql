-- AlterTable
ALTER TABLE `Order` ADD COLUMN `razorpayOrderId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayPaymentId` VARCHAR(191) NULL,
    ADD COLUMN `razorpaySignature` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PaymentAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'RAZORPAY',
    `eventId` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `signature` VARCHAR(191) NULL,
    `processingResult` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentAuditLog_orderId_idx`(`orderId`),
    INDEX `PaymentAuditLog_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Order_razorpayOrderId_key` ON `Order`(`razorpayOrderId`);

-- CreateIndex
CREATE UNIQUE INDEX `Order_razorpayPaymentId_key` ON `Order`(`razorpayPaymentId`);

-- AddForeignKey
ALTER TABLE `PaymentAuditLog` ADD CONSTRAINT `PaymentAuditLog_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
