/*
  Warnings:

  - You are about to drop the column `chairman_speech` on the `website_uis` table. All the data in the column will be lost.
  - You are about to drop the column `history_description` on the `website_uis` table. All the data in the column will be lost.
  - You are about to drop the column `history_photo` on the `website_uis` table. All the data in the column will be lost.
  - You are about to drop the column `principal_speech` on the `website_uis` table. All the data in the column will be lost.
  - You are about to drop the column `school_history` on the `website_uis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `website_uis` DROP COLUMN `chairman_speech`,
    DROP COLUMN `history_description`,
    DROP COLUMN `history_photo`,
    DROP COLUMN `principal_speech`,
    DROP COLUMN `school_history`,
    ADD COLUMN `about_school_photo` VARCHAR(191) NULL,
    ADD COLUMN `assist_principal_photo` VARCHAR(191) NULL,
    ADD COLUMN `bangla_about_school_desc` LONGTEXT NULL,
    ADD COLUMN `bangla_assist_principal_name` VARCHAR(191) NULL,
    ADD COLUMN `bangla_assist_principal_speech` LONGTEXT NULL,
    ADD COLUMN `bangla_chairman_name` VARCHAR(191) NULL,
    ADD COLUMN `bangla_chairman_speech` LONGTEXT NULL,
    ADD COLUMN `bangla_principal_name` VARCHAR(191) NULL,
    ADD COLUMN `bangla_principal_speech` LONGTEXT NULL,
    ADD COLUMN `english_about_school_desc` LONGTEXT NULL,
    ADD COLUMN `english_assist_principal_name` VARCHAR(191) NULL,
    ADD COLUMN `english_assist_principal_speech` LONGTEXT NULL,
    ADD COLUMN `english_chairman_name` VARCHAR(191) NULL,
    ADD COLUMN `english_chairman_speech` LONGTEXT NULL,
    ADD COLUMN `english_principal_name` VARCHAR(191) NULL,
    ADD COLUMN `english_principal_speech` LONGTEXT NULL,
    MODIFY `header_image` VARCHAR(191) NULL,
    MODIFY `chairman_photo` VARCHAR(191) NULL,
    MODIFY `principal_photo` VARCHAR(191) NULL;
