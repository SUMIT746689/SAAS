-- CreateTable
CREATE TABLE `website_Quick_Links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `english_title` VARCHAR(191) NOT NULL,
    `bangla_title` VARCHAR(191) NULL,
    `link_type` VARCHAR(191) NOT NULL,
    `website_link` VARCHAR(191) NOT NULL,
    `status` ENUM('publish', 'unpublish') NOT NULL DEFAULT 'publish',
    `dynamic_page_id` INTEGER NULL,
    `school_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `website_Quick_Links` ADD CONSTRAINT `website_Quick_Links_dynamic_page_id_fkey` FOREIGN KEY (`dynamic_page_id`) REFERENCES `website_dynamic_pages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_Quick_Links` ADD CONSTRAINT `website_Quick_Links_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
