# Báo Cáo Kết Quả Thực Nghiệm Xử Lý Đồng Thời (Concurrency) trên Oracle 21c XE
*Ngày tạo:* 5/28/2026, 1:40:47 PM
*Môi trường:* Node.js driver + Oracle 21c Database Express Edition

--- 1. LOST UPDATE SCENARIO (C1) ---
Kịch bản: T1 & T2 cùng mượn sách S000001 (số lượng còn là 1).
T1: SELECT SoLuongCon FROM KHOSACH WHERE MaSach = 'S000001' FOR UPDATE;
T1: Read quantity = 1 (T1 đang giữ khóa)
T2: SELECT SoLuongCon FROM KHOSACH WHERE MaSach = 'S000001' FOR UPDATE; (T2 sẽ bị block...)
👉 Khớp kết quả: T2 đang bị BLOCK đúng như kỳ vọng!
T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon - 1 WHERE MaSach = 'S000001';
T1: COMMIT;
T1: Đã giải phóng khóa.
T2: Đã unblock! Đọc được SoLuongCon = 0

--- 2. DIRTY READ SCENARIO (C2) ---
Kịch bản: Oracle sử dụng READ COMMITTED mặc định kết hợp MVCC, chặn đọc dữ liệu chưa commit.
T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon - 1 WHERE MaSach = 'S000002'; (Chưa COMMIT)
T2: SELECT SoLuongCon FROM KHOSACH WHERE MaSach = 'S000002';
T2: Read quantity = 10
👉 Khớp kết quả: T2 chỉ đọc được giá trị cũ (10). Oracle đã chặn Dirty Read thành công!
T1: ROLLBACK;

--- 3. PHANTOM READ SCENARIO (C3) ---

3.1. Thử nghiệm Phantom Read ở mức cô lập mặc định (READ COMMITTED):
T1 (Tx1): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN';
T1 (Tx1) Lần 1: Số phiếu quá hạn = 0
T2: UPDATE PHIEUMUON SET TrangThai = 'QUA_HAN' WHERE MaPhieuMuon = 'PM000001'; COMMIT;
T1 (Tx1): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN';
T1 (Tx1) Lần 2: Số phiếu quá hạn = 1
👉 Khớp kết quả: Số phiếu thay đổi (Phantom Read xuất hiện dưới mức READ COMMITTED).

3.2. Khắc phục Phantom Read bằng mức cô lập SERIALIZABLE:
T1 (Tx2): SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
T1 (Tx2): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN';
T1 (Tx2) Lần 1: Số phiếu quá hạn = 0
T2: UPDATE PHIEUMUON SET TrangThai = 'QUA_HAN' WHERE MaPhieuMuon = 'PM000001'; COMMIT;
T1 (Tx2): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN';
T1 (Tx2) Lần 2: Số phiếu quá hạn = 0
👉 Khớp kết quả: Số phiếu vẫn giữ nguyên! SERIALIZABLE đã ngăn chặn thành công Phantom Read!

--- 4. DEADLOCK SCENARIO (C4) ---
Kịch bản: T1 & T2 cùng khóa hai cuốn sách ngược thứ tự nhau.
T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000001'; (Khóa sách 1)
T2: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000002'; (Khóa sách 2)
T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000002'; (T1 đợi T2...)
T2: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000001'; (T2 đợi T1... Gây Deadlock!)
👉 Khớp kết quả: Oracle phát hiện Deadlock thành công! (T1 bị hủy)
Thông báo lỗi của Oracle ở T1: ORA-00060: deadlock detected while waiting for resource
T2: Lock acquired successfully.
Giải phóng toàn bộ khóa bằng Rollback cuối.