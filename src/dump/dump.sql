
-- Insert Product Types
INSERT INTO product_type (id, name, createdAt) VALUES
(1, 'Thực phẩm tươi sống', NOW()),
(2, 'Thực phẩm khô', NOW()),
(3, 'Đồ uống', NOW()),
(4, 'Đồ gia dụng', NOW()),
(5, 'Vệ sinh cá nhân', NOW());

-- Insert Product Lines
INSERT INTO product_line (id, name, productTypeId, createdAt) VALUES
(1, 'Thịt tươi', 1, NOW()),
(2, 'Rau củ', 1, NOW()),
(3, 'Mì gói', 2, NOW()),
(4, 'Nước giải khát', 3, NOW()),
(5, 'Sữa', 3, NOW()),
(6, 'Đồ dùng nhà bếp', 4, NOW()),
(7, 'Chăm sóc cá nhân', 5, NOW());

-- Thêm Product Samples (Tổng 20 sản phẩm)
INSERT INTO product_sample (id, name, description, productLineId, createdAt) VALUES
-- Thịt tươi (product_line_id: 1)
(1, 'Thịt heo ba rọi', 'Thịt heo tươi ngon từ trang trại', 1, NOW()),
(2, 'Thịt bò Úc', 'Thịt bò nhập khẩu từ Úc', 1, NOW()),
(3, 'Đùi gà', 'Đùi gà tươi CP', 1, NOW()),
(4, 'Cánh gà', 'Cánh gà tươi CP', 1, NOW()),

-- Rau củ (product_line_id: 2)
(5, 'Rau muống', 'Rau muống tươi hữu cơ', 2, NOW()),
(6, 'Cải thảo', 'Cải thảo tươi sạch', 2, NOW()),
(7, 'Cà rốt', 'Cà rốt Đà Lạt', 2, NOW()),
(8, 'Khoai tây', 'Khoai tây Đà Lạt', 2, NOW()),

-- Mì gói (product_line_id: 3)
(9, 'Mì Hảo Hảo', 'Mì gói chua cay', 3, NOW()),
(10, 'Mì Omachi', 'Mì xào trộn', 3, NOW()),
(11, 'Mì 3 Miền', 'Mì tôm chua cay', 3, NOW()),
(12, 'Mì Kokomi', 'Mì gói hương gà', 3, NOW()),

-- Nước giải khát (product_line_id: 4)
(13, 'Coca Cola', 'Nước giải khát có gas', 4, NOW()),
(14, 'Pepsi', 'Nước giải khát có gas', 4, NOW()),
(15, 'Sting', 'Nước tăng lực', 4, NOW()),
(16, 'Trà xanh 0 độ', 'Trà xanh đóng chai', 4, NOW()),

-- Sữa (product_line_id: 5)
(17, 'Sữa tươi Vinamilk', 'Sữa tươi tiệt trùng không đường', 5, NOW()),
(18, 'Sữa TH True Milk', 'Sữa tươi tiệt trùng có đường', 5, NOW()),
(19, 'Sữa đặc Ông Thọ', 'Sữa đặc có đường', 5, NOW()),
(20, 'Sữa chua Vinamilk', 'Sữa chua có đường', 5, NOW());

-- Insert Units
INSERT INTO unit (id, name, createdAt) VALUES
(1, 'kg', NOW()),
(2, 'bó', NOW()),
(3, 'gói', NOW()),
(4, 'chai', NOW()),
(5, 'hộp', NOW()),
(6, 'thùng', NOW()),
(7, 'miếng', NOW()),
(8, 'lốc', NOW()),
(9, 'gram', NOW()),
(10, 'túi', NOW()),
(11, 'lon', NOW());


-- Thêm Product Units (Tổng 20 đơn vị sản phẩm)
INSERT INTO product_unit (id, sellPrice, conversionRate, compareUnitId, image, volumne, productSampleId, unitId, createdAt) VALUES
-- Thịt và Gia cầm
(1, 120000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS_idOuuaioteV4Hzmsvwus57R7SlL1A26jg&s', '1 kg', 1, 1, NOW()),
(2, 350000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNVM2hRGNPr9C9sQP2aaH6LlWQXHCNqCp3vw&s', '1 kg', 2, 1, NOW()),
(3, 65000, null, null,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSssGbOdvVm9YSE2T8PJPnjGNQQYcZCBVWJhg&s', '1 kg', 3, 1, NOW()),
(4, 60000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1Ts6kDgWocoZNlSbfinxeP47AlELJWcjXXA&s', '1 kg', 4, 1, NOW()),

-- Rau củ
(5, 8000, null, null, 'https://images2.thanhnien.vn/zoom/686_429/528068263637045248/2023/9/13/rau-muong-16945744756401379166751-75-0-476-642-crop-16945745476001397609558.png', '1 kg', 5, 2, NOW()),
(6, 12000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeP85FwnzLmG3zAxRo3PvArn90xh7H3uNWvg&s', '1 kg', 6, 1, NOW()),
(7, 15000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuAp57MbrrAh6O6DQ89USyHFOIq0f2eHZKSQ&s', '1 kg', 7, 1, NOW()),
(8, 18000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMiVD5BCbRjnu4tsOvs9WV7j4Za_ISLpnAYw&s', '1 kg', 8, 1, NOW()),

-- Mì gói
(9, 4000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ3YZSwJEl3EFCb5haHxhPyzOvnMU5kpGG6A&s', '65 gram', 9, 3, NOW()),
(10, 7000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQADicx1UWOZePim-anIkCy3Mj7A2v-tvJNQ&s', '65 gram', 10, 3, NOW()),
(11, 3500, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9I5cdBIRo6XpzS-nEzOoEj2TJlSrUk0qEGw&s', '65 gram', 11, 3, NOW()),
(12, 3500, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqFIK6cJcHwnzUHtTqvrXws3xaDrL2Fw85Cg&s', '65 gram', 12, 3, NOW()),

-- Nước giải khát
(13, 10000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUlFvGKCHhTwr6fiK0O1ZwVyuffp8zRcXlcQ&s', '330ml', 13, 4, NOW()),
(14, 10000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGFF9wTI-2Lf_kMUkCPjK1LwqC_YQWy-_FVA&s', '330ml', 14, 4, NOW()),
(15, 12000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9jDajnaubt1eQGpm3FkCHHSe6NkP-pu5OZw&s', '330ml', 15, 4, NOW()),
(16, 10000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR32Rpyq52E5rHkTM8LExvIZeFmO6oP-sj3Cg&s', '330ml', 16, 4, NOW()),

-- Sữa
(17, 35000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-2L581_Fmf-h87orbYar6cg0Wmss93tJ3Mg&s', '1L', 17, 5, NOW()),
(18, 38000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG_mCa8SZ0ilroESF12s1rxV6t8C4bOOGkCg&s', '1L', 18, 5, NOW()),
(19, 25000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLJsXsGamM-MVngdc3qPPxD7RNDQy1hQSGdw&s', '380g', 19, 5, NOW()),
(20, 6000, null, null, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR23a2l1LxuL6jyYBx1RzUNklNzkvByMi4lFg&s', '100g', 20, 5, NOW());


-- Insert Groups
INSERT INTO `group` (id, name, description) VALUES
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'Nhân viên', 'Nhân viên bán hàng'),
(3, 'Khách hàng', 'Khách hàng');

-- Insert Roles
INSERT INTO role (id, url, description) VALUES
(1, 'create_batch', 'Tạo mới lô hàng'),
(2, 'view_batchs', 'Xem danh sách lô hàng'),
(3, 'view_batch', 'Xem chi tiết lô hàng'),
(4, 'update_batch', 'Cập nhật lô hàng'),
(5, 'delete_batch', 'Xóa lô hàng'),

(6, 'create_group', 'Tạo mới nhóm người dùng'),
(7, 'view_groups', 'Xem danh sách nhóm người dùng'),
(8, 'view_group', 'Xem chi tiết nhóm người dùng'),
(9, 'update_group', 'Cập nhật nhóm người dùng'),
(10, 'delete_group', 'Xóa nhóm người dùng'),
(11, 'assign-roles', 'Phân quyền nhóm người dùng'),

(12, 'create_inbound-receipt', 'Tạo mới đơn nhập hàng'),
(13, 'view_inbound-receipts', 'Xem danh sách đơn nhập hàng'),
(14, 'view_inbound-receipt', 'Xem chi tiết đơn nhập hàng'),
(15, 'update_inbound-receipt', 'Cập nhật đơn nhập hàng'),
(16, 'delete_inbound-receipt', 'Xóa đơn nhập hàng'),

(17, 'create_order', 'Tạo mới hóa đơn'),
(18, 'view_orders', 'Xem danh sách hóa đơn'),
(19, 'view_order', 'Xem chi tiết hóa đơn'),
(20, 'update_order', 'Cập nhật hóa đơn'),
(21, 'delete_order', 'Xóa hóa đơn'),

(22, 'view_parameters', 'Xem danh sách tham số'),
(23, 'view_parameter', 'Xem chi tiết tham số'),
(24, 'update_parameter', 'Cập nhật tham số'),

(25, 'create_product-line', 'Tạo mới dòng sản phẩm'),
(26, 'view_product-lines', 'Xem danh sách dòng sản phẩm'),
(27, 'view_product-line', 'Xem chi tiết dòng sản phẩm'),
(28, 'update_product-line', 'Cập nhật dòng sản phẩm'),
(29, 'delete_product-line', 'Xóa dòng sản phẩm'),

(30, 'create_product-sample', 'Tạo mới mẫu sản phẩm'),
(31, 'view_product-samples', 'Xem danh sách mẫu sản phẩm'),
(32, 'view_product-sample', 'Xem chi tiết mẫu sản phẩm'),
(33, 'update_product-sample', 'Cập nhật mẫu sản phẩm'),
(34, 'delete_product-sample', 'Xóa mẫu sản phẩm'),

(35, 'create_product-type', 'Tạo mới loại sản phẩm'),
(36, 'view_product-types', 'Xem danh sách loại sản phẩm'),
(37, 'view_product-type', 'Xem chi tiết loại sản phẩm'),
(38, 'update_product-type', 'Cập nhật loại sản phẩm'),
(39, 'delete_product-type', 'Xóa loại sản phẩm'),

(40, 'create_product-unit', 'Tạo mới đơn vị sản phẩm'),
(41, 'view_product-units', 'Xem danh sách đơn vị sản phẩm'),
(42, 'view_product-unit', 'Xem chi tiết đơn vị sản phẩm'),
(43, 'update_product-unit', 'Cập nhật đơn vị sản phẩm'),
(44, 'delete_product-unit', 'Xóa đơn vị sản phẩm'),

(45, 'view_roles', 'Xem danh sách các vai trò'),

(46, 'view_supplier-products', 'Xem danh sách các sản phẩm của một nhà cung cấp'),

(47, 'create_supplier', 'Tạo mới nhà cung cấp'),
(48, 'view_suppliers', 'Xem danh sách nhà cung cấp'),
(49, 'view_supplier', 'Xem chi tiết nhà cung cấp'),
(50, 'update_supplier', 'Cập nhật nhà cung cấp'),
(51, 'delete_supplier', 'Xóa nhà cung cấp'),

(52, 'create_unit', 'Tạo mới đơn vị tính'),
(53, 'view_units', 'Xem danh sách đơn vị tính'),
(54, 'view_unit', 'Xem chi tiết đơn vị tính'),
(55, 'update_unit', 'Cập nhật đơn vị tính'),
(56, 'delete_unit', 'Xóa đơn vị tính'),

(57, 'create_customer', 'Tạo mới khách hàng'),
(58, 'view_customers', 'Xem danh sách khách hàng'),
(59, 'view_customer', 'Xem chi tiết khách hàng'),
(60, 'update_customer', 'Cập nhật khách hàng'),
(61, 'delete_customer', 'Xóa khách hàng'),

(62, 'create_staff', 'Tạo mới nhân viên'),
(63, 'view_staffs', 'Xem danh sách nhân viên'),
(64, 'view_staff', 'Xem chi tiết nhân viên'),
(65, 'update_staff', 'Cập nhật nhân viên'),
(66, 'delete_staff', 'Xóa nhân viên');

-- Insert role_group
INSERT INTO role_group (groupId, roleId) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 33),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 39),
(1, 40),
(1, 41),
(1, 42),
(1, 43),
(1, 44),
(1, 45),
(1, 46),
(1, 47),
(1, 48),
(1, 49),
(1, 50),
(1, 51),
(1, 52),
(1, 53),
(1, 54),
(1, 55),
(1, 56),
(1, 57),
(1, 58),
(1, 59),
(1, 60),
(1, 61),
(1, 62),
(1, 63),
(1, 64),
(1, 65),
(1, 66),

(2, 53),
(2, 59),
(2, 60),
(2, 64);

-- Insert Users
INSERT INTO `user` (id, name, email, password, score, address, phone, groupId, createdAt) VALUES
(1, 'Đoàn Danh Dự', 'dudd@mini.mart', '$2b$10$ImF9chTfy2rgUDiW3t/V5eOYFtNo0JQzuxk/H/m2Jw3pJJTi/i3RC', 0, 'Ấp Thị 1, xã Hội An, Chợ Mới, An Giang', '0901234567', 1, NOW()),
(2, 'Trần Thị Nhân Viên', 'vienttn@mini.mart', '$2b$10$ImF9chTfy2rgUDiW3t/V5eOYFtNo0JQzuxk/H/m2Jw3pJJTi/i3RC', 0, 'Đường Bùi Thị Xuân, Quận 1, TP. Hồ Chí Minh', '0901234568', 2, NOW()),
(3, 'Lê Văn Khách', 'khachlv@gmail.com', '$2b$10$ImF9chTfy2rgUDiW3t/V5eOYFtNo0JQzuxk/H/m2Jw3pJJTi/i3RC', 100, 'Hoàn Kiếm, Hà Nội', '0901234569', 3, NOW());

-- Insert Suppliers
INSERT INTO supplier (id, name, phone, address, country, createdAt) VALUES
(1, 'Công ty TNHH Thực phẩm Sạch', '0987654321', 'Số 123 Đường ABC, Hà Nội', 'Việt Nam', NOW()),
(2, 'Công ty CP Phân phối Hàng tiêu dùng', '0987654322', 'Số 456 Đường XYZ, Hồ Chí Minh', 'Việt Nam', NOW());

-- Insert Supplier Products
INSERT INTO supplier_product (id, supplierId, productUnitId, status) VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 2, 3, 1),
(4, 2, 4, 1),
(5, 2, 5, 1);

INSERT INTO inbound_receipt (id, totalPrice, isReceived, isPaid, staffId, supplierId, createdAt) VALUES
    (1, 16825000, 1, 1, 2, 1, '2021-11-15 14:20:00'),
    (2, 9000000, 1, 1, 2, 2, '2021-12-18 10:30:00'),
    (3, 4275000, 1, 1, 2, 1, '2022-01-12 16:40:00'),
    (4, 2450000, 1, 1, 2, 1, '2022-02-05 09:25:00'),
    (5, 21000000, 1, 1, 2, 1, '2022-03-20 13:50:00'),
    (6, 12500000, 1, 1, 2, 2, '2022-05-10 11:10:00'),
    (7, 17500000, 1, 1, 2, 1, '2022-06-25 14:30:00'),
    (8, 14000000, 1, 1, 2, 2, '2022-07-15 08:15:00'),
    (9, 20000000, 1, 1, 2, 1, '2022-09-10 10:25:00'),
    (10, 15000000, 1, 1, 2, 2, '2022-11-05 17:10:00'),
    (11, 8750000, 1, 1, 2, 1, '2022-12-05 10:30:00'),
    (12, 7500000, 1, 1, 2, 2, '2023-01-01 14:20:00'),
    (13, 10500000, 1, 1, 2, 1, '2023-02-10 09:50:00'),
    (14, 12250000, 1, 1, 2, 2, '2023-03-15 15:40:00'),
    (15, 6250000, 1, 1, 3, 1, '2023-04-10 11:30:00'),
    (16, 11000000, 1, 1, 2, 2, '2023-05-15 15:40:00'),
    (17, 15750000, 1, 1, 4, 1, '2023-06-05 09:25:00'),
    (18, 9250000, 1, 1, 3, 2, '2023-07-20 13:10:00'),
    (19, 4750000, 1, 1, 2, 1, '2023-09-25 14:00:00'),
    (20, 7250000, 1, 1, 4, 2, '2023-10-15 10:45:00'),
    (21, 8750000, 1, 1, 3, 1, '2023-11-10 11:50:00'),
    (22, 10000000, 1, 1, 4, 2, '2023-12-05 14:30:00'),
    (23, 12500000, 1, 1, 3, 1, '2024-01-01 16:10:00'),
    (24, 16000000, 1, 1, 2, 2, '2024-01-15 09:20:00'),
    (25, 10000000, 1, 1, 3, 1, '2024-02-10 10:30:00'),
    (26, 8750000, 1, 1, 2, 2, '2024-03-15 14:00:00'),
    (27, 11250000, 1, 1, 4, 1, '2024-04-12 11:45:00'),
    (28, 7500000, 1, 1, 3, 2, '2024-05-18 09:20:00'),
    (29, 16000000, 1, 1, 2, 1, '2024-06-25 16:30:00'),
    (30, 14000000, 1, 1, 4, 2, '2024-07-10 13:15:00'),
    (31, 11000000, 1, 1, 3, 1, '2024-08-05 15:45:00'),
    (32, 12500000, 1, 1, 2, 2, '2024-09-15 10:10:00'),
    (33, 10000000, 1, 1, 3, 1, '2024-10-20 14:50:00'),
    (34, 9000000, 1, 1, 4, 2, '2024-11-10 09:30:00');


-- Cập nhật Batches
INSERT INTO batch (id, inboundPrice, discount, inventQuantity, inboundQuantity, expiredAt, inboundReceiptId, productUnitId, createdAt) VALUES
-- Receipt 1
(1, 168250, 0, 100, 100, '2024-12-31', 1, 1, '2021-11-15 14:20:00'), -- Thịt heo ba rọi

-- Receipt 2
(2, 180000, 0, 50, 50, '2024-12-31', 2, 2, '2021-12-18 10:30:00'), -- Thịt bò Úc

-- Receipt 3
(3, 42750, 0, 100, 100, '2024-12-31', 3, 3, '2022-01-12 16:40:00'), -- Đùi gà

-- Receipt 4
(4, 24500, 0, 100, 100, '2024-12-31', 4, 7, '2022-02-05 09:25:00'), -- Cà rốt

-- Receipt 5
(5, 105000, 0, 200, 200, '2024-12-31', 5, 17, '2022-03-20 13:50:00'), -- Sữa tươi Vinamilk
(6, 105000, 0, 100, 100, '2024-12-31', 5, 18, '2022-03-20 13:50:00'), -- Sữa TH True Milk

-- Receipt 6
(7, 41666, 0, 300, 300, '2024-12-31', 6, 20, '2022-05-10 11:10:00'), -- Sữa chua Vinamilk

-- Receipt 7
(8, 58333, 0, 300, 300, '2024-12-31', 7, 13, '2022-06-25 14:30:00'), -- Coca Cola

-- Receipt 8
(9, 35000, 0, 400, 400, '2024-12-31', 8, 11, '2022-07-15 08:15:00'), -- Mì 3 Miền

-- Receipt 9
(10, 66666, 0, 300, 300, '2024-12-31', 9, 14, '2022-09-10 10:25:00'), -- Pepsi

-- Receipt 10
(11, 50000, 0, 500, 500, '2024-12-31', 10, 10, '2022-11-05 17:10:00'), -- Mì Omachi

-- Receipt 11
(12, 17500, 0, 500, 500, '2025-12-01', 11, 15, '2022-12-05 10:30:00'), -- Sting

-- Receipt 12
(13, 18750, 0, 400, 400, '2025-01-15', 12, 16, '2023-01-01 14:20:00'), -- Trà xanh

-- Receipt 13
(14, 52500, 0, 200, 200, '2025-05-15', 13, 6, '2023-02-10 09:50:00'), -- Cải thảo

-- Receipt 14
(15, 12250, 0, 1000, 1000, '2026-01-15', 14, 19, '2023-03-15 15:40:00'), -- Sữa đặc Ông Thọ

-- Receipt 15
(16, 62500, 0, 100, 100, '2025-01-01', 15, 1, '2023-04-10 11:30:00'), -- Thịt heo

-- Receipt 16
(17, 55000, 0, 200, 200, '2025-02-01', 16, 17, '2023-05-15 15:40:00'), -- Sữa tươi Vinamilk

-- Receipt 17
(18, 52500, 0, 300, 300, '2025-03-01', 17, 13, '2023-06-05 09:25:00'), -- Coca Cola

-- Receipt 18
(19, 46250, 0, 200, 200, '2025-04-01', 18, 10, '2023-07-20 13:10:00'), -- Mì Omachi

-- Receipt 19
(20, 240000, 0, 50, 50, '2025-05-01', 19, 2, '2023-09-25 14:00:00'), -- Thịt bò Úc

-- Receipt 20
(21, 11250, 0, 400, 400, '2025-06-01', 20, 11, '2023-10-15 10:45:00'), -- Mì 3 Miền
-- Receipt 20
(22, 24167, 0, 300, 300, '2025-06-15', 20, 7, '2023-10-15 10:45:00'), -- Cà rốt

-- Receipt 21
(23, 35000, 0, 250, 250, '2025-07-01', 21, 20, '2023-11-10 11:50:00'), -- Sữa chua Vinamilk
(24, 32500, 0, 200, 200, '2025-07-10', 21, 6, '2023-11-10 11:50:00'), -- Cải thảo

-- Receipt 22
(25, 18750, 0, 400, 400, '2025-08-01', 22, 14, '2023-12-05 14:30:00'), -- Pepsi
(26, 16000, 0, 300, 300, '2025-08-15', 22, 16, '2023-12-05 14:30:00'), -- Trà xanh

-- Receipt 23
(27, 10000, 0, 500, 500, '2025-09-01', 23, 19, '2024-01-01 16:10:00'), -- Sữa đặc Ông Thọ
(28, 6667, 0, 600, 600, '2025-09-20', 23, 18, '2024-01-01 16:10:00'), -- Sữa TH True Milk

-- Receipt 24
(29, 7500, 0, 400, 400, '2025-10-01', 24, 4, '2024-01-15 09:20:00'), -- Coca Cola
(30, 3571, 0, 700, 700, '2025-10-15', 24, 8, '2024-01-15 09:20:00'), -- Mì Omachi

-- Receipt 25
(31, 100000, 0, 100, 100, '2025-12-31', 25, 1, '2024-02-10 10:30:00'), -- Thịt ba rọi

-- Receipt 26
(32, 40000, 0, 200, 200, '2025-12-31', 26, 5, '2024-03-15 14:00:00'), -- Rau muống

-- Receipt 27
(33, 300000, 0, 50, 50, '2025-12-31', 27, 3, '2024-04-12 11:45:00'), -- Đùi gà

-- Receipt 28
(34, 50000, 0, 150, 150, '2025-12-31', 28, 7, '2024-05-18 09:20:00'), -- Cà rốt

-- Receipt 29
(35, 80000, 0, 200, 200, '2025-12-31', 29, 2, '2024-06-25 16:30:00'), -- Thịt bò Úc

-- Receipt 30
(36, 90000, 0, 80, 80, '2025-12-31', 30, 4, '2024-07-10 13:15:00'), -- Coca Cola

-- Receipt 31
(37, 91667, 0, 120, 120, '2025-12-31', 31, 14, '2024-08-05 15:45:00'), -- Pepsi

-- Receipt 32
(38, 87500, 0, 200, 200, '2025-12-31', 32, 9, '2024-09-15 10:10:00'), -- Mì Hảo Hảo

-- Receipt 33
(39, 33333, 0, 300, 300, '2025-12-31', 33, 20, '2024-10-20 14:50:00'), -- Sữa chua Vinamilk

-- Receipt 34
(40, 60000, 0, 150, 150, '2025-12-31', 34, 18, '2024-11-10 09:30:00');


-- Thêm Orders (15 đơn hàng)
INSERT INTO `order` (id, totalPrice, paymentMethod, paymentTime, isPaid, isReceived, customerId, staffId, createdAt) VALUES
    (1, 3050000, 'Tiền mặt', '2021-11-16 14:00:00', 1, 1, 3, 2, '2021-11-16 14:05:00'),
    (2, 1860000, 'Chuyển khoản', '2021-12-17 10:30:00', 1, 1, 3, 2, '2021-12-17 10:35:00'),
    (3, 3610000, 'Tiền mặt', '2022-01-11 16:30:00', 1, 1, 3, 2, '2022-01-11 16:35:00'),
    (4, 1472000, 'Chuyển khoản', '2022-02-04 09:15:00', 1, 1, 3, 2, '2022-02-04 09:20:00'),
    (5, 7115000, 'Tiền mặt', '2022-03-19 13:45:00', 1, 1, 3, 2, '2022-03-19 13:50:00'),
    (6, 1775000, 'Chuyển khoản', '2022-05-09 11:00:00', 1, 1, 3, 2, '2022-05-09 11:05:00'),
    (7, 4750000, 'Tiền mặt', '2022-06-24 14:20:00', 1, 1, 3, 2, '2022-06-24 14:25:00'),
    (8, 2275000, 'Chuyển khoản', '2022-07-14 08:05:00', 1, 1, 3, 2, '2022-07-14 08:10:00'),
    (9, 4915000, 'Tiền mặt', '2022-08-09 10:20:00', 1, 1, 3, 2, '2022-08-09 10:25:00'),
    (10, 2715000, 'Tiền mặt', '2022-09-04 17:00:00', 1, 1, 3, 2, '2022-09-04 17:05:00'),
    (11, 10550000, 'Chuyển khoản', '2022-10-01 09:45:00', 1, 1, 4, 2, '2022-10-01 09:50:00'),
    (12, 8055000, 'Tiền mặt', '2022-11-28 14:15:00', 1, 1, 5, 3, '2022-11-28 14:20:00'),
    (13, 9100000, 'Tiền mặt', '2022-12-25 10:30:00', 1, 1, 3, 2, '2022-12-25 10:35:00'),
    (14, 1408000, 'Chuyển khoản', '2023-01-22 16:00:00', 1, 1, 6, 3, '2023-01-22 16:05:00'),
    (15, 1976000, 'Tiền mặt', '2023-02-18 13:30:00', 1, 1, 5, 3, '2023-02-18 13:35:00'),
    (16, 4185000, 'Chuyển khoản', '2023-03-30 09:50:00', 1, 1, 3, 4, '2023-03-30 09:55:00'),
    (17, 2400000, 'Tiền mặt', '2023-04-25 14:10:00', 1, 1, 4, 3, '2023-04-25 14:15:00'),
    (18, 5010000, 'Chuyển khoản', '2023-05-20 15:40:00', 1, 1, 6, 4, '2023-05-20 15:45:00'),
    (19, 4910000, 'Tiền mặt', '2023-06-15 17:15:00', 1, 1, 4, 2, '2023-06-15 17:20:00'),
    (20, 3260000, 'Chuyển khoản', '2023-07-01 12:00:00', 1, 1, 5, 3, '2023-07-01 12:05:00'),
    (21, 4590000, 'Chuyển khoản', '2024-02-12 11:00:00', 1, 1, 5, 3, '2024-02-12 11:05:00'),
    (22, 7800000, 'Tiền mặt', '2024-03-20 14:30:00', 1, 1, 3, 2, '2024-03-20 14:35:00'),
    (23, 2505000, 'Chuyển khoản', '2024-04-05 09:50:00', 1, 1, 6, 4, '2024-04-05 09:55:00'),
    (24, 4300000, 'Tiền mặt', '2024-05-18 15:00:00', 1, 1, 4, 2, '2024-05-18 15:05:00'),
    (25, 8950000, 'Chuyển khoản', '2024-06-25 16:50:00', 1, 1, 5, 3, '2024-06-25 16:55:00'),
    (26, 3900000, 'Tiền mặt', '2024-07-10 14:00:00', 1, 1, 6, 4, '2024-07-10 14:05:00'),
    (27, 3255000, 'Chuyển khoản', '2024-08-15 10:40:00', 1, 1, 3, 2, '2024-08-15 10:45:00'),
    (28, 3975000, 'Tiền mặt', '2024-09-12 09:20:00', 1, 1, 4, 3, '2024-09-12 09:25:00'),
    (29, 4650000, 'Chuyển khoản', '2024-10-22 15:30:00', 1, 1, 5, 3, '2024-10-22 15:35:00'),
    (30, 5890000, 'Tiền mặt', '2024-11-18 12:20:00', 1, 1, 6, 4, '2024-11-18 12:25:00'),
    (31, 1250000, 'Tiền mặt', '2024-11-10 10:00:00', 1, 1, 5, 3, '2024-11-10 10:05:00'),
    (32, 950000, 'Chuyển khoản', '2024-11-15 12:00:00', 1, 1, 4, 2, '2024-11-15 12:05:00'),
    (33, 1350000, 'Tiền mặt', '2024-06-20 09:30:00', 1, 1, 6, 4, '2024-06-20 09:35:00'),
    (34, 1030000, 'Chuyển khoản', '2024-06-25 16:00:00', 1, 1, 3, 2, '2024-06-25 16:05:00'),
    (35, 2050000, 'Tiền mặt', '2024-03-18 10:00:00', 1, 1, 6, 3, '2024-03-18 10:05:00'),
    (36, 1870000, 'Chuyển khoản', '2024-03-25 14:30:00', 1, 1, 4, 2, '2024-03-25 14:35:00'),
    (37, 5500000, 'Tiền mặt', '2024-12-01 09:30:00', 1, 1, 3, 2, '2024-12-01 09:35:00'),
    (38, 8650000, 'Chuyển khoản', '2024-12-05 14:00:00', 1, 1, 4, 3, '2024-12-05 14:05:00'),
    (39, 1030000, 'Tiền mặt', '2024-12-08 11:30:00', 1, 1, 5, 3, '2024-12-08 11:35:00'),
    (40, 1350000, 'Chuyển khoản', '2024-12-10 16:00:00', 1, 1, 6, 4, '2024-12-10 16:05:00'),
    (41, 10580000, 'Tiền mặt', '2024-12-15 13:30:00', 1, 1, 5, 3, '2024-12-15 13:35:00'),
    (42, 8760000, 'Chuyển khoản', '2024-12-18 15:30:00', 1, 1, 6, 4, '2024-12-18 15:35:00'),
    (43, 11050000, 'Tiền mặt', '2024-12-22 17:30:00', 1, 1, 4, 2, '2024-12-22 17:35:00'),
    (44, 12800000, 'Chuyển khoản', '2024-12-25 10:30:00', 1, 1, 5, 3, '2024-12-25 10:35:00'),
    (45, 15900000, 'Tiền mặt', '2024-12-28 19:30:00', 1, 1, 6, 4, '2024-12-28 19:35:00'),
    (46, 9300000, 'Chuyển khoản', '2024-12-30 12:30:00', 1, 1, 4, 2, '2024-12-30 12:35:00');

-- Thêm Order Details (Tổng >20 chi tiết đơn hàng)
INSERT INTO order_detail (id, quantity, currentPrice, orderId, productUnitId) VALUES
-- Đơn hàng 1
(1, 10, 120000, 1, 1),  -- Tăng từ 3 lên 10 kg thịt ba rọi
(2, 10, 8000, 1, 5),    -- Tăng từ 3 lên 10 bó rau muống
(87, 10, 10000, 1, 13), -- Thêm 10 chai Coca-Cola
(88, 5, 150000, 1, 2),  -- Thêm 5 kg thịt bò Úc

-- Đơn hàng 2
(3, 6, 120000, 2, 1),   -- Tăng từ 2 lên 6 kg thịt ba rọi
(89, 10, 150000, 2, 2), -- Thêm 10 kg thịt bò Úc

-- Đơn hàng 3
(4, 6, 65000, 3, 3),   -- Tăng từ 2 lên 6 kg đùi gà
(5, 20, 15000, 3, 7),  -- Tăng từ 12 lên 20 kg cà rốt
(90, 10, 12000, 3, 7), -- Thêm 10 kg cà rốt (sản phẩm khác lô)
(91, 15, 10000, 3, 15), -- Thêm 15 chai Sting

-- Đơn hàng 4
(6, 20, 7000, 4, 10),  -- Tăng từ 8 lên 20 gói mì Omachi
(7, 20, 10000, 4, 13), -- Tăng từ 8 lên 20 chai Coca-Cola
(92, 5, 12000, 4, 16), -- Thêm 5 chai trà xanh

-- Đơn hàng 5
(8, 5, 350000, 5, 2),  -- Tăng từ 1 lên 5 kg thịt bò Úc
(9, 15, 20000, 5, 20), -- Tăng từ 7 lên 15 hộp sữa chua
(93, 15, 10000, 5, 15),-- Thêm 15 chai Sting
(94, 10, 50000, 5, 4), -- Thêm 10 chai Coca-Cola

-- Đơn hàng 6
(10, 5, 35000, 6, 17), -- Tăng từ 3 lên 5 hộp sữa tươi Vinamilk
(11, 10, 15000, 6, 7), -- Tăng từ 5 lên 10 kg cà rốt
(95, 5, 8000, 6, 5),   -- Thêm 5 bó rau muống

-- Đơn hàng 7
(12, 50, 7000, 7, 10),  -- Tăng từ 6 lên 50 gói mì Omachi
(98, 30, 3500, 7, 11),  -- Thêm 30 gói mì 3 miền
(99, 20, 12000, 7, 7),  -- Thêm 20 kg cà rốt

-- Đơn hàng 8
(13, 10, 65000, 8, 3), -- Tăng từ 4 lên 10 kg đùi gà
(14, 10, 15000, 8, 7), -- Tăng từ 3 lên 10 kg cà rốt
(96, 5, 30000, 8, 9),  -- Thêm 5 gói mì Hảo Hảo

-- Đơn hàng 9
(15, 10, 120000, 9, 1), -- Tăng từ 1 lên 10 kg thịt ba rọi
(16, 15, 11000, 9, 14), -- Tăng từ 2 lên 15 chai Pepsi
(100, 25, 15000, 9, 7), -- Thêm 25 kg cà rốt

-- Đơn hàng 10
(17, 15, 10000, 10, 13), -- Tăng từ 7 lên 15 chai Coca-Cola
(18, 10, 13000, 10, 16), -- Tăng từ 5 lên 10 chai trà xanh
(97, 10, 3500, 10, 11),  -- Thêm 10 gói mì 3 miền

-- Đơn hàng 11
(19, 15, 120000, 11, 1), -- Tăng từ 3 lên 15 kg thịt ba rọi
(20, 30, 7500, 11, 6),   -- Tăng từ 2 lên 30 kg cải thảo
(101, 20, 10000, 11, 13),-- Thêm 20 chai Coca-Cola
(102, 10, 8000, 11, 5),  -- Thêm 10 bó rau muống

-- Đơn hàng 12
(21, 10, 120000, 12, 1), -- Tăng từ 1 lên 10 kg thịt ba rọi
(22, 25, 11000, 12, 14), -- Tăng từ 2 lên 25 chai Pepsi
(103, 30, 5000, 12, 11), -- Thêm 30 gói mì 3 miền

-- Đơn hàng 13
(23, 10, 65000, 13, 3),  -- Tăng từ 4 lên 10 kg đùi gà
(24, 20, 3500, 13, 11),  -- Tăng từ 6 lên 20 gói mì 3 miền

-- Đơn hàng 14
(25, 6, 15000, 14, 7),   -- 6 kg cà rốt
(26, 2, 38000, 14, 18),  -- 2 hộp sữa TH True Milk

-- Đơn hàng 15
(27, 30, 8000, 15, 5),   -- Tăng từ 8 lên 30 bó rau muống
(104, 15, 7000, 15, 10), -- Thêm 15 gói mì Omachi
(105, 10, 15000, 15, 7), -- Thêm 10 kg cà rốt

-- Đơn hàng 16
(28, 5, 350000, 16, 2),  -- Tăng từ 1 lên 5 kg thịt bò Úc
(29, 50, 3000, 16, 9),   -- Tăng từ 5 lên 50 gói mì Hảo Hảo
(106, 20, 5000, 16, 11), -- Thêm 20 gói mì 3 miền
(107, 10, 12000, 16, 15),-- Thêm 10 chai Sting

-- Đơn hàng 17
(30, 10, 13000, 17, 16), -- Tăng từ 2 lên 10 chai trà xanh
(31, 20, 5000, 17, 8),   -- Tăng từ 4 lên 20 gói khoai tây
(108, 15, 10000, 17, 13),-- Thêm 15 chai Coca-Cola

-- Đơn hàng 18
(32, 10, 10000, 18, 13), -- Tăng từ 2 lên 10 chai Coca-Cola
(33, 50, 3500, 18, 12),  -- Tăng từ 10 lên 50 gói mì Kokomi
(109, 20, 8000, 18, 5),  -- Thêm 20 bó rau muống
(110, 10, 15000, 18, 7), -- Thêm 10 kg cà rốt

-- Đơn hàng 19
(34, 10, 15000, 19, 7),  -- Tăng từ 2 lên 10 kg cà rốt
(35, 10, 65000, 19, 3),  -- Tăng từ 4 lên 10 kg đùi gà
(111, 15, 7000, 19, 10), -- Thêm 15 gói mì Omachi
(112, 8, 120000, 19, 1), -- Thêm 8 kg thịt ba rọi

-- Đơn hàng 20
(36, 20, 10000, 20, 13), -- Tăng từ 5 lên 20 chai Coca-Cola
(37, 10, 120000, 20, 1), -- Tăng từ 1 lên 10 kg thịt ba rọi
(113, 15, 10000, 20, 15),-- Thêm 15 chai Sting

-- Đơn hàng 21
(38, 2, 150000, 21, 2),  -- 2 kg thịt bò Úc
(39, 1, 15000, 21, 7),   -- 1 kg cà rốt

-- Đơn hàng 22
(40, 15, 120000, 22, 1), -- Tăng từ 5 lên 15 kg thịt ba rọi
(41, 30, 5000, 22, 11),  -- Tăng từ 10 lên 30 gói mì 3 miền

-- Đơn hàng 23
(42, 10, 65000, 23, 3),  -- Tăng từ 4 lên 10 kg đùi gà
(43, 15, 15000, 23, 7),  -- Tăng từ 3 lên 15 kg cà rốt
(114, 10, 10000, 23, 11),-- Thêm 10 gói mì 3 miền

-- Đơn hàng 24
(44, 10, 18000, 24, 8),  -- Tăng từ 2 lên 10 kg khoai tây
(45, 20, 12000, 24, 15), -- Tăng từ 10 lên 20 chai Sting
(115, 10, 65000, 24, 3), -- Thêm 10 kg đùi gà

-- Đơn hàng 25
(46, 1, 350000, 25, 2),  -- 1 kg thịt bò Úc
(47, 2, 50000, 25, 4),   -- 2 chai Coca Cola

-- Đơn hàng 26
(48, 1, 310000, 26, 6),  -- 1 gói cải thảo

-- Đơn hàng 27
(49, 10, 200000, 27, 18),-- Tăng từ 1 lên 10 hộp sữa TH True Milk
(116, 10, 38000, 27, 15),-- Thêm 10 chai Sting
(117, 5, 65000, 27, 3),  -- Thêm 5 kg đùi gà

-- Đơn hàng 28
(50, 10, 120000, 28, 1), -- Tăng từ 1 lên 10 kg thịt ba rọi
(51, 20, 77500, 28, 2),  -- Tăng từ 2 lên 20 kg thịt bò Úc
(118, 15, 8000, 28, 5),  -- Thêm 15 bó rau muống

-- Đơn hàng 29
(52, 5, 30000, 29, 7),   -- 5 kg cà rốt

-- Đơn hàng 30
(53, 3, 100000, 30, 4),  -- 3 chai Coca Cola
(54, 1, 150000, 30, 3),  -- 1 kg đùi gà

-- Đơn hàng 31
(55, 10, 120000, 31, 1),  -- 10 kg thịt ba rọi
(56, 5, 8000, 31, 5),     -- 5 bó rau muống

-- Đơn hàng 32
(57, 3, 350000, 32, 2),   -- 3 kg thịt bò Úc
(58, 10, 7000, 32, 10),   -- 10 gói mì Omachi

-- Đơn hàng 33
(59, 50, 65000, 33, 3),  -- Tăng từ 15 lên 50 kg đùi gà
(60, 30, 12000, 33, 7),  -- Tăng từ 10 lên 30 kg cà rốt
(119, 20, 10000, 33, 13),-- Thêm 20 chai Coca-Cola

-- Đơn hàng 34
(61, 20, 15000, 34, 7),  -- Tăng từ 12 lên 20 kg cà rốt
(62, 50, 10000, 34, 13), -- Tăng từ 30 lên 50 chai Coca-Cola

-- Đơn hàng 35
(63, 20, 120000, 35, 1), -- Tăng từ 6 lên 20 kg thịt ba rọi
(64, 20, 15000, 35, 7),  -- Tăng từ 10 lên 20 kg cà rốt
(120, 30, 8000, 35, 5),  -- Thêm 30 bó rau muống

-- Đơn hàng 36
(65, 3, 38000, 36, 18),   -- 3 hộp sữa TH True Milk
(66, 10, 12000, 36, 15),  -- 10 chai Sting

-- Đơn hàng 37
(67, 20, 350000, 37, 2), -- Tăng từ 2 lên 20 kg thịt bò Úc
(68, 30, 10000, 37, 13), -- Tăng từ 10 lên 30 chai Coca-Cola
(121, 50, 3000, 37, 9),  -- Thêm 50 gói mì Hảo Hảo

-- Đơn hàng 38
(69, 5, 65000, 38, 3),   -- 5 kg đùi gà
(70, 10, 7000, 38, 10),  -- 10 gói mì Omachi

-- Đơn hàng 39
(71, 3, 38000, 39, 18),  -- 3 hộp sữa TH True Milk
(72, 10, 12000, 39, 15), -- 10 chai Sting

-- Đơn hàng 40
(73, 30, 8000, 40, 5),   -- Tăng từ 8 lên 30 bó rau muống
(74, 20, 12000, 40, 7),  -- Tăng từ 10 lên 20 kg cà rốt

-- Đơn hàng 41
(75, 5, 120000, 41, 1),  -- 5 kg thịt ba rọi
(76, 15, 15000, 41, 7),  -- 15 kg cà rốt

-- Đơn hàng 42
(77, 15, 65000, 42, 3),  -- Tăng từ 6 lên 15 kg đùi gà
(78, 30, 10000, 42, 13), -- Tăng từ 15 lên 30 chai Coca-Cola

-- Đơn hàng 43
(79, 4, 25000, 43, 19),  -- 4 hộp sữa đặc Ông Thọ
(80, 20, 3000, 43, 9),   -- 20 gói mì Hảo Hảo

-- Đơn hàng 44
(81, 2, 350000, 44, 2),  -- 2 kg thịt bò Úc
(82, 5, 12000, 44, 7),   -- 5 kg cà rốt

-- Đơn hàng 45
(83, 20, 38000, 45, 18), -- Tăng từ 10 lên 20 hộp sữa TH True Milk
(84, 50, 15000, 45, 15), -- Tăng từ 20 lên 50 chai Sting

-- Đơn hàng 46
(85, 30, 10000, 46, 13), -- Tăng từ 8 lên 30 chai Coca-Cola
(86, 20, 65000, 46, 3);  -- Tăng từ 6 lên 20 kg đùi gà

INSERT INTO parameter (name, description, value) VALUES
('pointConversionRate', 'Tỷ lệ đổi từ điểm sang VND, bao nhiêu điểm thì được 1 VND', 100),
('moneyConversionRate', 'Tỷ lệ đổi từ VND sang điểm, bao nhiêu VND thì được 1 điểm', 1000);
