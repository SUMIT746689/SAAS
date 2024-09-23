-- DropForeignKey
ALTER TABLE `homework` DROP FOREIGN KEY `homework_student_id_fkey`;

-- AlterTable
ALTER TABLE `homework` ADD COLUMN `class_id` INTEGER NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `live_class_link` VARCHAR(191) NULL,
    ADD COLUMN `school_id` INTEGER NULL,
    ADD COLUMN `section_id` INTEGER NULL,
    ADD COLUMN `youtuble_class_link` VARCHAR(191) NULL,
    MODIFY `student_id` INTEGER NULL,
    MODIFY `file_path` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `homework` ADD CONSTRAINT `homework_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homework` ADD CONSTRAINT `homework_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homework` ADD CONSTRAINT `homework_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homework` ADD CONSTRAINT `homework_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
