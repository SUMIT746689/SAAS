-- AlterTable
ALTER TABLE `student_fees` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
