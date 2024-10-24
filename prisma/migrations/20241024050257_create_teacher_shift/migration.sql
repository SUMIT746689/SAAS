-- AlterTable
ALTER TABLE `teachers` ADD COLUMN `teacherShiftId` INTEGER NULL;

-- CreateTable
CREATE TABLE `teacher_shifts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `entry_time` TIME NULL,
    `late_time` TIME NULL,
    `absence_time` TIME NULL,
    `exit_time` TIME NULL,
    `school_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_teacherShiftId_fkey` FOREIGN KEY (`teacherShiftId`) REFERENCES `teacher_shifts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_shifts` ADD CONSTRAINT `teacher_shifts_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
