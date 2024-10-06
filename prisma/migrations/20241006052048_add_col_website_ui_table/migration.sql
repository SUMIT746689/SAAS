-- AlterTable
ALTER TABLE `classes` ADD COLUMN `scholarship_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `website_uis` ADD COLUMN `bangla_scholarship_name` VARCHAR(191) NULL,
    ADD COLUMN `english_scholarship_name` VARCHAR(191) NULL,
    ADD COLUMN `is_scholarship_active` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_scholarship_id_fkey` FOREIGN KEY (`scholarship_id`) REFERENCES `website_uis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
