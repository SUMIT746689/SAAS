/*
  Warnings:

  - You are about to drop the column `parent_id` on the `website_Quick_Links` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `website_Quick_Links` DROP FOREIGN KEY `website_Quick_Links_parent_id_fkey`;

-- AlterTable
ALTER TABLE `website_Quick_Links` DROP COLUMN `parent_id`;
