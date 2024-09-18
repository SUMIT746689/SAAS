-- AlterTable
ALTER TABLE `Discount` ADD COLUMN `school_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Discount` ADD CONSTRAINT `Discount_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
