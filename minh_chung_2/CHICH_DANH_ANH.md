# Chú Thích Chi Tiết Ảnh Chụp Màn Hình Minh Chứng Nghiệp Vụ (minh_chung_2)

Tài liệu này thuyết minh chi tiết cho **12 ảnh chụp màn hình** lưu trữ trong thư mục [minh_chung_2/](file:///c:/Users/Nguyen%20Trong%20Khoi/Downloads/HQTSCDL_DA/library_oracle_hqtcsdl/minh_chung_2), được chụp từ kịch bản chạy thử nghiệm chậm (thời lượng video trên 5 phút) bao gồm cả thao tác đúng (Success) và thao tác lỗi ràng buộc (Error) từ B1 đến B6.

---

## B1. Cấp Thẻ Độc Giả

### 1. Ảnh `B1_Cap_The_Doc_Gia_Success.png` (Thao tác đúng)
- **Tên nghiệp vụ:** Cấp thẻ độc giả mới.
- **Dữ liệu nhập vào:**
  - Tên đăng nhập: `docgia_test01`
  - Mật khẩu: `123456`
  - Họ tên: `Nguyen Van Kiem Thu`
  - Email: `test01@student.edu.vn`
  - Số điện thoại: `0901999888`
  - Địa chỉ: `Quan Thu Duc, TP.HCM`
  - Ngày hết hạn: `15/05/2027`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu xanh thông báo thành công: **"Thao tác thành công"**. Tài khoản và thông tin độc giả được ghi nhận vào cơ sở dữ liệu.

### 2. Ảnh `B1_Cap_The_Doc_Gia_Error_Trung.png` (Lỗi trùng lắp)
- **Tên nghiệp vụ:** Cấp thẻ độc giả lỗi trùng tên tài khoản.
- **Dữ liệu nhập vào:**
  - Tên đăng nhập: `docgia_test01` (Trùng với tên tài khoản vừa tạo ở bước trên)
  - Mật khẩu: `123456`
  - Họ tên: `Nguyen Van Trung`
  - Email: `trung@student.edu.vn`
  - Số điện thoại: `0901999888`
  - Địa chỉ: `Quan Thu Duc, TP.HCM`
  - Ngày hết hạn: `15/05/2027`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu đỏ thông báo lỗi: **"Tên đăng nhập đã tồn tại trong hệ thống."** (Trigger chặn chèn trùng tên đăng nhập).

---

## B2. Lập Phiếu Mượn

### 3. Ảnh `B2_Lap_Phieu_Muon_Success.png` (Thao tác đúng)
- **Tên nghiệp vụ:** Tạo phiếu mượn sách mới cho độc giả.
- **Dữ liệu nhập vào:**
  - Mã độc giả: `DG000002` (Độc giả Phạm Gia Hân đã có sẵn trong DB)
  - Mã nhân viên: `NV000001` (Thủ thư Nguyễn Minh Thư xử lý)
  - Ngày hẹn trả: `29/05/2026`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu xanh thông báo thành công kèm mã phiếu mới được sinh tự động: **"Thao tác thành công (Mã phiếu: PMXXXXXX)"** (Ví dụ: `PM000002`).

### 4. Ảnh `B2_Lap_Phieu_Muon_Error_Khong_Ton_Tai.png` (Lỗi khóa ngoại)
- **Tên nghiệp vụ:** Lập phiếu mượn cho độc giả không tồn tại.
- **Dữ liệu nhập vào:**
  - Mã độc giả: `DG999999` (Mã độc giả không tồn tại trong hệ thống)
  - Mã nhân viên: `NV000001`
  - Ngày hẹn trả: `29/05/2026`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu đỏ thông báo lỗi từ Procedure Oracle: **"Mã độc giả không tồn tại hoặc thẻ đã hết hạn."**

---

## B3. Thêm Sách Vào Phiếu

### 5. Ảnh `B3_Them_Sach_Success.png` (Thao tác đúng)
- **Tên nghiệp vụ:** Đăng ký mượn cuốn sách cụ thể vào phiếu mượn.
- **Dữ liệu nhập vào:**
  - Mã phiếu mượn: `PMXXXXXX` (Nhập mã phiếu vừa sinh ở bước B2)
  - Mã sách: `S000002` (Cuốn "Thiết kế hệ thống thư viện")
  - Số lượng: `2`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu xanh thông báo thành công: **"Thao tác thành công"**. Tồn kho của cuốn sách `S000002` tự động giảm đi 2 cuốn.

### 6. Ảnh `B3_Them_Sach_Error_Phieu_Khong_Ton_Tai.png` (Lỗi khóa ngoại)
- **Tên nghiệp vụ:** Thêm sách vào một mã phiếu mượn ảo.
- **Dữ liệu nhập vào:**
  - Mã phiếu mượn: `PM999999` (Mã phiếu không tồn tại trong DB)
  - Mã sách: `S000002`
  - Số lượng: `2`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu đỏ thông báo lỗi từ Database: **"Mã phiếu mượn không tồn tại hoặc đã được trả."**

---

## B4. Nhận Trả Sách

### 7. Ảnh `B4_Nhan_Tra_Sach_Success.png` (Thao tác đúng)
- **Tên nghiệp vụ:** Trả toàn bộ sách trong phiếu mượn.
- **Dữ liệu nhập vào:**
  - Mã phiếu mượn: `PM000001` (Phiếu mượn mở có sẵn trong dữ liệu mẫu)
  - Mã nhân viên: `NV000001`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu xanh thông báo thành công: **"Thao tác thành công"**. Số lượng tồn kho của các cuốn sách nằm trong phiếu `PM000001` tự động được hoàn lại kho.

### 8. Ảnh `B4_Nhan_Tra_Sach_Error_Phieu_Khong_Ton_Tai.png` (Lỗi tham chiếu)
- **Tên nghiệp vụ:** Nhận trả cho phiếu mượn không tồn tại.
- **Dữ liệu nhập vào:**
  - Mã phiếu mượn: `PM999999` (Không tồn tại)
  - Mã nhân viên: `NV000001`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu đỏ thông báo lỗi: **"Mã phiếu mượn không tồn tại."**

---

## B5. Nhập Sách

### 9. Ảnh `B5_Nhap_Sach_Success.png` (Thao tác đúng)
- **Tên nghiệp vụ:** Nhập thêm sách mới từ nhà cung cấp vào kho.
- **Dữ liệu nhập vào:**
  - Mã nhà cung cấp: `NCC000001` (Công ty Sách Giáo dục A)
  - Mã nhân viên: `NV000001`
  - Mã sách: `S000003` (Cuốn "Lập trình Web với Node.js")
  - Số lượng: `5`
  - Đơn giá: `95000`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu xanh thông báo thành công: **"Thao tác thành công"**. Tồn kho của cuốn sách `S000003` tự động tăng thêm 5 cuốn.

### 10. Ảnh `B5_Nhap_Sach_Error_NCC_Khong_Ton_Tai.png` (Lỗi nhà cung cấp)
- **Tên nghiệp vụ:** Nhập sách từ nhà cung cấp không có trong danh mục.
- **Dữ liệu nhập vào:**
  - Mã nhà cung cấp: `NCC999999` (Không tồn tại)
  - Mã nhân viên: `NV000001`
  - Mã sách: `S000003`
  - Số lượng: `5`
  - Đơn giá: `95000`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu đỏ thông báo lỗi: **"Mã nhà cung cấp không tồn tại."**

---

## B6. Thanh Lý Sách

### 11. Ảnh `B6_Thanh_Ly_Sach_Success.png` (Thao tác đúng)
- **Tên nghiệp vụ:** Hủy sách cũ/hỏng ra khỏi kho lưu hành.
- **Dữ liệu nhập vào:**
  - Mã sách: `S000003`
  - Mã nhân viên: `NV000001`
  - Số lượng: `1`
  - Lý do thanh lý: `Sach bi rach nat`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu xanh thông báo thành công: **"Thao tác thành công"**. Tồn kho cuốn `S000003` giảm đi 1.

### 12. Ảnh `B6_Thanh_Ly_Sach_Error_Qua_So_Luong.png` (Lỗi nghiệp vụ/ràng buộc check)
- **Tên nghiệp vụ:** Thanh lý số lượng sách vượt mức tồn kho hiện có.
- **Dữ liệu nhập vào:**
  - Mã sách: `S000003`
  - Mã nhân viên: `NV000001`
  - Số lượng: `999999` (Vượt quá số lượng tồn kho thực tế)
  - Lý do thanh lý: `Thanh ly vuot ton kho`
- **Hành động:** Bấm nút **Xác nhận**.
- **Kết quả hiển thị:** Alert màu đỏ thông báo lỗi ràng buộc: **"Số lượng sách thanh lý vượt quá số lượng tồn kho hiện tại."**
