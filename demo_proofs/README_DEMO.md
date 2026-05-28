# Bản đồ Minh chứng & Hướng dẫn Vận hành Demo Đồ án

Tài liệu này đóng vai trò là danh mục hướng dẫn tra cứu tất cả các minh chứng chạy thử nghiệm hệ thống (video, ảnh chụp màn hình UI/SQL, nhật ký giao tác đồng thời) cho **Hệ thống Quản lý Thư viện** (React + Node.js + Oracle 21c XE).

Tất cả các tệp minh chứng được lưu trữ tập trung tại thư mục: `C:\Users\Nguyen Trong Khoi\Downloads\HQTSCDL_DA\library_oracle_hqtcsdl\demo_proofs`

---

## 1. Video Demo Vận hành Hệ thống
- **Tên tệp:** `demo_video.mp4`
- **Nội dung:** Video quay toàn bộ quy trình từ khởi động máy chủ, đăng nhập hệ thống, thao tác 6 nghiệp vụ chính của thủ thư (B1 -> B6), đồng bộ dữ liệu lên Dashboard thời gian thực, và thực nghiệm 4 kịch bản tranh chấp đồng thời (Lost Update, Dirty Read, Phantom Read, Deadlock) trên giao diện hai màn hình SQL Developer song song.

---

## 2. Bản đồ Ảnh chụp Màn hình (25 Ảnh chi tiết)

Dưới đây là danh sách các ảnh chụp màn hình ghi nhận chi tiết từng bước hoạt động của hệ thống, chia theo các phân hệ chính:

### Phân hệ Khởi động & Đăng nhập
| STT | Tên tệp ảnh | Nội dung minh chứng |
|:---:|---|---|
| 1 | `01_Terminal_Backend.png` | Terminal khởi động máy chủ Backend Node Express, kết nối thành công tới dịch vụ Oracle Database (`localhost:3000`). |
| 2 | `02_Terminal_Frontend.png` | Terminal khởi động máy chủ Frontend Vite React trên cổng `localhost:5173`. |
| 3 | `03_Trang_Login.png` | Giao diện trang Đăng nhập hệ thống (Thủ thư thực hiện đăng nhập bằng tài khoản `admin / 123456`). |

### Phân hệ Dashboard Tổng quan
| STT | Tên tệp ảnh | Nội dung minh chứng |
|:---:|---|---|
| 4 | `04_Dashboard_Metrics.png` | Bảng điều khiển trung tâm (Dashboard) với các thông số thống kê thời gian thực lấy trực tiếp từ các hàm (Stored Functions) trên Oracle (Tổng đầu sách, Độc giả, Phiếu đang mượn, Phiếu quá hạn, Tổng tiền phạt). |
| 5 | `04b_Dashboard_Table_Sach.png` | Bảng chi tiết danh mục sách và số lượng tồn kho thực tế của từng đầu sách. |

### Nghiệp vụ Thủ thư (B1 - B6)
Mỗi nghiệp vụ bao gồm kịch bản Thành công (Success) và Lỗi ràng buộc hệ thống (Error) khi dữ liệu đầu vào không hợp lệ:

| Nghiệp vụ | Tên tệp minh chứng | Ý nghĩa / Ràng buộc được kiểm chứng |
|---|---|---|
| **B1. Cấp thẻ Độc giả** | `B1_Cap_The_Doc_Gia_Success.png`<br>`B1_Cap_The_Doc_Gia_Error_Trung.png` | - Thành công: Thêm mới độc giả, mã độc giả được sinh tự động thông qua trigger.<br>- Thất bại: Trùng tên tài khoản hoặc vi phạm ràng buộc dữ liệu. |
| **B2. Lập Phiếu Mượn** | `B2_Lap_Phieu_Muon_Success.png`<br>`B2_Lap_Phieu_Muon_Error_Khong_Ton_Tai.png` | - Thành công: Khởi tạo phiếu mượn mới.<br>- Thất bại: Độc giả hoặc nhân viên không tồn tại trong hệ thống. |
| **B3. Thêm Sách Mượn** | `B3_Them_Sach_Success.png`<br>`B3_Them_Sach_Error_Phieu_Khong_Ton_Tai.png` | - Thành công: Thêm sách vào phiếu mượn, **Trigger tự động trừ kho** tương ứng.<br>- Thất bại: Phiếu mượn không tồn tại hoặc vượt quá giới hạn mượn. |
| **B4. Trả Sách** | `B4_Nhan_Tra_Sach_Success.png`<br>`B4_Nhan_Tra_Sach_Error_Phieu_Khong_Ton_Tai.png` | - Thành công: Ghi nhận trả sách, **Hoàn kho sách**, tự động **tính tiền phạt quá hạn** nếu quá ngày hẹn trả.<br>- Thất bại: Mã phiếu mượn nhập vào không chính xác. |
| **B5. Nhập Sách Mới** | `B5_Nhap_Sach_Success.png`<br>`B5_Nhap_Sach_Error_NCC_Khong_Ton_Tai.png` | - Thành công: Lập hóa đơn nhập sách từ nhà cung cấp, **Trigger tự động cộng kho**.<br>- Thất bại: Nhà cung cấp không thuộc danh mục quản lý. |
| **B6. Thanh lý Sách** | `B6_Thanh_Ly_Sach_Success.png`<br>`B6_Thanh_Ly_Sach_Error_Qua_So_Luong.png` | - Thành công: Thanh lý sách cũ/hỏng, giảm tổng số lượng sách trong kho tương ứng.<br>- Thất bại: Số lượng thanh lý lớn hơn số lượng sách đang có trong kho. |

### Cấu trúc Cơ sở dữ liệu & Báo cáo
| STT | Tên tệp ảnh | Nội dung minh chứng |
|:---:|---|---|
| 21 | `13_Code_SP_ForUpdate.png` | Đoạn mã nguồn của stored procedure `SP_THEM_CT_PHIEUMUON` có sử dụng cấu trúc khóa chọn lọc **`SELECT ... FOR UPDATE`** để khóa dòng bản ghi kho sách, ngăn ngừa xung đột Lost Update. |
| 22 | `14_Report_Queries_Result.png` | Kết quả thực thi các truy vấn báo cáo thống kê phức tạp (Top sách mượn nhiều nhất, thống kê tiền phạt) trên Oracle SQL Developer. |
| 23 | `15_Sodo_ERD.png` | Sơ đồ quan hệ thực thể (ERD) chi tiết của cơ sở dữ liệu gồm 17 bảng liên kết. |

---

## 3. Thực nghiệm và Nhật ký Đồng thời (Concurrency)

Nhật ký thực thi tranh chấp đồng thời được lưu trữ tự động tại tệp: `demo_proofs/CONCURRENCY_TEST_LOGS.md`.

Hệ thống đã được kiểm chứng qua 4 kịch bản tranh chấp dữ liệu điển hình trên Oracle 21c:

1. **Lost Update (C1 - Mất dữ liệu cập nhật):**
   - *Tệp ảnh minh chứng:* `C1_Lost_Update_Waiting.png`
   - *Chi tiết:* Khi hai giao tác cố gắng thay đổi số lượng sách `S000001` cùng một lúc. Nhờ câu lệnh `FOR UPDATE`, phiên giao tác thứ hai bị khóa hàng đợi (chế độ Loading chờ đợi) cho đến khi phiên thứ nhất hoàn thành lệnh `COMMIT`, đảm bảo tính toàn vẹn tồn kho.
2. **Dirty Read (C2 - Đọc dữ liệu rác):**
   - *Tệp ảnh minh chứng:* `C2_Dirty_Read_NoCommit.png`
   - *Chi tiết:* Giao tác 1 sửa đổi số lượng sách nhưng chưa `COMMIT`. Giao tác 2 đọc dữ liệu cùng thời điểm đó. Oracle sử dụng cơ chế MVCC (Multi-Version Concurrency Control) mức cô lập mặc định `READ COMMITTED`, giúp Giao tác 2 chỉ đọc được giá trị cũ trước khi sửa, ngăn chặn hoàn toàn hiện tượng đọc rác.
3. **Phantom Read (C3 - Đọc bóng ma):**
   - *Tệp ảnh minh chứng:* `C3_Phantom_Read_Occurred.png` & `C3_Phantom_Read_Fixed.png`
   - *Chi tiết:* Minh chứng sự xuất hiện của bản ghi bóng ma khi thống kê số phiếu quá hạn ở mức `READ COMMITTED`, và cách khắc phục triệt để bằng việc chuyển sang mức cô lập giao tác `SERIALIZABLE` trên Oracle.
4. **Deadlock (C4 - Khóa chết):**
   - *Tệp ảnh minh chứng:* `C4_Deadlock_Error.png`
   - *Chi tiết:* Hai phiên giao tác giữ khóa chéo nhau. Sau 3 giây, Oracle phát hiện khóa chết và lập tức hủy bỏ giao tác của một phiên kèm mã lỗi `ORA-00060: deadlock detected while waiting for resource` để giải phóng hệ thống.

---
*Chúc buổi báo cáo đồ án thành công tốt đẹp!*
