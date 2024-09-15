/*
  Warnings:

  - Made the column `section_id` on table `periods` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacher_id` on table `periods` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `periods` DROP FOREIGN KEY `periods_room_id_fkey`;

-- DropForeignKey
ALTER TABLE `periods` DROP FOREIGN KEY `periods_section_id_fkey`;

-- DropForeignKey
ALTER TABLE `periods` DROP FOREIGN KEY `periods_teacher_id_fkey`;

-- AlterTable
ALTER TABLE `periods` ADD COLUMN `class_id` INTEGER NULL,
    MODIFY `room_id` INTEGER NULL,
    MODIFY `start_time` VARCHAR(191) NOT NULL,
    MODIFY `end_time` VARCHAR(191) NOT NULL,
    MODIFY `section_id` INTEGER NOT NULL,
    MODIFY `teacher_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `periods` ADD CONSTRAINT `periods_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periods` ADD CONSTRAINT `periods_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periods` ADD CONSTRAINT `periods_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periods` ADD CONSTRAINT `periods_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
