
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
(20, 'Sữa chua Vinamilk', 'Sữa chua có đường', 5, NOW()),

(21, 'Thịt heo nạc', 'Thịt heo nạc tươi từ trang trại', 1, NOW()),
(22, 'Sườn heo', 'Sườn heo tươi ngon', 1, NOW()),
(23, 'Thịt bò thăn', 'Thịt bò thăn tươi cao cấp', 1, NOW()),

-- Rau củ (product_line_id: 2) - Thêm các loại rau củ
(24, 'Bắp cải', 'Bắp cải tươi organic', 2, NOW()),
(25, 'Cà chua', 'Cà chua Đà Lạt', 2, NOW()),
(26, 'Hành tây', 'Hành tây tươi', 2, NOW()),

-- Mì gói (product_line_id: 3) - Thêm các loại mì
(27, 'Mì Cung Đình', 'Mì Cung Đình hương vị tôm chua cay', 3, NOW()),
(28, 'Mì Gấu Đỏ', 'Mì Gấu Đỏ hương vị thịt bò', 3, NOW()),

-- Nước giải khát (product_line_id: 4) - Thêm đồ uống
(29, '7Up', 'Nước giải khát có gas', 4, NOW()),
(30, 'Fanta', 'Nước giải khát có gas hương cam', 4, NOW());

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
(10, 'túi', NOW());




-- Thêm Product Units (Tổng 20 đơn vị sản phẩm)
INSERT INTO product_unit (id, sell_price, conversion_rate, image, volumne, productSampleId, unitId, createdAt) VALUES
-- Thịt và Gia cầm
(1, 120000, 1, 'thit-ba-roi.jpg', '1', 1, 1, NOW()),
(2, 350000, 1, 'thit-bo-uc.jpg', '1', 2, 1, NOW()),
(3, 65000, 1, 'dui-ga.jpg', '1', 3, 1, NOW()),
(4, 60000, 1, 'canh-ga.jpg', '1', 4, 1, NOW()),

-- Rau củ
(5, 8000, 1, 'rau-muong.jpg', '1', 5, 2, NOW()),
(6, 12000, 1, 'cai-thao.jpg', '1', 6, 1, NOW()),
(7, 15000, 1, 'ca-rot.jpg', '1', 7, 1, NOW()),
(8, 18000, 1, 'khoai-tay.jpg', '1', 8, 1, NOW()),

-- Mì gói
(9, 4000, 1, 'mi-hao-hao.jpg', '1', 9, 3, NOW()),
(10, 7000, 1, 'mi-omachi.jpg', '1', 10, 3, NOW()),
(11, 3500, 1, 'mi-3-mien.jpg', '1', 11, 3, NOW()),
(12, 3500, 1, 'mi-kokomi.jpg', '1', 12, 3, NOW()),

-- Nước giải khát
(13, 10000, 1, 'coca-cola.jpg', '330ml', 13, 4, NOW()),
(14, 10000, 1, 'pepsi.jpg', '330ml', 14, 4, NOW()),
(15, 12000, 1, 'sting.jpg', '330ml', 15, 4, NOW()),
(16, 10000, 1, 'tra-xanh.jpg', '330ml', 16, 4, NOW()),

-- Sữa
(17, 35000, 1, 'sua-tuoi-vinamilk.jpg', '1L', 17, 5, NOW()),
(18, 38000, 1, 'sua-tuoi-th.jpg', '1L', 18, 5, NOW()),
(19, 25000, 1, 'sua-dac.jpg', '380g', 19, 5, NOW()),
(20, 6000, 1, 'sua-chua.jpg', '100g', 20, 5, NOW()),
(21, 120000, 1, 'thit-heo-nac-kg.jpg', '1', 21, 1, NOW()),         -- kg
(22, 12000, 0.1, 'thit-heo-nac-100g.jpg', '100', 21, 9, NOW()),    -- 100g
(23, 600000, 5, 'thit-heo-nac-5kg.jpg', '5', 21, 1, NOW()),        -- 5kg

-- Sườn heo (id: 22) - 3 đơn vị tính
(24, 45000, 0.3, 'suon-heo-mieng.jpg', '1', 22, 7, NOW()),         -- miếng
(25, 150000, 1, 'suon-heo-kg.jpg', '1', 22, 1, NOW()),             -- kg
(26, 15000, 0.1, 'suon-heo-100g.jpg', '100', 22, 9, NOW()),        -- 100g

-- Thịt bò thăn (id: 23) - 3 đơn vị tính
(27, 400000, 1, 'thit-bo-than-kg.jpg', '1', 23, 1, NOW()),         -- kg
(28, 40000, 0.1, 'thit-bo-than-100g.jpg', '100', 23, 9, NOW()),    -- 100g
(29, 200000, 0.5, 'thit-bo-than-500g.jpg', '500', 23, 9, NOW()),   -- 500g

-- Bắp cải (id: 24) - 3 đơn vị tính
(30, 15000, 1, 'bap-cai-kg.jpg', '1', 24, 1, NOW()),               -- kg
(31, 20000, 1, 'bap-cai-bong.jpg', '1', 24, 7, NOW()),             -- bông
(32, 70000, 5, 'bap-cai-tui.jpg', '5', 24, 10, NOW()),             -- túi 5kg

-- Cà chua (id: 25) - 3 đơn vị tính
(33, 25000, 1, 'ca-chua-kg.jpg', '1', 25, 1, NOW()),               -- kg
(34, 60000, 3, 'ca-chua-tui.jpg', '3', 25, 10, NOW()),             -- túi 3kg
(35, 10000, 0.5, 'ca-chua-500g.jpg', '500', 25, 9, NOW()),         -- 500g

-- Mì Cung Đình (id: 27) - 3 đơn vị tính
(36, 8500, 1, 'mi-cung-dinh-goi.jpg', '1', 27, 3, NOW()),          -- gói
(37, 48000, 6, 'mi-cung-dinh-loc.jpg', '6', 27, 8, NOW()),         -- lốc 6 gói
(38, 190000, 24, 'mi-cung-dinh-thung.jpg', '24', 27, 6, NOW()),    -- thùng 24 gói

-- 7Up (id: 29) - 4 đơn vị tính
(39, 10000, 1, '7up-chai.jpg', '330ml', 29, 4, NOW()),             -- chai
(40, 55000, 6, '7up-loc.jpg', '6x330ml', 29, 8, NOW()),            -- lốc 6 chai
(41, 200000, 24, '7up-thung.jpg', '24x330ml', 29, 6, NOW()),       -- thùng 24 chai
(42, 15000, 1, '7up-lon.jpg', '330ml', 29, 5, NOW());              -- lon


-- Insert Groups
INSERT INTO `group` (id, name, description) VALUES
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'Staff', 'Nhân viên bán hàng'),
(3, 'Customer', 'Khách hàng');

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
INSERT INTO `user` (id, name, username, email, password, score, address, phone, groupId, createdAt) VALUES
(1, 'Nguyễn Văn Admin', 'admin', 'admin@mini.mart', '$2a$10$encrypted', 0, 'Hà Nội', '0901234567', 1, NOW()),
(2, 'Trần Thị Nhân Viên', 'staff1', 'staff1@mini.mart', '$2a$10$encrypted', 0, 'Hà Nội', '0901234568', 2, NOW()),
(3, 'Lê Văn Khách', 'customer1', 'customer1@gmail.com', '$2a$10$encrypted', 100, 'Hà Nội', '0901234569', 3, NOW());

-- Insert Suppliers
INSERT INTO supplier (id, name, phone, address, country, createdAt) VALUES
(1, 'Công ty TNHH Thực phẩm Sạch', '0987654321', 'Số 123 Đường ABC, Hà Nội', 'Việt Nam', NOW()),
(2, 'Công ty CP Phân phối Hàng tiêu dùng', '0987654322', 'Số 456 Đường XYZ, Hồ Chí Minh', 'Việt Nam', NOW());

-- Insert Supplier Products
INSERT INTO supplier_product (id, supplierId, productUnitId, status) VALUES
(1, 1, 1, 'active'),
(2, 1, 2, 'active'),
(3, 2, 3, 'active'),
(4, 2, 4, 'active'),
(5, 2, 5, 'active'),
(6, 1, 21, 'active'),
(7, 1, 24, 'active'),
(8, 1, 27, 'active'),
(9, 2, 36, 'active'),
(10, 2, 39, 'active');

-- Insert Inbound Receipts
INSERT INTO inbound_receipt (id, totalPrice, isReceived, isPaid, staff_id, supplierId, createdAt) VALUES
(1, 5000000, 1, 1, 2, 1, NOW()),
(2, 3000000, 1, 1, 2, 2, NOW());

-- Insert Batches
INSERT INTO batch (id, inbound_price, sell_price, discount, quantity, inbound_quantity, expiredAt, inboundReceiptId, productUnitId, createdAt) VALUES
(1, 100000, 120000, 0, 50, 50, '2024-12-31', 1, 1, NOW()),
(2, 6000, 8000, 0, 100, 100, '2024-06-30', 1, 2, NOW()),
(3, 3500, 4000, 0, 500, 500, '2024-12-31', 2, 3, NOW()),
(4, 8000, 10000, 0, 200, 200, '2024-12-31', 2, 4, NOW()),
(5, 100000, 120000, 0, 100, 100, '2024-12-31', 1, 21, NOW()),
(6, 10000, 12000, 0, 200, 200, '2024-12-31', 1, 22, NOW()),
(7, 35000, 45000, 0, 50, 50, '2024-12-31', 1, 24, NOW()),
(8, 7000, 8500, 0, 500, 500, '2024-12-31', 2, 36, NOW()),
(9, 8000, 10000, 0, 300, 300, '2024-12-31', 2, 39, NOW()),
(10, 45000, 55000, 0, 100, 100, '2024-12-31', 2, 40, NOW());

-- Thêm Orders (15 đơn hàng)
INSERT INTO `order` (id, total_price, payment_method, payment_time, status, customer_id, staff_id, createdAt) VALUES
    (1, 256000, 'cash', NOW() - INTERVAL 1 DAY, 'completed', 3, 2, NOW() - INTERVAL 1 DAY),
    (2, 120000, 'card', NOW() - INTERVAL 1 DAY, 'completed', 3, 2, NOW() - INTERVAL 1 DAY),
    (3, 185000, 'cash', NOW() - INTERVAL 2 DAY, 'completed', 3, 2, NOW() - INTERVAL 2 DAY),
    (4, 95000, 'card', NOW() - INTERVAL 2 DAY, 'completed', 3, 2, NOW() - INTERVAL 2 DAY),
    (5, 450000, 'cash', NOW() - INTERVAL 3 DAY, 'completed', 3, 2, NOW() - INTERVAL 3 DAY),
    (6, 165000, 'card', NOW() - INTERVAL 3 DAY, 'completed', 3, 2, NOW() - INTERVAL 3 DAY),
    (7, 78000, 'cash', NOW() - INTERVAL 4 DAY, 'completed', 3, 2, NOW() - INTERVAL 4 DAY),
    (8, 225000, 'card', NOW() - INTERVAL 4 DAY, 'completed', 3, 2, NOW() - INTERVAL 4 DAY),
    (9, 142000, 'cash', NOW() - INTERVAL 5 DAY, 'completed', 3, 2, NOW() - INTERVAL 5 DAY),
    (10, 89000, 'cash', NOW() - INTERVAL 5 DAY, 'completed', 3, 2, NOW() - INTERVAL 5 DAY),
    (11, 167000, 'card', NOW() - INTERVAL 6 DAY, 'completed', 3, 2, NOW() - INTERVAL 6 DAY),
    (12, 234000, 'cash', NOW() - INTERVAL 6 DAY, 'completed', 3, 2, NOW() - INTERVAL 6 DAY),
    (13, 345000, 'card', NOW() - INTERVAL 7 DAY, 'completed', 3, 2, NOW() - INTERVAL 7 DAY),
    (14, 178000, 'cash', NOW() - INTERVAL 7 DAY, 'completed', 3, 2, NOW() - INTERVAL 7 DAY),
    (15, 156000, 'card', NOW() - INTERVAL 7 DAY, 'completed', 3, 2, NOW() - INTERVAL 7 DAY);




-- Thêm Order Details (Tổng >20 chi tiết đơn hàng)
INSERT INTO order_detail (id, quantity, current_price, orderId, productUnitId) VALUES
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