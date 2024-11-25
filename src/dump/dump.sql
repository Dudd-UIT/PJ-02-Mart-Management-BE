
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
(6, 'thùng', NOW());

-- Thêm Product Units (Tổng 20 đơn vị sản phẩm)
INSERT INTO product_unit (id, sellPrice, conversionRate, image, volumne, productSampleId, unitId, createdAt) VALUES
-- Thịt và Gia cầm
(1, 120000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS_idOuuaioteV4Hzmsvwus57R7SlL1A26jg&s', '1', 1, 1, NOW()),
(2, 350000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNVM2hRGNPr9C9sQP2aaH6LlWQXHCNqCp3vw&s', '1', 2, 1, NOW()),
(3, 65000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSssGbOdvVm9YSE2T8PJPnjGNQQYcZCBVWJhg&s', '1', 3, 1, NOW()),
(4, 60000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1Ts6kDgWocoZNlSbfinxeP47AlELJWcjXXA&s', '1', 4, 1, NOW()),

-- Rau củ
(5, 8000, 1, 'https://images2.thanhnien.vn/zoom/686_429/528068263637045248/2023/9/13/rau-muong-16945744756401379166751-75-0-476-642-crop-16945745476001397609558.png', '1', 5, 2, NOW()),
(6, 12000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeP85FwnzLmG3zAxRo3PvArn90xh7H3uNWvg&s', '1', 6, 1, NOW()),
(7, 15000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuAp57MbrrAh6O6DQ89USyHFOIq0f2eHZKSQ&s', '1', 7, 1, NOW()),
(8, 18000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMiVD5BCbRjnu4tsOvs9WV7j4Za_ISLpnAYw&s', '1', 8, 1, NOW()),

-- Mì gói
(9, 4000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ3YZSwJEl3EFCb5haHxhPyzOvnMU5kpGG6A&s', '1', 9, 3, NOW()),
(10, 7000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQADicx1UWOZePim-anIkCy3Mj7A2v-tvJNQ&s', '1', 10, 3, NOW()),
(11, 3500, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9I5cdBIRo6XpzS-nEzOoEj2TJlSrUk0qEGw&s', '1', 11, 3, NOW()),
(12, 3500, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqFIK6cJcHwnzUHtTqvrXws3xaDrL2Fw85Cg&s', '1', 12, 3, NOW()),

-- Nước giải khát
(13, 10000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUlFvGKCHhTwr6fiK0O1ZwVyuffp8zRcXlcQ&s', '330ml', 13, 4, NOW()),
(14, 10000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGFF9wTI-2Lf_kMUkCPjK1LwqC_YQWy-_FVA&s', '330ml', 14, 4, NOW()),
(15, 12000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9jDajnaubt1eQGpm3FkCHHSe6NkP-pu5OZw&s', '330ml', 15, 4, NOW()),
(16, 10000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR32Rpyq52E5rHkTM8LExvIZeFmO6oP-sj3Cg&s', '330ml', 16, 4, NOW()),

-- Sữa
(17, 35000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-2L581_Fmf-h87orbYar6cg0Wmss93tJ3Mg&s', '1L', 17, 5, NOW()),
(18, 38000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG_mCa8SZ0ilroESF12s1rxV6t8C4bOOGkCg&s', '1L', 18, 5, NOW()),
(19, 25000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLJsXsGamM-MVngdc3qPPxD7RNDQy1hQSGdw&s', '380g', 19, 5, NOW()),
(20, 6000, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR23a2l1LxuL6jyYBx1RzUNklNzkvByMi4lFg&s', '100g', 20, 5, NOW());


-- Insert Groups
INSERT INTO `group` (id, name, description) VALUES
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'Nhân viên', 'Nhân viên bán hàng'),
(3, 'Khách hàng', 'Khách hàng');

-- Insert Roles
INSERT INTO role (id, url, description) VALUES
(1, '/admin/*', 'Quyền quản trị'),
(2, '/sales/*', 'Quyền bán hàng'),
(3, '/customer/*', 'Quyền khách hàng');

-- Insert role_group
INSERT INTO role_group (groupId, roleId) VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 3);

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

-- Insert Inbound Receipts
INSERT INTO inbound_receipt (id, totalPrice, isReceived, isPaid, staffId, supplierId, createdAt) VALUES
(1, 5000000, 1, 1, 2, 1, NOW()),
(2, 3000000, 1, 1, 2, 2, NOW());

-- Insert Batches
INSERT INTO batch (id, inboundPrice, discount, inventQuantity, inboundQuantity, expiredAt, inboundReceiptId, productUnitId, createdAt) VALUES
(1, 100000, 0, 50, 50, '2024-12-31', 1, 1, NOW()),
(2, 6000, 0, 100, 100, '2024-06-30', 1, 2, NOW()),
(3, 3500, 0, 500, 500, '2024-12-31', 2, 3, NOW()),
(4, 8000, 0, 200, 200, '2024-12-31', 2, 4, NOW());


-- Thêm Orders (15 đơn hàng)
INSERT INTO `order` (id, totalPrice, paymentMethod, paymentTime, isPaid, isReceived, customerId, staffId, createdAt) VALUES
    (1, 256000, 'Tiền mặt', NOW() - INTERVAL 1 DAY, 1, 1, 3, 2, NOW() - INTERVAL 1 DAY),
    (2, 120000, 'Chuyển khoản', NOW() - INTERVAL 1 DAY, 1, 1, 3, 2, NOW() - INTERVAL 1 DAY),
    (3, 185000, 'Tiền mặt', NOW() - INTERVAL 2 DAY, 1, 1, 3, 2, NOW() - INTERVAL 2 DAY),
    (4, 95000, 'Chuyển khoản', NOW() - INTERVAL 2 DAY, 1, 1, 3, 2, NOW() - INTERVAL 2 DAY),
    (5, 450000, 'Tiền mặt', NOW() - INTERVAL 3 DAY, 1, 1, 3, 2, NOW() - INTERVAL 3 DAY),
    (6, 165000, 'Chuyển khoản', NOW() - INTERVAL 3 DAY, 1, 1, 3, 2, NOW() - INTERVAL 3 DAY),
    (7, 78000, 'Tiền mặt', NOW() - INTERVAL 4 DAY, 1, 1, 3, 2, NOW() - INTERVAL 4 DAY),
    (8, 225000, 'Chuyển khoản', NOW() - INTERVAL 4 DAY, 1, 1, 3, 2, NOW() - INTERVAL 4 DAY),
    (9, 142000, 'Tiền mặt', NOW() - INTERVAL 5 DAY, 1, 1, 3, 2, NOW() - INTERVAL 5 DAY),
    (10, 89000, 'Tiền mặt', NOW() - INTERVAL 5 DAY, 1, 1, 3, 2, NOW() - INTERVAL 5 DAY),
    (11, 167000, 'Chuyển khoản', NOW() - INTERVAL 6 DAY, 1, 1,  3, 2, NOW() - INTERVAL 6 DAY),
    (12, 234000, 'Tiền mặt', NOW() - INTERVAL 6 DAY, 1, 1, 3, 2, NOW() - INTERVAL 6 DAY),
    (13, 345000, 'Chuyển khoản', NOW() - INTERVAL 7 DAY, 1, 1, 3, 2, NOW() - INTERVAL 7 DAY),
    (14, 178000, 'Tiền mặt', NOW() - INTERVAL 7 DAY, 1, 1, 3, 2, NOW() - INTERVAL 7 DAY),
    (15, 156000, 'Chuyển khoản', NOW() - INTERVAL 7 DAY, 1, 1, 3, 2, NOW() - INTERVAL 7 DAY);




-- Thêm Order Details (Tổng >20 chi tiết đơn hàng)
INSERT INTO order_detail (id, quantity, currentPrice, orderId, productUnitId) VALUES
-- Đơn hàng 1
(1, 2, 120000, 1, 1),  -- 2 kg thịt ba rọi
(2, 2, 8000, 1, 5),    -- 2 bó rau muống

-- Đơn hàng 2
(3, 1, 120000, 2, 1),  -- 1 kg thịt ba rọi

-- Đơn hàng 3
(4, 1, 65000, 3, 3),   -- 1 kg đùi gà
(5, 8, 15000, 3, 7),   -- 8 kg cà rốt

-- Đơn hàng 4
(6, 5, 7000, 4, 10),   -- 5 gói mì Omachi
(7, 5, 10000, 4, 13),  -- 5 chai Coca Cola

-- Đơn hàng 5
(8, 1, 350000, 5, 2),  -- 1 kg thịt bò Úc
(9, 5, 20000, 5, 20),  -- 5 hộp sữa chua

-- Đơn hàng 6
(10, 2, 35000, 6, 17), -- 2 hộp sữa tươi Vinamilk
(11, 3, 15000, 6, 7),  -- 3 kg cà rốt
(12, 5, 3500, 6, 11),  -- 5 gói mì 3 Miền

-- Đơn hàng 7
(13, 3, 12000, 7, 15), -- 3 chai Sting
(14, 6, 7000, 7, 10),  -- 6 gói mì Omachi

-- Đơn hàng 8
(15, 3, 65000, 8, 3),  -- 3 kg đùi gà
(16, 2, 15000, 8, 7),  -- 2 kg cà rốt

-- Đơn hàng 9
(17, 1, 120000, 9, 1), -- 1 kg thịt ba rọi
(18, 2, 11000, 9, 14), -- 2 chai Pepsi

-- Đơn hàng 10
(19, 5, 10000, 10, 13), -- 5 chai Coca Cola
(20, 3, 13000, 10, 16), -- 3 chai trà xanh

-- Đơn hàng 11
(21, 2, 38000, 11, 18), -- 2 hộp sữa TH True Milk
(22, 3, 25000, 11, 19), -- 3 hộp sữa đặc
(23, 4, 3500, 11, 11),  -- 4 gói mì 3 Miền

-- Đơn hàng 12
(24, 1, 120000, 12, 1), -- 1 kg thịt ba rọi
(25, 2, 60000, 12, 4),  -- 2 kg cánh gà

-- Đơn hàng 13
(26, 1, 350000, 13, 2), -- 1 kg thịt bò Úc
(27, 2, 8000, 13, 5),   -- 2 bó rau muống

-- Đơn hàng 14
(28, 2, 65000, 14, 3),  -- 2 kg đùi gà
(29, 4, 12000, 14, 6),  -- 4 kg cải thảo

-- Đơn hàng 15
(30, 1, 120000, 15, 1), -- 1 kg thịt ba rọi
(31, 3, 12000, 15, 15); -- 3 chai Sting

INSERT INTO parameter (name, description, value) VALUES
('pointConversionRate', 'Tỷ lệ đổi từ điểm sang VND, bao nhiêu điểm thì được 1 VND', 100),
('moneyConversionRate', 'Tỷ lệ đổi từ VND sang điểm, bao nhiêu VND thì được 1 điểm', 1000);
