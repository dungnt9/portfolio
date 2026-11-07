# Storyboard: chuyến bay của UFO

Tài liệu thiết kế cho trải nghiệm cuộn trang: UFO là nhân vật dẫn đường, mỗi mục là một "chương" mà UFO khám phá. Code nằm ở `src/features/ufo/`.

## 1. Đánh giá trải nghiệm trước khi có UFO

| Điểm mạnh | Điểm yếu |
|---|---|
| Ẩn dụ "chạy chương trình" (mỗi chương mở bằng một lệnh terminal) rất hợp với dân kỹ thuật | Các mục đứng riêng lẻ: cuộn hết mục này sang mục khác mà không có sợi dây nào nối chúng |
| Quả địa cầu 3D và sơ đồ kiến trúc AWS là hai khoảnh khắc ấn tượng | Sau hero, mắt người xem không có điểm dẫn: không có lý do để tò mò mục tiếp theo |
| Nội dung thật, rõ ràng, song ngữ | Nhiều khối thẻ (card) lặp lại cùng một nhịp |

## 2. Concept: "Tàu thăm dò của dungnt"

Một con tàu thăm dò rời hành tinh nhà (quả địa cầu ở hero), bay qua từng vùng của vũ trụ nghề nghiệp. Mỗi khi tới đích, nó **chiếu tia sáng** xuống và vùng đó "thức dậy": tiêu đề sáng lên, nội dung hiện ra. Người xem không đọc một CV; họ theo chân con tàu xem nó tìm thấy gì.

Nguyên tắc thiết kế:

- **UFO luôn ở lề, không che chữ** khi dừng; chỉ bay ngang qua nội dung trong lúc chuyển cảnh.
- **Tia sáng = khoảnh khắc khám phá.** Chỉ bật khi UFO đã tới đích, nên nó có ý nghĩa thay vì là trang trí.
- **Nhịp độ xen kẽ:** cảnh hoành tráng (hero, kiến trúc cloud, skills) xen với cảnh yên tĩnh để đọc (about, experience).
- **Nhẹ:** UFO là SVG tĩnh trong một lớp chỉ chuyển động bằng `transform`, không thêm cảnh WebGL nào. Điện thoại vẫn mượt.

## 3. Storyboard từng chương

| # | Chương | Người xem thấy | UFO làm gì / ở đâu | Môi trường phản ứng | Móc tò mò sang chương sau |
|---|---|---|---|---|---|
| 0 | **Hero** | Hành tinh nhà, tên, lệnh terminal | Lao vào từ xa (góc trên phải), lượn quanh hành tinh, lơ lửng phía trên bên phải | Hành tinh phát sáng như trước | UFO chao nghiêng, như sắp rời đi |
| 1 | **About** | Chân dung nghề nghiệp | Bay ngang từ phải sang trái, dừng phía trên tiêu đề, **bật tia sáng** | Tiêu đề chương được chiếu sáng, quét một vệt sáng | Tắt tia, vọt lên phải: có thứ gì đó lớn hơn phía trước |
| 2 | **Cloud Architecture** | Hạ tầng AWS được dựng dần khi cuộn | Lơ lửng phía trên công trường 3D, **chiếu tia suốt chương**, trôi nhẹ trái sang phải như đang "triển khai" | Từng tầng hạ tầng hiện ra dưới tia sáng | Hạ tầng hoàn tất, UFO hạ thấp về bên trái |
| 3 | **Journey** | Dòng thời gian sự nghiệp | Bay chéo từ góc dưới trái lên góc trên phải, đúng hướng "đi lên" của sự nghiệp | — (cảnh chuyển động, không chiếu) | Nó đi đâu khi lên tới đỉnh? |
| 4 | **Experience** | Các vai trò tại ELCOM | **Thu nhỏ vào chiều sâu** ở giữa phía trên, như đi qua một cánh cổng | Cảnh tĩnh để đọc kỹ | UFO biến mất: người xem chờ nó xuất hiện lại |
| 5 | **Projects** | Dự án VMS/VAS, bức tường camera AI | **Lao ra từ cánh cổng**, to dần, dừng phía trên bên phải, **chiếu tia quét** | Tiêu đề sáng; tia quét khớp với ý tưởng camera AI nhận diện | Tắt tia, bay sang trái |
| 6 | **Skills** | Hệ mặt trời công nghệ | **Bay một vòng quanh** hệ mặt trời (4 điểm quanh tâm) | Tiêu đề sáng khi bắt đầu vòng bay | Vòng bay kết thúc, hạ dần xuống giữa |
| 7 | **Contact** | Lời mời liên hệ | **Hạ cánh** ở giữa phía trên, to nhất, **chiếu tia** xuống khối liên hệ | Khối liên hệ được chiếu sáng: điểm kết của hành trình | Kết thúc: "Connection established" |

## 4. Điện thoại

Không thu nhỏ bản desktop. Trên màn hình hẹp:

- UFO nhỏ hơn (khoảng 55%), **bám hai mép trái/phải xen kẽ**, ở dải trên của màn hình để không che nội dung.
- Tia sáng ngắn hơn.
- Bỏ hiệu ứng đèn viền chạy vòng (tiết kiệm năng lượng); giữ nhịp lơ lửng.
- Người dùng bật "giảm chuyển động" trong hệ điều hành: không hiển thị UFO.

## 5. Kỹ thuật

- `Ufo.tsx`: SVG (thân kim loại, vòm kính, đèn viền, vòng động cơ), quầng sáng và tia sáng là `div` dùng gradient, chỉ đổi `opacity`/`transform`.
- `UfoGuide.tsx`: đo vị trí các mục, nội suy vị trí UFO theo `scrollY` (motion `useTransform`), làm mượt bằng lò xo (`useSpring`) để có tăng tốc/giảm tốc; độ nghiêng lấy từ vận tốc ngang.
- Khi UFO dừng ở điểm có tia sáng, mục tương ứng nhận thuộc tính `data-ufo-lit`: CSS chiếu sáng tiêu đề và quét một vệt sáng.
- Điểm dừng khai báo trong `waypoints.ts`: thêm hoặc chỉnh đường bay chỉ cần sửa file này.
