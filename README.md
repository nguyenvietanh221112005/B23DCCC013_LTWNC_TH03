Class Deadline Hub
Cổng web deadline của lớp, viết bằng Next.js 15 (App Router), Auth.js (NextAuth v5) và TypeScript.

Ai cũng xem được deadline công khai; link chia sẻ có ảnh xem trước (Open Graph) và Google lập chỉ mục được.
Sinh viên đăng nhập để đánh dấu deadline đã xong.
Lớp trưởng (admin) thêm và xoá deadline.
Dữ liệu lưu trong các file JSON phía server (data/): 4 môn học, 12 deadline.
Bản deploy: https://b23-dccc-013-ltwnc-th-03.vercel.app

Email	Mật khẩu	Vai trò
admin@ptit.edu.vn	admin123	admin
sv@ptit.edu.vn	sv123456	user
Mục lục :

Cách chạy
Ảnh kết quả npm run build và lý do chọn chiến lược cho từng route
Điểm Lighthouse
Ảnh view-source của /deadlines/1
Trả lời 2 câu hỏi
Phụ lục: đối chiếu yêu cầu, phân quyền, SEO, màn hình, điểm cộng
1. Cách chạy
Yêu cầu: Node.js ≥ 18.18 (đã thử với Node 24) và npm.

# 1. Cài thư viện
npm install

# 2. Tạo file biến môi trường
cp .env.example .env.local        # PowerShell: Copy-Item .env.example .env.local
npx auth secret                   # sinh AUTH_SECRET (hoặc: openssl rand -base64 32), dán vào .env.local

# 3a. Chạy chế độ phát triển
npm run dev                       # http://localhost:3000

# 3b. Hoặc chạy bản production (dùng để đo Lighthouse)
npm run build
npm start                         # http://localhost:3000

Biến môi trường trong .env.local:

Biến	Ý nghĩa
AUTH_SECRET	Khoá ký/mã hoá JWT của Auth.js (bắt buộc)
AUTH_TRUST_HOST=true	Cho phép next start ở localhost
NEXT_PUBLIC_SITE_URL	URL công khai, dùng cho canonical, sitemap, JSON-LD, ảnh OG
AUTH_GITHUB_ID, AUTH_GITHUB_SECRET	bật nút "Đăng nhập với GitHub"
Ghi chú:

Các file trong data/ chính là "cơ sở dữ liệu". deadlines.json đổi khi admin thêm/xoá, progress.json đổi khi sinh viên đánh dấu đã xong. Muốn quay về dữ liệu ban đầu thì khôi phục hai file này (12 deadline; progress.json ban đầu là {"2": [4, 7]}).
Thêm tài khoản: npm run hash -- <mật-khẩu> để lấy bcrypt hash, rồi thêm vào data/users.json.
Xem thử trang error.tsx (nút "Thử lại"): SIMULATE_ERROR=deadlines npm run dev (PowerShell: $env:SIMULATE_ERROR="deadlines"; npm run dev) rồi mở /deadlines.
2. Ảnh kết quả npm run build và lý do chọn chiến lược cho từng route
Kết quả npm run build (1/2)

Kết quả npm run build (2/2)

Ký hiệu: ○ tĩnh (SSG) · ● SSG có generateStaticParams · cột Revalidate = 1m là ISR · ƒ render động (SSR).

Route	Ai xem	Chiến lược (đúng đề)	Cách cài đặt	Vì sao chọn
/	Mọi người	SSG ○	dynamic = "force-static"	Trang giới thiệu, nội dung giống nhau với mọi người và ít đổi → sinh HTML một lần lúc build, phục vụ từ CDN nhanh nhất. Con số "Còn X ngày" được tính ở client nên HTML tĩnh không bị cũ. Khi admin thêm/xoá, Server Action gọi revalidatePath("/") để mục "Sắp đến hạn" luôn đúng.
/subjects/[slug]	Mọi người	SSG ●	generateStaticParams() trả 4 slug	Chỉ có 4 môn, biết trước lúc build nên sinh sẵn cả 4 trang. Slug lạ → notFound() (404). Trang cũng được revalidatePath khi deadline của môn đó thay đổi.
/deadlines	Mọi người	ISR 60 giây	export const revalidate = 60	Danh sách thay đổi nhưng không cần tức thì. Trang vẫn tĩnh (nhanh, chịu tải tốt); tối đa 60 giây sau khi dữ liệu đổi, request kế tiếp kích hoạt tái tạo ở nền (stale-while-revalidate). Bộ lọc chạy ở client trên dữ liệu đó.
/deadlines/[id]	Mọi người	ISR làm mới ngay ●	generateStaticParams + revalidate = false + dynamicParams = true; Server Action gọi revalidatePath("/deadlines/" + id)	Trang được chia sẻ và Google lập chỉ mục nên cần HTML tĩnh có đủ metadata. Nội dung chỉ đổi khi admin thêm/xoá nên không cần làm mới theo thời gian mà làm mới ngay đúng lúc đó: xoá xong URL trả 404 ngay, deadline mới được render ở lần truy cập đầu rồi cache (chi tiết ở câu hỏi 1).
/dashboard	Đã đăng nhập	SSR ƒ	đọc auth() (cookie) + dynamic = "force-dynamic"	Nội dung riêng cho từng người (tiến độ của tôi) và đổi sau mỗi lần tích ô → phải render theo từng request, không được cache dùng chung.
/admin	Chỉ admin	SSR ƒ	requirePermission("deadline:create") + force-dynamic	Cần dữ liệu mới nhất và phải kiểm tra quyền trên từng request.
Các route khác: /login (động, đọc searchParams), /subjects, /sitemap.xml, /robots.txt (tĩnh), ảnh OG của từng deadline (revalidate = 3600 vì trong ảnh có "Còn X ngày").

Server Component và 'use client'. Mặc định mọi trang/layout là Server Component. Chỉ các component cần tương tác mới dùng 'use client':

Client Component	Vì sao cần client
components/countdown.tsx (CountdownBadge, CountdownStat, TimelineDot)	Hiển thị "Còn X ngày / Quá hạn Y ngày" theo giờ thật của người xem, tự cập nhật mỗi 30 giây.
components/deadline-filter.tsx	Bộ lọc theo môn học và trạng thái.
nav-links.tsx, dashboard-nav.tsx	Tô sáng menu của trang hiện tại (usePathname).
user-menu.tsx, login-form.tsx, mark-done-button.tsx, dashboard-task.tsx, admin-forms.tsx, copy-link-button.tsx	Đăng nhập/đăng xuất, đánh dấu đã xong (gọi Server Action), form admin (useActionState), nút sao chép link.
error.tsx, error-panel.tsx, not-found-view.tsx	error.tsx bắt buộc là client (nút "Thử lại" gọi reset()).
3. Điểm Lighthouse
Đo trên bản production (npm run build && npm start), Lighthouse 12, Chrome headless.

Trang	Thiết bị	Performance	Accessibility	Best Practices	SEO	FCP	LCP	TBT	CLS
/	Mobile	95	100	100	100	1.8 s	2.8 s	50 ms	0
/	Desktop	100	100	100	100	0.4 s	0.6 s	0 ms	0
/deadlines/1	Mobile	95	100	100	100	1.8 s	2.8 s	40 ms	0.006
/deadlines/1	Desktop	100	100	100	100	0.4 s	0.6 s	0 ms	0.004
/ Mobile	/ Desktop
	
/deadlines/1 Mobile	/deadlines/1 Desktop
	
4. Ảnh view-source của /deadlines/1
view-source /deadlines/1 — các thẻ SEO

Ảnh view-source: đầy đủ chụp từ Chrome:

view-source đầy đủ

5. Trả lời 2 câu hỏi
(1) Vì sao /deadlines/[id] dùng ISR?
Cần HTML tĩnh cho SEO và chia sẻ. Đây là trang được gửi link cho cả lớp và cần Google tìm thấy. ISR sinh sẵn HTML (title, description, og:image, JSON-LD) và phục vụ từ cache/CDN nhanh như SSG. Bot của Google, Zalo, Facebook đọc được đầy đủ mà không phải chạy JavaScript.
Nội dung giống nhau với mọi người và hiếm khi đổi, nên SSR (render lại mỗi request) là lãng phí. Phần riêng của từng người (đã xong chưa, còn bao nhiêu ngày theo giờ thật) được tách sang client component.
Nhưng nội dung có đổi khi admin thêm hoặc xoá, nên SSG thuần (chỉ build một lần) là không đủ: deadline mới sẽ không có trang, deadline đã xoá vẫn còn trang. ISR giải quyết cả hai:
Làm mới ngay (on-demand revalidation): Server Action thêm/xoá gọi revalidatePath("/deadlines/" + id), nên trang cập nhật ngay, ví dụ xoá xong thì truy cập lại nhận 404 liền.
dynamicParams = true: id mới (chưa có lúc build) được render ở lần truy cập đầu rồi cache lại.
So với ISR theo thời gian (như /deadlines với 60 giây), làm mới theo sự kiện vừa không bị trễ vừa không tái tạo trang vô ích khi dữ liệu không đổi.
(2) Nếu chỉ dùng Middleware để bảo vệ /admin thì có rủi ro gì?
Server Action là một endpoint POST độc lập. Action thêm/xoá có thể được gọi bằng POST tới bất kỳ URL nào kèm header Next-Action: <id>, ví dụ POST / hoặc POST /deadlines. Middleware chỉ khớp /admin/* nên không chạy cho request đó. Nếu action không tự kiểm tra quyền, một sinh viên (hoặc khách) lấy được action id (nằm trong bundle JavaScript) là xoá được deadline.
Matcher dễ sai hoặc bị lọt. Quên một route, đổi tên thư mục, dùng route group, hoặc sửa config.matcher là trang hết được bảo vệ mà không ai nhận ra. Thực tế từng có lỗ hổng bỏ qua hoàn toàn middleware: CVE-2025-29927 (giả mạo header x-middleware-subrequest).
Middleware chỉ đọc JWT ở Edge, không truy cập dữ liệu thật. Nếu quyền của người dùng bị hạ sau khi token đã cấp, middleware vẫn tin token cũ. Kiểm tra quyền sát dữ liệu (trong trang và Server Action) mới là nguồn sự thật.
Không có phòng thủ nhiều lớp. Chỉ có một lớp, hỏng là mất tất cả.
Vì vậy trong dự án này middleware chỉ là lớp chặn sớm cho trải nghiệm tốt (chuyển tới /login, /403). Trang /admin và mọi Server Action vẫn tự gọi can(role, action) và kiểm tra dữ liệu đầu vào bằng zod.

6. Phụ lục
6.1. Các màn hình
Trang chủ (SSG)	Tất cả deadline (ISR 60s)
	
Chi tiết deadline (ISR làm mới ngay)	Dashboard (SSR, layout lồng)
	
Quản trị: báo lỗi "Hạn nộp phải sau thời điểm hiện tại"	403: user vào /admin
	
404: /deadlines/99	
	
Trang chi tiết có thêm nút Sao chép link để chia sẻ deadline: bấm vào thì chép địa chỉ đầy đủ của trang vào clipboard.

Nút Sao chép link ở trang chi tiết

loading.tsx và error.tsx của danh sách nằm trong route group (list) để không bọc /deadlines/[id]. Nếu bọc, Suspense sẽ gửi HTML trước khi notFound() chạy và trang 404 bị trả về với mã 200.

6.2. Cấu trúc thư mục
app/
├─ layout.tsx                    # root: next/font (Be Vietnam Pro, subset vietnamese), metadataBase
├─ (public)/                     # NHÓM CÔNG KHAI: layout riêng, không đọc cookie ở server
│  ├─ layout.tsx
│  ├─ page.tsx                   # /                 SSG
│  ├─ login/page.tsx             # /login            noindex
│  ├─ subjects/page.tsx          # /subjects         SSG
│  ├─ subjects/[slug]/page.tsx   # /subjects/[slug]  SSG (generateStaticParams)
│  └─ deadlines/
│     ├─ (list)/page.tsx         # /deadlines        ISR revalidate = 60
│     ├─ (list)/loading.tsx      # skeleton
│     ├─ (list)/error.tsx        # lỗi + nút "Thử lại"
│     └─ [id]/
│        ├─ page.tsx             # /deadlines/[id]   ISR làm mới ngay + metadata động + JSON-LD
│        ├─ not-found.tsx        # 404 riêng của deadline
│        └─ opengraph-image.tsx  # ảnh chia sẻ 1200×630 cho từng deadline
├─ (app)/                        # NHÓM ỨNG DỤNG: layout riêng, SSR, đọc phiên đăng nhập
│  ├─ layout.tsx
│  ├─ dashboard/layout.tsx       # layout lồng: sidebar (Tổng quan / Chưa xong / Đã hoàn thành)
│  ├─ dashboard/{page,pending/page,done/page,loading}.tsx
│  └─ admin/page.tsx             # chỉ admin
├─ 403/page.tsx · not-found.tsx · error.tsx
├─ sitemap.ts · robots.ts · icon.svg
└─ api/auth/[...nextauth]/route.ts · api/progress/route.ts
auth.config.ts      # cấu hình Edge-safe (callbacks jwt/session), dùng chung với middleware
auth.ts             # Credentials (bcrypt + zod) + GitHub (tuỳ chọn)
middleware.ts       # bảo vệ /dashboard, /admin
lib/permissions.ts  # MA TRẬN PHÂN QUYỀN + can(role, action)
lib/actions.ts      # Server Actions: đánh dấu xong, thêm, xoá (tự kiểm tra quyền + zod)
lib/session.ts      # requirePermission() cho trang server
lib/db.ts           # đọc/ghi file JSON (server-only)
types/next-auth.d.ts  # khai báo kiểu Session/JWT có id + role
data/               # subjects.json · deadlines.json · users.json · progress.json
