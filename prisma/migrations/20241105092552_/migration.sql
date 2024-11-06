-- AlterTable
ALTER TABLE `website_uis` ADD COLUMN `branch_wise_addmission` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_branch_wise_fees_collection` BOOLEAN NOT NULL DEFAULT false;
