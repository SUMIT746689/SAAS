/*
  Warnings:

  - You are about to drop the column `pdf_file_upload_photo_or_file` on the `website_dynamic_pages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `website_dynamic_pages` DROP COLUMN `pdf_file_upload_photo_or_file`,
    ADD COLUMN `pdf_url` VARCHAR(191) NULL;
