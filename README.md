# Web ôn tập QTTC trong DNTM (GitHub Pages + Google Sheet)

Kiến trúc: **giao diện** (index.html, app.js, style.css, questions.json) chạy miễn phí trên **GitHub Pages**; **dữ liệu và chấm điểm** nằm ở **Google Sheet + Google Apps Script**. Đáp án chỉ nằm trong Google Sheet (tab DapAn), không có trong file web, nên sinh viên không xem được đáp án trước khi nộp.

Nội dung: 12 tuần (1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14), ngân hàng 1.959 câu (tuần 1: 30 câu trắc nghiệm; tuần 2–14: khoảng 24–30 câu trắc nghiệm + 150 câu tính toán mỗi tuần). Số liệu và tên công ty đều do chương trình tạo mới, không dùng nguyên đề trong ngân hàng đề thi.

**Cách ra đề:** mỗi lần sinh viên bấm "Làm đề mới", máy chủ bốc ngẫu nhiên đề từ ngân hàng của tuần đó: tuần 1 gồm 20 câu trắc nghiệm; các tuần còn lại gồm 5 câu trắc nghiệm + 15 câu tính toán, trong đó câu tính toán được bốc luân phiên từ nhiều dạng bài khác nhau. Mỗi câu 5 điểm, tổng 100 điểm. Mỗi sinh viên mỗi lần có đề khác nhau nên không chép bài nhau được.

**Quy tắc làm bài:** sinh viên chỉ có 1 đề đang làm tại một thời điểm; phải nộp xong mới được làm đề khác (có nút "Tiếp tục làm đề" để làm tiếp đề dở, kể cả khi đổi máy). Mỗi đề được **lưu bài tối đa 5 lần**; nếu bấm lưu thêm lần nữa thì bài **tự động chấm điểm và nộp**, không làm lại được. Đề đã nộp chỉ xem lại các câu sai/bỏ trống trong mục Lịch sử. Nếu tuần bị khóa khi sinh viên còn đề dở, đề đó tự động được nộp theo bản đã lưu gần nhất.

## Bước 1. Tạo Google Sheet dữ liệu
1. Vào https://drive.google.com → **Mới → Tải tệp lên** → chọn `docs/CSDL_QTTC_DNTM.xlsx`.
2. Bấm đúp file vừa tải lên → **Mở bằng Google Trang tính** → menu **Tệp → Lưu dưới dạng Google Trang tính**. (Dùng file Google Sheet mới, không dùng bản .xlsx.)
3. Kiểm tra có 4 tab: `SinhVien`, `CauHinh`, `BaiLam`, `DapAn` (DapAn có 1.959 dòng).

## Bước 2. Cài mã Apps Script
1. Trong Google Sheet: **Tiện ích mở rộng → Apps Script**.
2. Xóa mã mẫu, dán toàn bộ nội dung file `apps-script/Code.gs`, bấm **Lưu**.
3. (Khuyến nghị) Sửa dòng `const KEY = 'DOI-MAT-KHAU-O-DAY'` trong hàm `setAdminKey` thành mật khẩu của thầy, chọn hàm `setAdminKey` ở thanh trên → **Chạy** (cấp quyền khi được hỏi). Sau đó xóa mật khẩu khỏi mã nếu muốn. Khi đăng nhập tài khoản GV_admin thầy sẽ nhập mật khẩu này.
4. Chọn hàm `setup` → **Chạy** → cấp quyền (Xem lại quyền → chọn tài khoản → Nâng cao → Đi tới… → Cho phép).

## Bước 3. Triển khai thành Web app
1. Bấm **Triển khai → Tùy chọn triển khai mới** → biểu tượng bánh răng → **Ứng dụng web**.
2. *Thực thi dưới tên*: **Tôi**. *Người có quyền truy cập*: **Bất kỳ ai**. Bấm **Triển khai**.
3. Sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).
4. Mỗi lần sửa Code.gs sau này: **Triển khai → Quản lý bản triển khai → Chỉnh sửa → Phiên bản mới → Triển khai** (URL giữ nguyên).

## Bước 4. Đưa web lên GitHub Pages
1. Mở file `config.js`, thay `DAN-URL-WEB-APP-O-DAY` bằng URL ở bước 3.
2. Tạo tài khoản GitHub → **New repository** (ví dụ `on-tap-qttc`, để Public) .
3. **Add file → Upload files**: tải lên `index.html`, `app.js`, `style.css`, `config.js`, `questions.json`, `.nojekyll` (không cần tải thư mục `apps-script` và `docs`; có thể tải để lưu trữ nhưng xlsx chứa đáp án nên **không** đưa lên repo Public). Bấm **Commit changes**.
4. **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, thư mục `/ (root)` → **Save**.
5. Sau 1–2 phút web có địa chỉ `https://<tên-github>.github.io/on-tap-qttc/` – gửi link này cho sinh viên.

## Cách dùng
- **Sinh viên**: nhập họ tên, MSV, chọn lớp (DHTM18A4HN, DHTM18A1CL, DHTM18A1HN, DHTM18A3HN, DHLQ17A2HN) → chọn tuần → "Làm đề mới (ngẫu nhiên)". Đồng hồ chạy từ 0, không giới hạn, và được cộng dồn khi làm tiếp. Lần đăng nhập đầu tiên gắn MSV với họ tên + lớp; nhập sai ở lần sau sẽ bị từ chối (sửa trực tiếp tab `SinhVien` nếu cần).
- **Lịch sử làm bài**: điểm trung bình, % đúng, từng lượt làm, các câu làm sai kèm đáp án và lời giải.
- **Bảng xếp hạng** theo tuần, trong từng lớp: điểm tuần = điểm trung bình các đề đã nộp trong tuần; bằng điểm thì ai làm ít đề hơn xếp trên, nếu vẫn bằng thì ai nộp sớm hơn.
- **Giảng viên** (Họ tên: Vũ Nguyễn Tuấn Hùng, MSV 1101200028102001, Lớp GV_admin): tài khoản GV_admin cũng được làm bài thử với **số lần lưu không giới hạn** (không bị khóa theo lịch mở/khóa, và không tính vào bảng xếp hạng các lớp); tab **Quản trị** đặt Mở/Khóa và thời điểm Từ–Đến cho từng tuần (hoặc sửa tab `CauHinh` trực tiếp); xem bảng xếp hạng của từng lớp. Mặc định mọi tuần đều mở, không giới hạn thời gian.
- Toàn bộ kết quả nằm ở tab `BaiLam` (mỗi dòng là một đề của một sinh viên; TrangThai = DANG_LAM hoặc DA_NOP) (có thể lọc, xuất Excel).

## Lưu ý
- Sinh viên chỉ xác thực bằng họ tên + MSV + lớp (không mật khẩu), phù hợp cho ôn tập, không dùng thi chính thức.
- Phiên đăng nhập 6 giờ; hết hạn sẽ yêu cầu đăng nhập lại (bài đang làm được lưu nháp trên máy).
- Đáp số tính toán được chấp nhận sai số làm tròn nhỏ (±0,3% hoặc ±0,015); nhập dấu phẩy hoặc chấm đều được.
- Giới hạn của Apps Script miễn phí: khoảng 20.000 lượt gọi/ngày, đủ cho vài trăm sinh viên.
- Muốn thêm/đổi câu hỏi: nhờ trợ lý sinh lại `questions.json` và tab `DapAn` (hai nơi này phải khớp nhau).
