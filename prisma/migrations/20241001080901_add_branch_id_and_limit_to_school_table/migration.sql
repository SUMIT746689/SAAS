-- AlterTable
ALTER TABLE `schools` ADD COLUMN `branch_id` INTEGER NULL,
    ADD COLUMN `branch_limit` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `schools` ADD CONSTRAINT `schools_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
