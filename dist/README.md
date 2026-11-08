# HƯỚNG DẪN TỰ PORT WEB LÊN INTERNET (3 CÁCH DỄ NHẤT)

Ứng dụng web **Introduction to English Linguistics 1** được thiết kế dưới dạng **Single Page Application (SPA) độc lập 100%**: toàn bộ giao diện, dữ liệu 42 câu hỏi thi thử, flashcards, IPA và từ điển đều đã tích hợp đầy đủ trong file duy nhất `index.html`. Bạn có thể triển khai lên web theo bất kỳ cách nào dưới đây:

---

## ⚡ CÁCH 1: PUSH LÊN GITHUB BẰNG GIT TERMINAL (Khuyên dùng)
Tôi đã chuẩn bị sẵn toàn bộ kho Git tại thư mục này (đã `commit`, đã cấu hình remote `origin` trỏ về `https://github.com/longbtl07/ling1.git`).

Bạn chỉ cần mở **PowerShell** hoặc **Terminal** tại thư mục `F:\ling1` và chạy đúng 1 câu lệnh sau:

```bash
git push -u origin main
```

*(Nếu máy tính yêu cầu đăng nhập, màn hình đăng nhập của GitHub / Git Credential Manager sẽ tự động bật lên trên trình duyệt để bạn cấp quyền).*

### 👉 Bật Web Miễn Phí (GitHub Pages) sau khi Push:
1. Mở trình duyệt vào repo: **https://github.com/longbtl07/ling1**
2. Bấm vào tab **Settings** (ở trên cùng bên phải) ➔ chọn menu **Pages** (cột bên trái).
3. Tại mục **Build and deployment** > **Source**, chọn **Deploy from a branch**.
4. Tại mục **Branch**, chọn nhánh **`main`** và thư mục **`/ (root)`** ➔ Bấm **Save**.
5. Sau 1 phút, web của bạn sẽ hoạt động trực tiếp tại địa chỉ:
   **https://longbtl07.github.io/ling1/**

---

## 🌐 CÁCH 2: KÉO THẢ LÊN NETLIFY HOẶC VERCEL (Không cần dùng lệnh, có link sau 5 giây)
Nếu bạn muốn có một link web chia sẻ cho bạn bè ngay lập tức mà không cần gõ lệnh:

1. Mở trang web: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Kéo thả trực tiếp thư mục **`F:\ling1\dist`** vào giữa màn hình trang web Netlify.
3. Trang web sẽ deploy ngay lập tức và cấp cho bạn một đường link miễn phí (ví dụ: `https://ling1-revision.netlify.app`).

---

## 📁 CÁCH 3: TẢI TRỰC TIẾP LÊN GITHUB BẰNG GIAO DIỆN WEB
Nếu bạn chưa cấu hình Git trên máy:
1. Mở trình duyệt vào repo: **https://github.com/longbtl07/ling1**
2. Bấm vào dòng chữ **"uploading an existing file"** (nằm ở giữa trang repo).
3. Kéo thả file `index.html` và `README.md` tại thư mục `F:\ling1` vào cửa sổ tải lên.
4. Bấm nút **Commit changes**.
5. Sau đó vào **Settings ➔ Pages ➔ chọn branch main ➔ Save** như ở Cách 1.

---

## 📦 DANH SÁCH FILE ĐÃ XẾP SẴN:

* **File web chính thức (All-in-one):**
  * `F:\ling1\index.html` (chạy trực tiếp hoặc để ở root GitHub Pages)
  * `F:\ling1\dist\index.html` (thư mục dist chuyên dụng để kéo thả deploy lên Netlify/Vercel)
* **Gói nén ZIP:**
  * `F:\ling1\ling1_handbook.zip` (gói nén chỉ 49 KB, chứa file web sẵn sàng gửi cho bạn bè qua Zalo, Drive, Email)
* **Tài liệu hướng dẫn:**
  * `F:\ling1\README.md` (giới thiệu tổng quan và cấu trúc dự án)
  * `F:\ling1\HUONG_DAN_DEPLOY.md` (bản hướng dẫn chi tiết này)
