-- ============================================================
-- Real Estate Platform - Borg El Arab, Egypt
-- Database Schema v1.0.0
-- ============================================================

USE realestate_db;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`              CHAR(36)      NOT NULL DEFAULT (UUID()),
  `phone`           VARCHAR(20)   NOT NULL,
  `email`           VARCHAR(255)  NULL,
  `password_hash`   VARCHAR(255)  NULL,
  `first_name`      VARCHAR(100)  NOT NULL,
  `last_name`       VARCHAR(100)  NOT NULL,
  `avatar_url`      TEXT          NULL,
  `role`            ENUM('CUSTOMER','BROKER','COMPANY','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `is_active`       BOOLEAN       NOT NULL DEFAULT TRUE,
  `is_verified`     BOOLEAN       NOT NULL DEFAULT FALSE,
  `phone_verified`  BOOLEAN       NOT NULL DEFAULT FALSE,
  `email_verified`  BOOLEAN       NOT NULL DEFAULT FALSE,
  `last_login_at`   TIMESTAMP     NULL,
  `fcm_token`       TEXT          NULL,
  `preferred_lang`  ENUM('ar','en') NOT NULL DEFAULT 'ar',
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      TIMESTAMP     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  UNIQUE KEY `uq_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_is_active` (`is_active`),
  INDEX `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- OTP VERIFICATION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id`          CHAR(36)    NOT NULL DEFAULT (UUID()),
  `phone`       VARCHAR(20) NOT NULL,
  `otp_code`    VARCHAR(10) NOT NULL,
  `purpose`     ENUM('LOGIN','REGISTER','RESET_PASSWORD','PHONE_VERIFY') NOT NULL,
  `is_used`     BOOLEAN     NOT NULL DEFAULT FALSE,
  `attempts`    TINYINT     NOT NULL DEFAULT 0,
  `expires_at`  TIMESTAMP   NOT NULL,
  `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_otp_phone_purpose` (`phone`, `purpose`),
  INDEX `idx_otp_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REFRESH TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`          CHAR(36)    NOT NULL DEFAULT (UUID()),
  `user_id`     CHAR(36)    NOT NULL,
  `token_hash`  VARCHAR(255) NOT NULL,
  `device_id`   VARCHAR(255) NULL,
  `device_type` VARCHAR(50)  NULL,
  `ip_address`  VARCHAR(45)  NULL,
  `expires_at`  TIMESTAMP   NOT NULL,
  `revoked_at`  TIMESTAMP   NULL,
  `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_refresh_tokens_user_id` (`user_id`),
  INDEX `idx_refresh_tokens_token_hash` (`token_hash`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- COMPANIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `companies` (
  `id`                CHAR(36)     NOT NULL DEFAULT (UUID()),
  `owner_id`          CHAR(36)     NOT NULL,
  `name`              VARCHAR(255) NOT NULL,
  `name_ar`           VARCHAR(255) NULL,
  `description`       TEXT         NULL,
  `description_ar`    TEXT         NULL,
  `logo_url`          TEXT         NULL,
  `cover_url`         TEXT         NULL,
  `phone`             VARCHAR(20)  NULL,
  `email`             VARCHAR(255) NULL,
  `website`           VARCHAR(255) NULL,
  `address`           TEXT         NULL,
  `tax_number`        VARCHAR(100) NULL,
  `commercial_reg`    VARCHAR(100) NULL,
  `is_verified`       BOOLEAN      NOT NULL DEFAULT FALSE,
  `is_active`         BOOLEAN      NOT NULL DEFAULT TRUE,
  `verified_at`       TIMESTAMP    NULL,
  `verified_by`       CHAR(36)     NULL,
  `created_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`        TIMESTAMP    NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_companies_owner` (`owner_id`),
  INDEX `idx_companies_is_verified` (`is_verified`),
  CONSTRAINT `fk_companies_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BROKERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `brokers` (
  `id`                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  `user_id`             CHAR(36)     NOT NULL,
  `company_id`          CHAR(36)     NULL,
  `license_number`      VARCHAR(100) NULL,
  `national_id`         VARCHAR(50)  NULL,
  `national_id_front`   TEXT         NULL,
  `national_id_back`    TEXT         NULL,
  `bio`                 TEXT         NULL,
  `bio_ar`              TEXT         NULL,
  `specializations`     JSON         NULL,
  `service_areas`       JSON         NULL,
  `rating`              DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `total_ratings`       INT          NOT NULL DEFAULT 0,
  `total_properties`    INT          NOT NULL DEFAULT 0,
  `total_deals`         INT          NOT NULL DEFAULT 0,
  `is_verified`         BOOLEAN      NOT NULL DEFAULT FALSE,
  `is_featured`         BOOLEAN      NOT NULL DEFAULT FALSE,
  `verified_at`         TIMESTAMP    NULL,
  `verified_by`         CHAR(36)     NULL,
  `subscription_id`     CHAR(36)     NULL,
  `created_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`          TIMESTAMP    NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_brokers_user_id` (`user_id`),
  INDEX `idx_brokers_company` (`company_id`),
  INDEX `idx_brokers_is_verified` (`is_verified`),
  INDEX `idx_brokers_rating` (`rating`),
  CONSTRAINT `fk_brokers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_brokers_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `properties` (
  `id`              CHAR(36)      NOT NULL DEFAULT (UUID()),
  `broker_id`       CHAR(36)      NOT NULL,
  `company_id`      CHAR(36)      NULL,
  `title`           VARCHAR(500)  NOT NULL,
  `title_ar`        VARCHAR(500)  NULL,
  `description`     LONGTEXT      NOT NULL,
  `description_ar`  LONGTEXT      NULL,
  `type`            ENUM(
                      'APARTMENT','VILLA','LAND','OFFICE',
                      'SHOP','WAREHOUSE','FACTORY',
                      'COMMERCIAL_BUILDING','CHALET','DUPLEX',
                      'PENTHOUSE','STUDIO','TOWNHOUSE'
                    ) NOT NULL,
  `listing_type`    ENUM('SALE','RENT','DAILY_RENT') NOT NULL,
  `status`          ENUM('DRAFT','PENDING','ACTIVE','SOLD','RENTED','SUSPENDED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `price`           DECIMAL(15,2) NOT NULL,
  `currency`        ENUM('EGP','USD','EUR') NOT NULL DEFAULT 'EGP',
  `price_per`       ENUM('TOTAL','METER','NIGHT','MONTH','YEAR') NOT NULL DEFAULT 'TOTAL',
  `area`            DECIMAL(10,2) NOT NULL COMMENT 'in square meters',
  `bedrooms`        TINYINT       NULL,
  `bathrooms`       TINYINT       NULL,
  `floor`           SMALLINT      NULL,
  `total_floors`    SMALLINT      NULL,
  `parking_spaces`  TINYINT       NOT NULL DEFAULT 0,
  `furnished`       ENUM('FURNISHED','SEMI_FURNISHED','UNFURNISHED') NULL,
  `condition`       ENUM('NEW','EXCELLENT','GOOD','NEEDS_RENOVATION') NULL,
  `year_built`      YEAR          NULL,
  `is_featured`     BOOLEAN       NOT NULL DEFAULT FALSE,
  `is_verified`     BOOLEAN       NOT NULL DEFAULT FALSE,
  `views_count`     INT           NOT NULL DEFAULT 0,
  `favorites_count` INT           NOT NULL DEFAULT 0,
  `approved_by`     CHAR(36)      NULL,
  `approved_at`     TIMESTAMP     NULL,
  `rejection_reason` TEXT         NULL,
  `expires_at`      TIMESTAMP     NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      TIMESTAMP     NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_properties_broker` (`broker_id`),
  INDEX `idx_properties_company` (`company_id`),
  INDEX `idx_properties_type` (`type`),
  INDEX `idx_properties_listing_type` (`listing_type`),
  INDEX `idx_properties_status` (`status`),
  INDEX `idx_properties_price` (`price`),
  INDEX `idx_properties_area` (`area`),
  INDEX `idx_properties_bedrooms` (`bedrooms`),
  INDEX `idx_properties_is_featured` (`is_featured`),
  INDEX `idx_properties_created_at` (`created_at`),
  INDEX `idx_properties_deleted_at` (`deleted_at`),
  FULLTEXT INDEX `ft_properties_search` (`title`, `description`, `title_ar`, `description_ar`),
  CONSTRAINT `fk_properties_broker` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`),
  CONSTRAINT `fk_properties_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTY LOCATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `property_locations` (
  `id`            CHAR(36)     NOT NULL DEFAULT (UUID()),
  `property_id`   CHAR(36)     NOT NULL,
  `latitude`      DECIMAL(10,8) NOT NULL,
  `longitude`     DECIMAL(11,8) NOT NULL,
  `address`       TEXT         NOT NULL,
  `address_ar`    TEXT         NULL,
  `city`          VARCHAR(100) NOT NULL DEFAULT 'Borg El Arab',
  `district`      VARCHAR(100) NULL,
  `neighborhood`  VARCHAR(100) NULL,
  `postal_code`   VARCHAR(20)  NULL,
  `country`       VARCHAR(100) NOT NULL DEFAULT 'Egypt',
  `google_place_id` VARCHAR(255) NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_property_location` (`property_id`),
  INDEX `idx_property_loc_coords` (`latitude`, `longitude`),
  CONSTRAINT `fk_property_location_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTY IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `property_images` (
  `id`          CHAR(36)    NOT NULL DEFAULT (UUID()),
  `property_id` CHAR(36)    NOT NULL,
  `url`         TEXT        NOT NULL,
  `thumbnail_url` TEXT      NULL,
  `alt_text`    VARCHAR(255) NULL,
  `sort_order`  SMALLINT    NOT NULL DEFAULT 0,
  `is_primary`  BOOLEAN     NOT NULL DEFAULT FALSE,
  `size_bytes`  INT         NULL,
  `width`       SMALLINT    NULL,
  `height`      SMALLINT    NULL,
  `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_property_images_property` (`property_id`),
  INDEX `idx_property_images_primary` (`property_id`, `is_primary`),
  CONSTRAINT `fk_property_images_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTY VIDEOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `property_videos` (
  `id`            CHAR(36)    NOT NULL DEFAULT (UUID()),
  `property_id`   CHAR(36)    NOT NULL,
  `url`           TEXT        NOT NULL,
  `thumbnail_url` TEXT        NULL,
  `duration`      INT         NULL COMMENT 'in seconds',
  `size_bytes`    BIGINT      NULL,
  `sort_order`    SMALLINT    NOT NULL DEFAULT 0,
  `created_at`    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_property_videos_property` (`property_id`),
  CONSTRAINT `fk_property_videos_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTY FEATURES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `property_features` (
  `id`          CHAR(36)    NOT NULL DEFAULT (UUID()),
  `property_id` CHAR(36)    NOT NULL,
  `feature`     VARCHAR(100) NOT NULL,
  `feature_ar`  VARCHAR(100) NULL,
  `category`    ENUM('INDOOR','OUTDOOR','SECURITY','UTILITIES','NEARBY') NOT NULL DEFAULT 'INDOOR',
  `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_property_features_property` (`property_id`),
  CONSTRAINT `fk_property_features_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- FAVORITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `favorites` (
  `id`          CHAR(36)  NOT NULL DEFAULT (UUID()),
  `user_id`     CHAR(36)  NOT NULL,
  `property_id` CHAR(36)  NOT NULL,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorites_user_property` (`user_id`, `property_id`),
  INDEX `idx_favorites_user` (`user_id`),
  INDEX `idx_favorites_property` (`property_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CHATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `chats` (
  `id`              CHAR(36)  NOT NULL DEFAULT (UUID()),
  `customer_id`     CHAR(36)  NOT NULL,
  `broker_id`       CHAR(36)  NOT NULL,
  `property_id`     CHAR(36)  NULL,
  `last_message_id` CHAR(36)  NULL,
  `customer_unread` INT       NOT NULL DEFAULT 0,
  `broker_unread`   INT       NOT NULL DEFAULT 0,
  `is_archived`     BOOLEAN   NOT NULL DEFAULT FALSE,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_chat_customer_broker_property` (`customer_id`, `broker_id`, `property_id`),
  INDEX `idx_chats_customer` (`customer_id`),
  INDEX `idx_chats_broker` (`broker_id`),
  INDEX `idx_chats_property` (`property_id`),
  CONSTRAINT `fk_chats_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_chats_broker` FOREIGN KEY (`broker_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id`              CHAR(36)  NOT NULL DEFAULT (UUID()),
  `chat_id`         CHAR(36)  NOT NULL,
  `sender_id`       CHAR(36)  NOT NULL,
  `type`            ENUM('TEXT','IMAGE','VOICE','PROPERTY_CARD','SYSTEM') NOT NULL DEFAULT 'TEXT',
  `content`         TEXT      NULL,
  `media_url`       TEXT      NULL,
  `media_duration`  INT       NULL COMMENT 'for voice notes in seconds',
  `property_id`     CHAR(36)  NULL COMMENT 'for property card messages',
  `is_read`         BOOLEAN   NOT NULL DEFAULT FALSE,
  `read_at`         TIMESTAMP NULL,
  `deleted_at`      TIMESTAMP NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_messages_chat` (`chat_id`),
  INDEX `idx_messages_sender` (`sender_id`),
  INDEX `idx_messages_created_at` (`chat_id`, `created_at`),
  CONSTRAINT `fk_messages_chat` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `bookings` (
  `id`            CHAR(36)    NOT NULL DEFAULT (UUID()),
  `property_id`   CHAR(36)    NOT NULL,
  `customer_id`   CHAR(36)    NOT NULL,
  `broker_id`     CHAR(36)    NOT NULL,
  `type`          ENUM('VIEWING','RENTAL','PURCHASE') NOT NULL DEFAULT 'VIEWING',
  `status`        ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW') NOT NULL DEFAULT 'PENDING',
  `scheduled_at`  TIMESTAMP   NOT NULL,
  `duration`      SMALLINT    NULL COMMENT 'in minutes for visits',
  `check_in`      DATE        NULL COMMENT 'for rental bookings',
  `check_out`     DATE        NULL COMMENT 'for rental bookings',
  `total_price`   DECIMAL(15,2) NULL,
  `notes`         TEXT        NULL,
  `cancel_reason` TEXT        NULL,
  `cancelled_by`  CHAR(36)    NULL,
  `cancelled_at`  TIMESTAMP   NULL,
  `confirmed_at`  TIMESTAMP   NULL,
  `completed_at`  TIMESTAMP   NULL,
  `reminder_sent` BOOLEAN     NOT NULL DEFAULT FALSE,
  `created_at`    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_bookings_property` (`property_id`),
  INDEX `idx_bookings_customer` (`customer_id`),
  INDEX `idx_bookings_broker` (`broker_id`),
  INDEX `idx_bookings_status` (`status`),
  INDEX `idx_bookings_scheduled_at` (`scheduled_at`),
  CONSTRAINT `fk_bookings_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`),
  CONSTRAINT `fk_bookings_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_bookings_broker` FOREIGN KEY (`broker_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`          CHAR(36)     NOT NULL DEFAULT (UUID()),
  `user_id`     CHAR(36)     NOT NULL,
  `type`        ENUM(
                  'NEW_MESSAGE','BOOKING_REQUEST','BOOKING_CONFIRMED',
                  'BOOKING_CANCELLED','PROPERTY_APPROVED','PROPERTY_REJECTED',
                  'NEW_PROPERTY','PRICE_DROP','VISIT_REMINDER',
                  'SUBSCRIPTION_EXPIRY','SYSTEM','PROMOTION'
                ) NOT NULL,
  `title`       VARCHAR(255) NOT NULL,
  `title_ar`    VARCHAR(255) NULL,
  `body`        TEXT         NOT NULL,
  `body_ar`     TEXT         NULL,
  `data`        JSON         NULL,
  `is_read`     BOOLEAN      NOT NULL DEFAULT FALSE,
  `read_at`     TIMESTAMP    NULL,
  `sent_at`     TIMESTAMP    NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_is_read` (`user_id`, `is_read`),
  INDEX `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id`                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  `name`                VARCHAR(100) NOT NULL,
  `name_ar`             VARCHAR(100) NULL,
  `description`         TEXT         NULL,
  `price`               DECIMAL(10,2) NOT NULL,
  `currency`            ENUM('EGP','USD') NOT NULL DEFAULT 'EGP',
  `duration_days`       INT          NOT NULL,
  `max_properties`      INT          NOT NULL DEFAULT 10,
  `max_featured`        INT          NOT NULL DEFAULT 2,
  `max_images_per_prop` INT          NOT NULL DEFAULT 10,
  `max_videos_per_prop` INT          NOT NULL DEFAULT 2,
  `has_analytics`       BOOLEAN      NOT NULL DEFAULT FALSE,
  `has_priority_support` BOOLEAN     NOT NULL DEFAULT FALSE,
  `is_active`           BOOLEAN      NOT NULL DEFAULT TRUE,
  `sort_order`          TINYINT      NOT NULL DEFAULT 0,
  `created_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id`          CHAR(36)    NOT NULL DEFAULT (UUID()),
  `broker_id`   CHAR(36)    NOT NULL,
  `plan_id`     CHAR(36)    NOT NULL,
  `status`      ENUM('ACTIVE','EXPIRED','CANCELLED','PENDING') NOT NULL DEFAULT 'PENDING',
  `starts_at`   TIMESTAMP   NOT NULL,
  `expires_at`  TIMESTAMP   NOT NULL,
  `auto_renew`  BOOLEAN     NOT NULL DEFAULT FALSE,
  `cancelled_at` TIMESTAMP  NULL,
  `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_subscriptions_broker` (`broker_id`),
  INDEX `idx_subscriptions_status` (`status`),
  INDEX `idx_subscriptions_expires_at` (`expires_at`),
  CONSTRAINT `fk_subscriptions_broker` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`),
  CONSTRAINT `fk_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id`              CHAR(36)      NOT NULL DEFAULT (UUID()),
  `user_id`         CHAR(36)      NOT NULL,
  `subscription_id` CHAR(36)      NULL,
  `booking_id`      CHAR(36)      NULL,
  `amount`          DECIMAL(15,2) NOT NULL,
  `currency`        ENUM('EGP','USD') NOT NULL DEFAULT 'EGP',
  `method`          ENUM('CASH','BANK_TRANSFER','CARD','FAWRY','VODAFONE_CASH','INSTAPAY') NOT NULL,
  `status`          ENUM('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `transaction_id`  VARCHAR(255)  NULL,
  `gateway_response` JSON         NULL,
  `receipt_url`     TEXT          NULL,
  `notes`           TEXT          NULL,
  `paid_at`         TIMESTAMP     NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_user` (`user_id`),
  INDEX `idx_payments_status` (`status`),
  INDEX `idx_payments_subscription` (`subscription_id`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ADVERTISEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `advertisements` (
  `id`          CHAR(36)     NOT NULL DEFAULT (UUID()),
  `title`       VARCHAR(255) NOT NULL,
  `title_ar`    VARCHAR(255) NULL,
  `image_url`   TEXT         NOT NULL,
  `link_url`    TEXT         NULL,
  `property_id` CHAR(36)     NULL,
  `placement`   ENUM('HOME_BANNER','SEARCH_TOP','SIDEBAR','PROPERTY_LIST') NOT NULL DEFAULT 'HOME_BANNER',
  `is_active`   BOOLEAN      NOT NULL DEFAULT TRUE,
  `starts_at`   TIMESTAMP    NULL,
  `ends_at`     TIMESTAMP    NULL,
  `clicks`      INT          NOT NULL DEFAULT 0,
  `impressions` INT          NOT NULL DEFAULT 0,
  `sort_order`  TINYINT      NOT NULL DEFAULT 0,
  `created_by`  CHAR(36)     NOT NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ads_placement` (`placement`, `is_active`),
  INDEX `idx_ads_dates` (`starts_at`, `ends_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `reports` (
  `id`              CHAR(36)    NOT NULL DEFAULT (UUID()),
  `reporter_id`     CHAR(36)    NOT NULL,
  `target_type`     ENUM('PROPERTY','USER','BROKER','COMPANY') NOT NULL,
  `target_id`       CHAR(36)    NOT NULL,
  `reason`          ENUM(
                      'FAKE_LISTING','WRONG_PRICE','WRONG_LOCATION',
                      'ALREADY_SOLD','SPAM','INAPPROPRIATE','OTHER'
                    ) NOT NULL,
  `description`     TEXT        NULL,
  `status`          ENUM('PENDING','REVIEWED','RESOLVED','DISMISSED') NOT NULL DEFAULT 'PENDING',
  `reviewed_by`     CHAR(36)    NULL,
  `reviewed_at`     TIMESTAMP   NULL,
  `admin_notes`     TEXT        NULL,
  `created_at`      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reports_reporter` (`reporter_id`),
  INDEX `idx_reports_target` (`target_type`, `target_id`),
  INDEX `idx_reports_status` (`status`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BROKER RATINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `broker_ratings` (
  `id`          CHAR(36)    NOT NULL DEFAULT (UUID()),
  `broker_id`   CHAR(36)    NOT NULL,
  `customer_id` CHAR(36)    NOT NULL,
  `booking_id`  CHAR(36)    NULL,
  `rating`      TINYINT     NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `review`      TEXT        NULL,
  `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_broker_rating_customer` (`broker_id`, `customer_id`, `booking_id`),
  INDEX `idx_broker_ratings_broker` (`broker_id`),
  CONSTRAINT `fk_broker_ratings_broker` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`),
  CONSTRAINT `fk_broker_ratings_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTY VIEWS TABLE (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS `property_views` (
  `id`          CHAR(36)    NOT NULL DEFAULT (UUID()),
  `property_id` CHAR(36)    NOT NULL,
  `user_id`     CHAR(36)    NULL,
  `ip_address`  VARCHAR(45) NULL,
  `device_type` VARCHAR(50) NULL,
  `source`      VARCHAR(100) NULL,
  `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_property_views_property` (`property_id`),
  INDEX `idx_property_views_date` (`property_id`, `created_at`),
  CONSTRAINT `fk_property_views_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEARCH HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `search_history` (
  `id`          CHAR(36)  NOT NULL DEFAULT (UUID()),
  `user_id`     CHAR(36)  NOT NULL,
  `query`       TEXT      NOT NULL,
  `filters`     JSON      NULL,
  `results_count` INT     NULL,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_search_history_user` (`user_id`),
  CONSTRAINT `fk_search_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
