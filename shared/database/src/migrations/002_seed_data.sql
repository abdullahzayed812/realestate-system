-- ============================================================
-- Real Estate Platform - Seed Data
-- Borg El Arab, Egypt
-- ============================================================

USE realestate_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data so this script is idempotent
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `messages`;
TRUNCATE TABLE `chats`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `favorites`;
TRUNCATE TABLE `property_features`;
TRUNCATE TABLE `property_images`;
TRUNCATE TABLE `property_locations`;
TRUNCATE TABLE `properties`;
TRUNCATE TABLE `brokers`;
TRUNCATE TABLE `users`;

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO `users` (`id`, `phone`, `email`, `first_name`, `last_name`, `role`, `is_active`, `is_verified`, `phone_verified`, `preferred_lang`) VALUES
-- Admin
('usr-admin-001', '+201000000001', 'admin@borgalarab.com', 'أحمد', 'المدير', 'ADMIN', TRUE, TRUE, TRUE, 'ar'),
-- Brokers
('usr-broker-001', '+201000000002', 'broker1@borgalarab.com', 'محمد', 'السيد', 'BROKER', TRUE, TRUE, TRUE, 'ar'),
('usr-broker-002', '+201000000003', 'broker2@borgalarab.com', 'خالد', 'عبدالله', 'BROKER', TRUE, TRUE, TRUE, 'ar'),
-- Customers
('usr-cust-001', '+201000000010', 'customer1@example.com', 'سارة', 'أحمد', 'CUSTOMER', TRUE, TRUE, TRUE, 'ar'),
('usr-cust-002', '+201000000011', 'customer2@example.com', 'عمر', 'حسن', 'CUSTOMER', TRUE, TRUE, TRUE, 'ar'),
('usr-cust-003', '+201000000012', 'customer3@example.com', 'نور', 'إبراهيم', 'CUSTOMER', TRUE, FALSE, FALSE, 'ar');

-- ============================================================
-- BROKERS
-- ============================================================
INSERT INTO `brokers` (`id`, `user_id`, `license_number`, `bio`, `bio_ar`, `specializations`, `service_areas`, `rating`, `total_ratings`, `total_properties`, `total_deals`, `is_verified`, `is_featured`) VALUES
(
  'brk-001', 'usr-broker-001', 'LIC-2024-001',
  'Experienced real estate broker with 10 years in Borg El Arab market.',
  'وسيط عقاري متمرس مع 10 سنوات في سوق برج العرب. متخصص في الشقق السكنية والفيلات.',
  '["APARTMENT","VILLA","LAND"]',
  '["برج العرب","الإسكندرية الجديدة","العامرية"]',
  4.80, 95, 12, 14, TRUE, TRUE
),
(
  'brk-002', 'usr-broker-002', 'LIC-2024-002',
  'Specialist in commercial properties and land in the industrial zone.',
  'متخصص في العقارات التجارية والأراضي في المنطقة الصناعية ببرج العرب.',
  '["OFFICE","WAREHOUSE","FACTORY","LAND"]',
  '["برج العرب الصناعية","برج العرب"]',
  4.60, 42, 8, 9, TRUE, FALSE
);

-- ============================================================
-- PROPERTIES
-- ============================================================
INSERT INTO `properties` (`id`, `broker_id`, `title`, `title_ar`, `description`, `description_ar`, `type`, `listing_type`, `status`, `price`, `currency`, `price_per`, `area`, `bedrooms`, `bathrooms`, `floor`, `total_floors`, `parking_spaces`, `furnished`, `condition`, `year_built`, `is_featured`, `is_verified`, `views_count`, `favorites_count`) VALUES
(
  'prop-001', 'brk-001',
  'Luxury Apartment in Borg El Arab New City',
  'شقة فاخرة في برج العرب الجديدة',
  'Stunning 3-bedroom apartment with panoramic views, modern finishes, and a spacious balcony.',
  'شقة مميزة بثلاث غرف نوم مع إطلالات بانورامية وتشطيبات عصرية وشرفة واسعة. تقع في منطقة هادئة قريبة من جميع الخدمات.',
  'APARTMENT', 'SALE', 'ACTIVE', 850000.00, 'EGP', 'TOTAL',
  175.00, 3, 2, 4, 10, 1, 'SEMI_FURNISHED', 'EXCELLENT', 2023,
  TRUE, TRUE, 4230, 87
),
(
  'prop-002', 'brk-001',
  'Modern Villa for Sale',
  'فيلا عصرية للبيع',
  'Elegant 5-bedroom villa with private garden, swimming pool, and 3-car garage in a gated compound.',
  'فيلا أنيقة بخمس غرف نوم مع حديقة خاصة وحمام سباحة وجراج لثلاث سيارات في مجمع مسور. تصميم معماري فريد.',
  'VILLA', 'SALE', 'ACTIVE', 4500000.00, 'EGP', 'TOTAL',
  520.00, 5, 4, 0, 2, 3, 'FURNISHED', 'NEW', 2024,
  TRUE, TRUE, 8720, 215
),
(
  'prop-003', 'brk-001',
  'Furnished Apartment for Rent',
  'شقة مفروشة للإيجار',
  'Cozy fully furnished 2-bedroom apartment, ideal for families or professionals. Close to schools and malls.',
  'شقة مفروشة بالكامل بغرفتين نوم، مثالية للعائلات أو المحترفين. قريبة من المدارس والمراكز التجارية.',
  'APARTMENT', 'RENT', 'ACTIVE', 4500.00, 'EGP', 'MONTH',
  110.00, 2, 1, 2, 6, 1, 'FURNISHED', 'EXCELLENT', 2021,
  FALSE, TRUE, 1850, 34
),
(
  'prop-004', 'brk-002',
  'Commercial Land in Industrial Zone',
  'أرض تجارية في المنطقة الصناعية',
  'Prime commercial land plot in Borg El Arab Industrial Zone. Ideal for factory or warehouse.',
  'أرض تجارية متميزة في المنطقة الصناعية ببرج العرب. مناسبة لإنشاء مصنع أو مخزن. واجهة على الطريق الرئيسي.',
  'LAND', 'SALE', 'ACTIVE', 1200000.00, 'EGP', 'TOTAL',
  2000.00, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL,
  FALSE, TRUE, 2100, 28
),
(
  'prop-005', 'brk-002',
  'Warehouse for Rent in Industrial Area',
  'مخزن للإيجار في المنطقة الصناعية',
  'Large warehouse with 500 sqm floor area, high ceiling, truck loading dock, and 3-phase power.',
  'مخزن كبير بمساحة 500 متر مربع، سقف مرتفع، رامب تحميل للشاحنات، وكهرباء ثلاث أطوار. موقع استراتيجي.',
  'WAREHOUSE', 'RENT', 'ACTIVE', 8000.00, 'EGP', 'MONTH',
  500.00, NULL, 1, NULL, NULL, 2, NULL, 'GOOD', 2018,
  FALSE, TRUE, 980, 12
),
(
  'prop-006', 'brk-001',
  'Studio Apartment - Daily Rent',
  'استوديو - إيجار يومي',
  'Fully equipped studio apartment perfect for short stays. Near beach and all amenities.',
  'استوديو مجهز بالكامل مثالي للإقامة القصيرة. قريب من الشاطئ وجميع وسائل الراحة.',
  'STUDIO', 'DAILY_RENT', 'ACTIVE', 350.00, 'EGP', 'NIGHT',
  55.00, 0, 1, 1, 5, 0, 'FURNISHED', 'EXCELLENT', 2022,
  FALSE, TRUE, 670, 19
),
(
  'prop-007', 'brk-002',
  'Office Space for Rent',
  'مكتب للإيجار',
  'Modern open-plan office space in a premium business building. Includes reception, meeting room, and parking.',
  'مساحة مكتبية حديثة في مبنى أعمال راقٍ. تشمل استقبال وغرفة اجتماعات ومواقف سيارات.',
  'OFFICE', 'RENT', 'PENDING', 6000.00, 'EGP', 'MONTH',
  120.00, NULL, 1, 3, 8, 2, 'FURNISHED', 'NEW', 2024,
  FALSE, FALSE, 0, 0
);

-- ============================================================
-- PROPERTY LOCATIONS
-- ============================================================
INSERT INTO `property_locations` (`id`, `property_id`, `latitude`, `longitude`, `address`, `address_ar`, `city`, `district`, `neighborhood`) VALUES
('loc-001', 'prop-001', 30.87654321, 29.65432100, 'Block 5, New Borg El Arab City, Alexandria', 'المجموعة الخامسة، برج العرب الجديدة، الإسكندرية', 'Borg El Arab', 'New City', 'المجموعة الخامسة'),
('loc-002', 'prop-002', 30.88123456, 29.66789012, 'Elite Compound, Borg El Arab', 'كمبوند إيليت، برج العرب', 'Borg El Arab', 'Elite Compound', 'كمبوند إيليت'),
('loc-003', 'prop-003', 30.87234567, 29.64321098, '12 El Nasr Street, Borg El Arab', '12 شارع النصر، برج العرب', 'Borg El Arab', 'El Nasr', 'شارع النصر'),
('loc-004', 'prop-004', 30.89012345, 29.68901234, 'Industrial Zone, Plot 47, Borg El Arab', 'المنطقة الصناعية، قطعة 47، برج العرب', 'Borg El Arab', 'Industrial Zone', 'المنطقة الصناعية'),
('loc-005', 'prop-005', 30.89234567, 29.68543210, 'Warehouse District, Block C, Borg El Arab', 'حي المخازن، كتلة ج، برج العرب', 'Borg El Arab', 'Industrial Zone', 'حي المخازن'),
('loc-006', 'prop-006', 30.86543210, 29.63210987, 'Seafront Tower, Apartment 101, Borg El Arab', 'برج الواجهة البحرية، شقة 101، برج العرب', 'Borg El Arab', 'Seafront', 'الواجهة البحرية'),
('loc-007', 'prop-007', 30.87890123, 29.65012345, 'Business Center Tower, 3rd Floor, Borg El Arab', 'مركز الأعمال، الطابق الثالث، برج العرب', 'Borg El Arab', 'Business District', 'مركز الأعمال');

-- ============================================================
-- PROPERTY IMAGES (using placeholder image URLs)
-- ============================================================
INSERT INTO `property_images` (`id`, `property_id`, `url`, `thumbnail_url`, `alt_text`, `sort_order`, `is_primary`) VALUES
('img-001', 'prop-001', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', 'شقة فاخرة - المنظر الرئيسي', 0, TRUE),
('img-002', 'prop-001', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', 'غرفة المعيشة', 1, FALSE),
('img-003', 'prop-001', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'المطبخ', 2, FALSE),
('img-004', 'prop-002', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', 'فيلا - الواجهة الخارجية', 0, TRUE),
('img-005', 'prop-002', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400', 'حمام السباحة', 1, FALSE),
('img-006', 'prop-002', 'https://images.unsplash.com/photo-1560185127-6a7e7b8b8b84?w=800', 'https://images.unsplash.com/photo-1560185127-6a7e7b8b8b84?w=400', 'الحديقة', 2, FALSE),
('img-007', 'prop-003', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', 'شقة مفروشة', 0, TRUE),
('img-008', 'prop-004', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', 'أرض تجارية', 0, TRUE),
('img-009', 'prop-005', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', 'مخزن صناعي', 0, TRUE),
('img-010', 'prop-006', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400', 'استوديو مفروش', 0, TRUE),
('img-011', 'prop-007', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', 'مكتب احترافي', 0, TRUE);

-- ============================================================
-- PROPERTY FEATURES
-- ============================================================
INSERT INTO `property_features` (`id`, `property_id`, `feature`, `feature_ar`, `category`) VALUES
-- prop-001 features
('feat-001', 'prop-001', 'Central AC', 'تكييف مركزي', 'INDOOR'),
('feat-002', 'prop-001', 'Elevator', 'مصعد', 'INDOOR'),
('feat-003', 'prop-001', 'Balcony', 'شرفة', 'OUTDOOR'),
('feat-004', 'prop-001', 'Security System', 'نظام أمان', 'SECURITY'),
('feat-005', 'prop-001', 'Near Schools', 'قريب من المدارس', 'NEARBY'),
('feat-006', 'prop-001', 'Near Shopping Mall', 'قريب من المول التجاري', 'NEARBY'),
-- prop-002 features
('feat-007', 'prop-002', 'Swimming Pool', 'حمام سباحة', 'OUTDOOR'),
('feat-008', 'prop-002', 'Private Garden', 'حديقة خاصة', 'OUTDOOR'),
('feat-009', 'prop-002', 'Smart Home System', 'نظام المنزل الذكي', 'INDOOR'),
('feat-010', 'prop-002', 'CCTV', 'كاميرات مراقبة', 'SECURITY'),
('feat-011', 'prop-002', 'Generator Backup', 'مولد احتياطي', 'UTILITIES'),
('feat-012', 'prop-002', 'Gated Compound', 'كمبوند مسور', 'SECURITY'),
-- prop-003 features
('feat-013', 'prop-003', 'Fully Furnished', 'مفروشة بالكامل', 'INDOOR'),
('feat-014', 'prop-003', 'WiFi', 'إنترنت واي فاي', 'UTILITIES'),
('feat-015', 'prop-003', 'Washing Machine', 'غسالة ملابس', 'INDOOR'),
-- prop-005 features
('feat-016', 'prop-005', '3-Phase Power', 'كهرباء ثلاث أطوار', 'UTILITIES'),
('feat-017', 'prop-005', 'Truck Loading Dock', 'رامب تحميل شاحنات', 'OUTDOOR'),
('feat-018', 'prop-005', 'High Ceiling', 'سقف مرتفع', 'INDOOR');

-- ============================================================
-- FAVORITES
-- ============================================================
INSERT INTO `favorites` (`id`, `user_id`, `property_id`) VALUES
('fav-001', 'usr-cust-001', 'prop-001'),
('fav-002', 'usr-cust-001', 'prop-002'),
('fav-003', 'usr-cust-002', 'prop-002'),
('fav-004', 'usr-cust-002', 'prop-004');

-- ============================================================
-- BOOKINGS
-- ============================================================
INSERT INTO `bookings` (`id`, `property_id`, `customer_id`, `broker_id`, `type`, `status`, `scheduled_at`, `notes`, `check_in`, `check_out`, `total_price`) VALUES
(
  'book-001', 'prop-001', 'usr-cust-001', 'brk-001',
  'VISIT', 'CONFIRMED',
  '2026-05-20 10:00:00',
  'أود معاينة الشقة في الموعد المحدد من فضلك',
  NULL, NULL, NULL
),
(
  'book-002', 'prop-003', 'usr-cust-002', 'brk-001',
  'RENT', 'PENDING',
  '2026-05-18 14:00:00',
  'مهتم بالإيجار لمدة 6 أشهر',
  '2026-06-01', '2026-11-30', 27000.00
),
(
  'book-003', 'prop-006', 'usr-cust-003', 'brk-001',
  'RENT', 'COMPLETED',
  '2026-04-10 11:00:00',
  'حجز لأسبوع',
  '2026-04-15', '2026-04-22', 2450.00
),
(
  'book-004', 'prop-002', 'usr-cust-001', 'brk-001',
  'PURCHASE', 'PENDING',
  '2026-05-25 15:00:00',
  'مهتم بشراء الفيلا، أرجو المعاينة',
  NULL, NULL, NULL
);

-- ============================================================
-- CHATS
-- ============================================================
INSERT INTO `chats` (`id`, `customer_id`, `broker_id`, `property_id`, `customer_unread`, `broker_unread`) VALUES
('chat-001', 'usr-cust-001', 'usr-broker-001', 'prop-001', 0, 1),
('chat-002', 'usr-cust-002', 'usr-broker-001', 'prop-003', 0, 2);

-- ============================================================
-- MESSAGES
-- ============================================================
INSERT INTO `messages` (`id`, `chat_id`, `sender_id`, `content`, `type`, `is_read`, `created_at`) VALUES
('msg-001', 'chat-001', 'usr-cust-001', 'مرحباً، أود الاستفسار عن الشقة', 'TEXT', TRUE, '2026-05-13 10:00:00'),
('msg-002', 'chat-001', 'usr-broker-001', 'أهلاً، الشقة متاحة للمعاينة. متى تريد الزيارة؟', 'TEXT', TRUE, '2026-05-13 10:15:00'),
('msg-003', 'chat-001', 'usr-cust-001', 'يمكنني يوم الثلاثاء في الصباح', 'TEXT', TRUE, '2026-05-13 10:20:00'),
('msg-004', 'chat-001', 'usr-broker-001', 'ممتاز، موعدك الثلاثاء الساعة 10 صباحاً', 'TEXT', TRUE, '2026-05-13 10:25:00'),
('msg-005', 'chat-001', 'usr-cust-001', 'شكراً، سأكون في الموعد المحدد', 'TEXT', FALSE, '2026-05-13 14:30:00'),
('msg-006', 'chat-002', 'usr-cust-002', 'السلام عليكم، أريد الاستعلام عن الشقة المفروشة', 'TEXT', TRUE, '2026-05-12 18:00:00'),
('msg-007', 'chat-002', 'usr-broker-001', 'وعليكم السلام، الشقة ممتازة ومتاحة الآن', 'TEXT', TRUE, '2026-05-12 18:10:00'),
('msg-008', 'chat-002', 'usr-cust-002', 'هل يمكن تخفيض الإيجار قليلاً؟', 'TEXT', FALSE, '2026-05-12 18:45:00');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `title_ar`, `body`, `body_ar`, `data`, `is_read`) VALUES
('notif-001', 'usr-cust-001', 'BOOKING_CONFIRMED', 'Booking Confirmed', 'تم تأكيد الحجز', 'Your viewing for the luxury apartment has been confirmed.', 'تم تأكيد موعد معاينة الشقة الفاخرة.', '{"bookingId":"book-001","propertyId":"prop-001"}', TRUE),
('notif-002', 'usr-cust-002', 'NEW_MESSAGE', 'New Message', 'رسالة جديدة', 'You have a new message from the broker.', 'لديك رسالة جديدة من الوسيط.', '{"chatId":"chat-002"}', FALSE),
('notif-003', 'usr-broker-001', 'NEW_BOOKING', 'New Booking Request', 'طلب حجز جديد', 'You have a new viewing request for your villa.', 'لديك طلب معاينة جديد للفيلا.', '{"bookingId":"book-004","propertyId":"prop-002"}', FALSE),
('notif-004', 'usr-cust-001', 'PROPERTY_APPROVED', 'Property Available', 'عقار متاح', 'The villa you saved is now available for purchase.', 'الفيلا التي حفظتها متاحة الآن للشراء.', '{"propertyId":"prop-002"}', FALSE);

SET FOREIGN_KEY_CHECKS = 1;
