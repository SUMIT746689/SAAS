-- AlterTable
ALTER TABLE `fees` ADD COLUMN `batch_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `fees` ADD CONSTRAINT `fees_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
