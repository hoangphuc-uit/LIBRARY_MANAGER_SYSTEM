# HƯỚNG DẪN QUY TRÌNH DEMO HỆ THỐNG QUẢN LÝ THƯ VIỆN (HQTCSDL)

Tài liệu này hướng dẫn chi tiết quy trình vận hành và trình bày demo đồ án môn **Hệ Quản trị Cơ sở Dữ liệu (Lớp IS210.P23)**.

* **Giảng viên hướng dẫn:** Cô Đỗ Thị Minh Phụng
* **Nhóm sinh viên thực hiện:**
  1. **Nguyễn Trọng Khôi** - MSSV: `23520783` (Vai trò: Admin / Quản trị hệ thống)
  2. **Trần Hoàng Phúc** - MSSV: `24521398` (Vai trò: Thủ thư trực quầy)
  3. **Mai Anh Tuấn** - MSSV: `24521929` (Vai trò: Độc giả 01)
  4. **Nguyễn Minh Đức** - MSSV: `24520319` (Vai trò: Độc giả 02)

---

## PHẦN 1: KHỞI ĐỘNG HỆ THỐNG TRÊN VS CODE (TERMINAL)

1. Mở thư mục dự án `library_oracle_hqtcsdl` bằng VS Code.
2. Mở **3 cửa sổ Terminal** trong VS Code (hoặc chia pane) để chạy song song các thành phần:

### Terminal 1: Khởi tạo và Reset Cơ sở dữ liệu Oracle
* Chuyển vào thư mục backend:
  ```bash
  cd BackEnd
  ```
* Chạy lệnh reset database để làm sạch dữ liệu cũ và biên dịch toàn bộ Triggers/Stored Procedures/Functions:
  ```bash
  node reset_database.js
  ```
* **Kết quả kỳ vọng:** Dòng chữ `Database reset complete and committed successfully!` hiện ra ở cuối màn hình mà không gặp bất kỳ thông báo lỗi nào.

### Terminal 2: Chạy Backend Server
* Chuyển vào thư mục backend:
  ```bash
  cd BackEnd
  ```
* Khởi động server bằng nodemon:
  ```bash
  npm start
  ```
* **Kết quả kỳ vọng:** Hiển thị thông báo `Web server listening on localhost:3000` và `Startup complete`.

### Terminal 3: Chạy Frontend Client
* Chuyển vào thư mục frontend:
  ```bash
  cd FrontEnd
  ```
* Khởi động ứng dụng React + Vite:
  ```bash
  npm run dev
  ```
* **Kết quả kỳ vọng:** Trình duyệt sẵn sàng tại địa chỉ `http://localhost:5173/` hoặc `http://127.0.0.1:5173/`.

---

## PHẦN 2: KỊCH BẢN VẬN HÀNH DEMO TRÊN GIAO DIỆN (WEB UI)

Mở trình duyệt web và truy cập địa chỉ: `http://localhost:5173`

### BƯỚC 1: Đăng nhập vào hệ thống
1. Giao diện hiển thị form Đăng nhập (`/login`).
2. Nhập thông tin tài khoản của Thủ thư:
   * **Tên đăng nhập:** `thuthu01`
   * **Mật khẩu:** `tt123`
3. Nhấp nút **"Đăng Nhập"**.
4. **Kết quả:** Hệ thống xác thực qua stored procedure `SP_XACTHUC_DANGNHAP` và chuyển hướng đến trang Tổng quan (`/hqtcsdl`).
5. **Thuyết minh:** Giới thiệu các số liệu thống kê trực quan hiển thị tại đây được lấy thời gian thực (Real-time) từ Oracle thông qua các truy vấn `SELECT COUNT(*)` (Sách, Độc giả, Đang mượn, Quá hạn, Tiền phạt chưa thu).

---

### BƯỚC 2: Thực hiện 6 Nghiệp vụ chính của Thủ thư
Nhấp vào mục **"Giao dịch"** trên thanh menu bên trái (truy cập `/hqtcsdl/actions`). Tiến hành demo lần lượt theo các tab nghiệp vụ:

#### Nghiệp vụ 1: Cấp thẻ độc giả (Tab "Cấp thẻ độc giả")
* **Mục tiêu:** Chứng minh stored procedure `SP_DANGKY_DOCGIA` và trigger kiểm tra trùng tài khoản.
* **Thao tác Demo Thành Công:**
  1. Nhập thông tin của thành viên nhóm **Mai Anh Tuấn**:
     * **Tên đăng nhập:** `tuanmaianh`
     * **Mật khẩu:** `123456`
     * **Họ tên:** `Mai Anh Tuấn`
     * **Email:** `tuanmaianh@student.edu.vn`
     * **Số điện thoại:** `0911000222`
     * **Địa chỉ:** `Thủ Đức, TP.HCM`
     * **Ngày hết hạn:** Chọn một ngày ở năm sau (ví dụ: `15/06/2027`).
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Hiển thị thông báo thành công màu xanh lá: `Đăng ký độc giả thành công.`
* **Thao tác Demo Lỗi (Kiểm tra Trigger `TRG_CHECK_TRUNG_TENDANGNHAP`):**
  1. Để nguyên thông tin vừa nhập trên form, bấm nút **"Xác Nhận"** lần nữa.
  2. **Kết quả:** Hệ thống lập tức hiển thị thông báo lỗi màu đỏ từ database:
     `Lỗi: Tên đăng nhập này đã tồn tại trên hệ thống!`

#### Nghiệp vụ 2: Lập phiếu mượn (Tab "Lập phiếu mượn")
* **Mục tiêu:** Tạo đầu phiếu mượn mới và chứng minh trigger chặn thẻ độc giả hết hạn/bị khóa.
* **Thao tác Demo Thành Công:**
  1. Điền thông tin:
     * **Mã độc giả:** `DG000003` (Mã độc giả của **Mai Anh Tuấn** vừa tạo ở bước trên).
     * **Mã nhân viên:** `NV000001` (Họ tên: **Trần Hoàng Phúc**).
     * **Ngày hẹn trả:** Chọn một ngày trong tương lai (ví dụ: `15/06/2026`).
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Hiển thị thông báo màu xanh lá: `Tạo phiếu mượn thành công. Mã phiếu: PM000003` (Ghi nhớ mã phiếu này).
* **Thao tác Demo Lỗi (Kiểm tra Trigger `TRG_CHECK_HANDOCGIA`):**
  1. Nhập **Mã độc giả** không tồn tại: `DG999999`.
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Hệ thống hiển thị thông báo lỗi màu đỏ:
     `Dữ liệu tham chiếu không tồn tại. Vui lòng kiểm tra lại mã độc giả, nhân viên, sách hoặc nhà cung cấp.` (Bắt lỗi khóa ngoại FK).

#### Nghiệp vụ 3: Thêm sách vào phiếu (Tab "Thêm sách vào phiếu")
* **Mục tiêu:** Thêm chi tiết sách cần mượn, tự động kiểm tra và trừ tồn kho.
* **Thao tác Demo Thành Công:**
  1. Điền thông tin:
     * **Mã phiếu mượn:** `PM000003` (Mã phiếu vừa tạo ở Bước 2).
     * **Mã sách:** `S000002` (Sách Lập trình).
     * **Số lượng:** `1`.
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Thông báo thành công: `Thêm sách vào phiếu mượn thành công.` (Hệ thống chạy trigger `TRG_TRU_TONKHO_MUON` để trừ tồn kho của sách S000002 đi 1 cuốn).
* **Thao tác Demo Lỗi (Kiểm tra Trigger `TRG_CHECK_TONKHO_MUON`):**
  1. Nhập **Mã sách:** `S000002`.
  2. Nhập **Số lượng:** `9999` (Vượt quá tồn kho thực tế).
  3. Bấm nút **"Xác Nhận"**.
  4. **Kết quả:** Hệ thống hiển thị thông báo lỗi:
     `Không đủ sách trong kho. Sách S000002 chỉ còn X cuốn.`

#### Nghiệp vụ 4: Nhận trả sách (Tab "Nhận trả sách")
* **Mục tiêu:** Hoàn kho sách, tự động tính tiền phạt quá hạn và ghi nhận lỗi hư hỏng/mất sách.
* **Thao tác Demo Thành Công:**
  1. Điền thông tin:
     * **Mã phiếu mượn:** `PM000001` (Phiếu mượn quá hạn mẫu của Lê Hoàng An).
     * **Mã nhân viên:** `NV000001` (**Trần Hoàng Phúc**).
     * **Tình trạng sách khi trả:** Chọn `Bình thường`.
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Thông báo thành công: `Trả sách thành công.` (Tiền phạt được tự động tính bằng hàm `FN_TINH_TIEN_PHAT` với đơn giá `1.000 VND / ngày quá hạn` và hiển thị trên giao diện).
* **Thao tác Demo Lỗi (Chặn trả 2 lần):**
  1. Tiếp tục nhập lại mã phiếu `PM000001` vừa trả, bấm **"Xác Nhận"**.
  2. **Kết quả:** Hệ thống báo lỗi: `Phiếu mượn này đã được trả trước đó.`

#### Nghiệp vụ 5: Nhập sách mới (Tab "Nhập sách")
* **Mục tiêu:** Nhập sách từ nhà cung cấp và cộng dồn tồn kho.
* **Thao tác Demo Thành Công:**
  1. Điền thông tin:
     * **Mã nhà cung cấp:** `NCC000001`.
     * **Mã nhân viên:** `NV000002`.
     * **Mã sách:** `S000003` (Sách Cơ sở dữ liệu).
     * **Số lượng:** `10`.
     * **Đơn giá:** `120000`.
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Thông báo thành công: `Lập phiếu nhập sách thành công.` (Trigger `TRG_CAPNHAT_KHO_NHAP` tự động tăng số lượng tồn kho khả dụng của sách S000003 lên thêm 10 cuốn).

#### Nghiệp vụ 6: Thanh lý sách cũ/hỏng (Tab "Thanh lý sách")
* **Mục tiêu:** Tiêu hủy sách không còn sử dụng được và giảm tồn kho.
* **Thao tác Demo Thành Công:**
  1. Điền thông tin:
     * **Mã sách:** `S000003`.
     * **Mã nhân viên:** `NV000001` (**Trần Hoàng Phúc**).
     * **Số lượng:** `2`.
     * **Lý do:** `Sách cũ nát, rách trang`.
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Thông báo thành công: `Lập phiếu thanh lý sách thành công.`
* **Thao tác Demo Lỗi (Kiểm tra số lượng khả dụng):**
  1. Nhập **Số lượng:** `999999`.
  2. Bấm nút **"Xác Nhận"**.
  3. **Kết quả:** Hệ thống hiển thị thông báo lỗi màu đỏ từ stored procedure:
     `Số lượng thanh lý vượt quá số lượng khả dụng.`

---

## BƯỚC 3: Đối chiếu số liệu thay đổi trên Dashboard
1. Nhấp quay lại trang **"Tổng quan"** trên thanh menu bên trái.
2. Nhấp nút **"Tải lại dữ liệu"** trên đầu trang.
3. Chỉ ra sự thay đổi số liệu:
   * **Số lượng độc giả:** Tăng lên (Do vừa đăng ký mới thành viên **Mai Anh Tuấn**).
   * **Tổng số sách và số lượng tồn khả dụng:** Thay đổi tương ứng tại các dòng trong bảng danh mục sách (Do vừa cho mượn, trả, nhập thêm và thanh lý).
