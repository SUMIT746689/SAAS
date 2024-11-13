-- AlterTable
ALTER TABLE `website_Quick_Links` ADD COLUMN `parent_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `website_Quick_Links` ADD CONSTRAINT `website_Quick_Links_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `website_Quick_Links`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
