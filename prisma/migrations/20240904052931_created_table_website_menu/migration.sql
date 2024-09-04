-- CreateTable
CREATE TABLE `website_menus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NULL,
    `english_title` VARCHAR(191) NOT NULL,
    `bangla_title` VARCHAR(191) NULL,
    `link_type` VARCHAR(191) NOT NULL,
    `website_link` VARCHAR(191) NOT NULL,
    `status` ENUM('publish', 'unpublish') NOT NULL DEFAULT 'publish',
    `dynamic_page_id` INTEGER NULL,
    `school_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website_dynamic_pages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `english_title` VARCHAR(191) NOT NULL,
    `bangla_title` VARCHAR(191) NOT NULL,
    `english_description` JSON NOT NULL,
    `bangla_description` JSON NOT NULL,
    `feature_photo` VARCHAR(191) NULL,
    `status` ENUM('publish', 'unpublish') NOT NULL,
    `school_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `website_menus` ADD CONSTRAINT `website_menus_dynamic_page_id_fkey` FOREIGN KEY (`dynamic_page_id`) REFERENCES `website_dynamic_pages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_menus` ADD CONSTRAINT `website_menus_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_menus` ADD CONSTRAINT `website_menus_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `website_menus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_dynamic_pages` ADD CONSTRAINT `website_dynamic_pages_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
