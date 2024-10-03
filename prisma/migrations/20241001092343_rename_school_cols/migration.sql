/*
  Warnings:

  - You are about to drop the column `branch_id` on the `schools` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `schools` DROP FOREIGN KEY `schools_branch_id_fkey`;

-- AlterTable
ALTER TABLE `schools` DROP COLUMN `branch_id`,
    ADD COLUMN `parent_school_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `schools` ADD CONSTRAINT `schools_parent_school_id_fkey` FOREIGN KEY (`parent_school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
