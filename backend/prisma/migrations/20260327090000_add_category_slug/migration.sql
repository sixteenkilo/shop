ALTER TABLE `Category`
    ADD COLUMN `slug` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Category_slug_key` ON `Category`(`slug`);
