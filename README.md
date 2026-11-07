# dungnt — Personal Portfolio

Website cá nhân của **Nguyễn Tiến Dũng**, Full-stack Developer (.NET + React), đang theo hướng Cloud/DevOps → Solutions Architect.

- Website: https://dungnt.io.vn
- Repo: https://github.com/dungnt9/portfolio
- LinkedIn: https://www.linkedin.com/in/dungnt910/

README này là **tài liệu duy nhất** để bảo trì dự án. Nó trả lời ba câu hỏi:

- Hệ thống đang chạy ở đâu?
- Thứ gì đã được cài? Kiểm tra bằng lệnh nào và kết quả ra sao là đúng?
- Nếu phải dựng lại từ đầu (trên Windows hoặc Linux) thì làm những gì?

| Muốn… | Đọc mục |
|---|---|
| Nắm nhanh hệ thống | [1](#1-hệ-thống-đang-chạy-thế-nào) |
| Kiểm tra máy đã dựng đủ chưa, trước khi cài lại bất cứ thứ gì | [2](#2-kiểm-tra-đã-dựng-những-gì) |
| Sửa code / nội dung và đưa lên web | [3](#3-hằng-ngày-sửa-và-cập-nhật-website), [4](#4-cấu-trúc-repo-sửa-gì-ở-đâu) |
| Chạy test | [5](#5-kiểm-thử) |
| Dựng lại từ đầu (Windows hoặc Linux) | [6](#6-dựng-lại-từ-đầu) |
| Vận hành: rollback, đổi token, gia hạn tên miền | [7](#7-vận-hành) |
| Web lỗi | [8](#8-xử-lý-sự-cố) |
| Những điều dễ quên khi sửa code | [9](#9-ghi-chú-quan-trọng-khi-sửa-code) |

---

## 1. Hệ thống đang chạy thế nào

```
 sửa code → git push main
      │
      ▼
 GitHub Actions: workflow "CI" (.github/workflows/ci.yml), 3 job nối tiếp:
   changes  so file với bản push trước → quyết định chạy gì (bảng bên dưới)
   test     npm ci → typecheck → Playwright (desktop + mobile)
      │ xanh
      ▼
   deploy   gọi .github/workflows/deploy.yml:
            docker build → push ghcr.io/dungnt9/portfolio:latest (+ :<commit-sha>)
      │
      ▼  Watchtower hỏi GHCR mỗi 60 giây
 Laptop Windows (luôn bật, cắm sạc)
   Docker Desktop (WSL2)
     ├─ container "watchtower": thấy image mới → pull → thay container "portfolio"
     └─ container "portfolio":  nginx phục vụ web tĩnh tại localhost:8080
   Windows service "Cloudflared": kết nối chiều ra tới Cloudflare (không mở cổng router)
      │
      ▼
 Cloudflare (Free): tunnel "portfolio"
   dungnt.io.vn, www.dungnt.io.vn → http://localhost:8080
   DNS + HTTPS tự động + CDN
      │
      ▼
 Người xem
```

| Thành phần | Ở đâu | Ghi chú |
|---|---|---|
| Mã nguồn | `src/` | React 19 + TypeScript + Vite 7, Tailwind v4, Motion, three.js / react-three-fiber |
| CI / Deploy | GitHub Actions | Free vì repo **public** |
| Docker image | `ghcr.io/dungnt9/portfolio` | Package để **Public** nên pull không cần đăng nhập |
| Máy chạy web | Laptop Windows 11 | Docker Desktop + 2 container + service Cloudflared |
| Tên miền | `dungnt.io.vn`, mua ở Mắt Bão | Hết hạn **07/11/2028**. Name server trỏ về Cloudflare (`peter` / `raegan.ns.cloudflare.com`) |
| Cloudflare | dash.cloudflare.com | Zero Trust team `orange-forest-54cb`, tunnel `portfolio` (cách token) |

**Giới hạn:** web chỉ sống khi laptop bật, Docker Desktop đang chạy và service Cloudflared đang chạy. Muốn chạy 24/7 thì chuyển sang máy Linux / VPS theo [6.3](#63-máy-chạy-web-linux-ubuntu--vps).

**Thời gian từ push đến khi web hiện bản mới:**

| Bước | Thời gian |
|---|---|
| CI | ~6–15 phút |
| Deploy | ~2–3 phút |
| Watchtower | ≤ 1 phút |
| Tổng (đo thực tế) | **khoảng 9–20 phút** |

**File nào kích hoạt test / deploy:** job `changes` (~10 giây) so danh sách file giữa lần push này và lần push trước.

| Push chỉ sửa | test | deploy | Web thay đổi |
|---|---|---|---|
| `*.md` (README…), `docs/**`, `LICENSE`, `.gitignore`, `.vscode/**` | bỏ qua | bỏ qua | không |
| `tests/**`, `.github/**`, `deploy/docker-compose.yml` | chạy | bỏ qua | không |
| Còn lại: `src/**`, `public/**`, `index.html`, `package*.json`, `vite.config.ts`, `Dockerfile`, `deploy/nginx.conf`… | chạy | chạy nếu test xanh | có |

- Push có lẫn nhiều loại file thì chạy theo loại "nặng" nhất.
- Không lấy được bản push trước (nhánh mới, Pull Request, chạy tay) thì chạy đầy đủ.
- Đã kiểm chứng 08/11/2026 với kiểu amend + force-push: push chỉ sửa README → chỉ `changes` chạy; sửa `.github/` → `test` chạy, `deploy` bỏ qua.
- Bộ lọc nằm trong `ci.yml`. **Không** dùng `paths-ignore` của GitHub: repo luôn force-push một commit gốc mới, mà với kiểu push này GitHub không kích hoạt workflow có `paths` nào cả (đã thử, CI không chạy).

Muốn chạy tay:
- test + deploy: **Actions → CI → Run workflow**;
- chỉ build và đẩy image: **Actions → Deploy → Run workflow**.

## 2. Kiểm tra đã dựng những gì

Chạy các lệnh dưới đây trong **PowerShell** trên máy chạy web **trước khi cài lại bất cứ thứ gì**. Kết quả mẫu được lấy từ laptop đang chạy (11/2026). Số phiên bản có thể cao hơn; chỉ cần lệnh chạy được và trạng thái giống mẫu.

### 2.1 Phần mềm

| Lệnh | Kết quả mẫu (đã cài) | Nếu lỗi / không có |
|---|---|---|
| `git --version` | `git version 2.56.0.windows.4` | `winget install Git.Git` |
| `node --version` | `v26.13.0` (cần ≥ 22) | `winget install OpenJS.NodeJS.LTS`. Chỉ cần nếu sửa code / chạy test |
| `wsl -l -v` | `* docker-desktop   Running   2` | [6.2 bước 1](#62-máy-chạy-web-windows-đang-dùng) |
| `docker --version` | `Docker version 29.9.2, build …` | [6.2 bước 1](#62-máy-chạy-web-windows-đang-dùng) |
| `& "C:\Program Files (x86)\cloudflared\cloudflared.exe" --version` | `cloudflared version 2026.10.7 …` | `winget install Cloudflare.cloudflared` |

### 2.2 Website đang chạy

| Lệnh | Kết quả mẫu (đang chạy đúng) | Nếu khác |
|---|---|---|
| `docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"` | `portfolio   ghcr.io/dungnt9/portfolio:latest   Up 2 hours (healthy)   0.0.0.0:8080->80/tcp`<br>`watchtower  containrrr/watchtower   Up 22 hours (healthy)` | Thiếu container: [6.2 bước 3](#62-máy-chạy-web-windows-đang-dùng). Có nhưng dừng: `docker start portfolio watchtower`. Lệnh `docker` báo không kết nối được: mở Docker Desktop |
| `docker inspect watchtower --format "{{json .Config.Env}} {{json .Args}}"` | `["DOCKER_API_VERSION=1.44",…] ["--interval","60","--cleanup","portfolio"]` | Tạo lại watchtower theo [6.2 bước 3](#62-máy-chạy-web-windows-đang-dùng) |
| `docker logs --tail 3 watchtower` | `level=info msg="Session done" Failed=0 Scanned=1 Updated=0` (mỗi phút 1 dòng) | Có `Failed=1` hoặc `client version … too old`: xem [mục 8](#8-xử-lý-sự-cố) |
| `curl.exe -s http://localhost:8080/healthz` | `ok` | Container `portfolio` không chạy |
| `Get-Service Cloudflared` | `Running  Cloudflared` | Không có service: [6.5 bước 4](#65-cloudflare-tunnel). Có nhưng dừng: `Start-Service Cloudflared` (Admin) |
| `curl.exe -s https://dungnt.io.vn/healthz` | `ok` | Lỗi 530/1033/502: [mục 8](#8-xử-lý-sự-cố) |

### 2.3 Tự chạy lại sau khi khởi động máy

| Lệnh | Kết quả mẫu | Ý nghĩa |
|---|---|---|
| `Select-String "$env:APPDATA\Docker\settings-store.json" -Pattern '"AutoStart"\|"OpenUIOnStartupDisabled"'` | `"AutoStart": true,`<br>`"OpenUIOnStartupDisabled": true,` | Docker Desktop tự bật khi đăng nhập Windows và không hiện cửa sổ. Nếu `false`: [6.2 bước 2](#62-máy-chạy-web-windows-đang-dùng) |
| `Get-Service Cloudflared \| Select StartType` | `Automatic` | Tunnel tự chạy cùng Windows, kể cả trước khi đăng nhập |
| `docker inspect -f "{{.Name}} {{.HostConfig.RestartPolicy.Name}}" portfolio watchtower` | `/portfolio unless-stopped`<br>`/watchtower unless-stopped` | Container tự chạy lại khi Docker bật |
| `powercfg /q SCHEME_CURRENT SUB_BUTTONS LIDACTION` | `Current AC Power Setting Index: 0x00000000` | Gập máy khi cắm sạc thì không ngủ (`0` = Do nothing). Xem [7.5](#75-giữ-laptop-chạy-liên-tục) |

Tất cả giống mẫu nghĩa là hệ thống **đã dựng đầy đủ, không cần cài lại gì**.

### 2.4 Phía GitHub và Cloudflare (kiểm tra trên trình duyệt)

| Ở đâu | Đúng khi |
|---|---|
| github.com/dungnt9/portfolio/actions | Lần chạy **CI** mới nhất xanh; các job `changes`, `test`, `deploy` xanh hoặc xám *skipped* đúng theo bảng ở mục 1 |
| github.com/dungnt9?tab=packages → `portfolio` | Có nhãn **Public**, có tag `latest` |
| Cloudflare → Domains | `dungnt.io.vn` trạng thái **Active** |
| Cloudflare → Zero Trust → Networking → Tunnels | `portfolio` **Healthy**, có 2 route: `dungnt.io.vn` và `www.dungnt.io.vn` → `http://localhost:8080` |
| Mắt Bão → Quản lý tên miền | Bản khai đã duyệt, chưa hết hạn |

## 3. Hằng ngày: sửa và cập nhật website

```bash
npm ci                 # lần đầu sau khi clone, hoặc khi package-lock.json đổi
npm run dev            # http://localhost:5173, sửa và xem trực tiếp
npm run typecheck      # trước khi push
```

Repo được giữ ở **1 commit duy nhất tên `first commit`**. Mỗi lần cập nhật thì gộp thay đổi vào commit đó và force-push:

```bash
git add -A
git commit --amend -m "first commit"
git push -f origin main
```

Muốn lưu lịch sử bình thường thì dùng `git commit -m "..."` và `git push`, quy trình CI/CD không đổi.

Sau khi push, theo dõi ở tab **Actions**. Cách xác nhận web đã lên bản mới:
- `docker logs --tail 20 watchtower` có dòng `Found new ghcr.io/dungnt9/portfolio:latest image`;
- hoặc tên file `assets/index-*.js` trong mã nguồn trang (`view-source:https://dungnt.io.vn`) đã đổi.

Job `test` đỏ thì `deploy` không chạy và web giữ bản cũ. Push nhiều lần liên tiếp thì lần chạy trước bị huỷ, chỉ lần mới nhất được deploy. Job hiện xám *skipped* là bình thường: hoặc push không cần job đó (bảng ở [mục 1](#1-hệ-thống-đang-chạy-thế-nào)), hoặc job trước đó đỏ.

## 4. Cấu trúc repo, sửa gì ở đâu

| Muốn đổi | Sửa ở |
|---|---|
| Thông tin cá nhân, kinh nghiệm, dự án, kỹ năng, % đang học | `src/content/profile.ts` (song ngữ `{ en, vi }`) |
| Lệnh mở đầu mỗi chương, commit ở Journey | `src/content/story.ts` |
| Sơ đồ kiến trúc AWS | `src/content/architecture.ts` (cảnh 3D: `src/features/architecture/`) |
| Icon và quỹ đạo ở mục Skills (Tech Universe) | `src/content/techIcons.ts` |
| Đường bay UFO | `src/features/ufo/waypoints.ts` (concept: [docs/STORYBOARD.md](docs/STORYBOARD.md)) |
| Lệnh terminal ẩn (`Ctrl+K`) | `src/features/terminal/commands.ts` |
| Chuỗi giao diện EN/VI | `src/i18n/ui.ts` |
| Màu, theme, hiệu ứng, tối ưu điện thoại | `src/styles/index.css` |
| Con trỏ chuột | `src/layout/CursorGlow.tsx` + mục cursor trong `index.css` |
| Logo, favicon, ảnh chia sẻ `og.png`, `robots.txt`, `sitemap.xml` | `public/` |
| Tiêu đề, meta chia sẻ, JSON-LD, font | `index.html` |
| Cache, header bảo mật, `/healthz` | `deploy/nginx.conf` |
| Cách build image | `Dockerfile` (Node 22 build → nginx 1.27, ~25 MB) |
| Pipeline (lọc file → test → deploy) | `.github/workflows/ci.yml`; bước build/push image: `deploy.yml` |
| Chạy trên Linux bằng compose | `deploy/docker-compose.yml` |

```
src/
├─ app/          App.tsx: ghép các mục, phím tắt
├─ content/      toàn bộ nội dung (chỉ cần sửa ở đây)
├─ features/     mỗi mục 1 thư mục: hero, about, journey, architecture, experience, projects, skills, contact, terminal, ufo
├─ components/   dùng chung: Section, Reveal, CodeEditor, hiệu ứng chữ
├─ layout/       Navbar, Footer, BootLoader (intro), CursorGlow, StatusBar
├─ i18n/ theme/ hooks/
├─ three/        helper 3D; device.ts KHÔNG import three (xem mục 9)
└─ styles/index.css
tests/e2e/       Playwright specs + ảnh chuẩn visual (*-win32.png)
docs/STORYBOARD.md   concept UFO
```

**Tính năng chính:**
- Intro kiểu terraform (bấm hoặc chạm để bỏ qua).
- Hero: địa cầu 3D với các AWS Region, mặt trăng chạy trên quỹ đạo.
- UFO dẫn đường qua từng chương.
- Scrollytelling dựng kiến trúc AWS.
- Journey cuộn ngang.
- Tech Universe: framework quay quanh tâm, có tooltip.
- Terminal ẩn.
- Con trỏ "magnetic morph".
- Song ngữ EN/VI, dark/light, 3 màu nhấn.
- Tối ưu riêng cho điện thoại.
- SEO / Open Graph.

## 5. Kiểm thử

```bash
npx playwright install chromium              # lần đầu
npm run test:e2e                             # đủ 5 kích thước màn hình, GPU thật (~40 phút)
npx playwright test --grep-invert "visual:"  # bỏ so ảnh (giống CI)
npx playwright test tests/e2e/features.spec.ts -g "tech orbit"   # chạy 1 nhóm
npm run test:e2e:update                      # chụp lại ảnh chuẩn sau khi CỐ Ý đổi giao diện
npm run test:report                          # mở báo cáo HTML
```

| File | Kiểm tra |
|---|---|
| `layout.spec.ts` | Chữ không bị cắt, không cuộn ngang, các mục không chồng nhau |
| `features.spec.ts` | Ngôn ngữ, theme, terminal, menu mobile, liên kết, cảnh 3D, CLS < 0.1, UFO, intro bỏ qua được, three.js tải sau, vệ tinh nằm đúng quỹ đạo + tooltip, Journey, hero mobile không hở |
| `a11y-visual.spec.ts` | WCAG 2.1 AA (axe-core) + so ảnh với ảnh chuẩn |
| `theme-light.spec.ts` | Theme sáng: bố cục, độ tương phản |

Các project kích thước: `desktop` 1440×900, `laptop` 1280×720, `tablet` 820×1180, `mobile` 390×844, `mobile-small` 360×640.

Lưu ý:
- Test chạy trên **bản production** (`npm run build` + `vite preview` cổng 4173). Nếu cổng 4173 đang có preview cũ, Playwright **dùng lại nó**: tắt server cũ trước khi test.
- Ảnh chuẩn visual được chụp trên Windows nên CI (Linux) bỏ nhóm `visual:`.
- CI không có GPU nên tắt WebGL (web dùng fallback Canvas 2D) và chỉ chạy `desktop` + `mobile`. Đừng bỏ cấu hình này, nếu không CI sẽ chạy quá 40 phút.
- Trên máy **Linux**: chạy `CI=1 npx playwright test --grep-invert "visual:"`. Cấu hình GPU mặc định dùng D3D11, chỉ có trên Windows.

## 6. Dựng lại từ đầu

Chỉ làm khi [mục 2](#2-kiểm-tra-đã-dựng-những-gì) báo thiếu, hoặc khi chuyển sang máy mới. Phần đang dùng là **Windows** ([6.2](#62-máy-chạy-web-windows-đang-dùng)). [6.3](#63-máy-chạy-web-linux-ubuntu--vps) là cách làm tương đương trên Linux.

### 6.1 GitHub (đã làm, chỉ làm lại nếu tạo repo mới)

1. Repo **Public**: Settings → General → Change visibility. Repo public được dùng Actions miễn phí không giới hạn.
2. Settings → Actions → General: *Allow all actions*. Không cần tạo secret nào: Deploy push image bằng `GITHUB_TOKEN` do GitHub tự cấp.
3. Push lên `main`, đợi workflow **CI** xanh (job `test` rồi `deploy`). Image xuất hiện ở trang cá nhân → **Packages → portfolio**.
4. **Package settings → Change visibility → Public**, để máy chạy web pull được mà không cần token.
5. Thẻ thanh toán trong tài khoản phải còn hạn và bật thanh toán quốc tế. Nếu không, GitHub **khoá toàn bộ Actions**, kể cả gói Free (lỗi *account is locked due to a billing issue*). Sửa ở Settings → Billing and licensing → Payment information, rồi **Re-run jobs**.

Kiểm tra: `docker pull ghcr.io/dungnt9/portfolio:latest` chạy được.

### 6.2 Máy chạy web: Windows (đang dùng)

**Bước 1: cài phần mềm.** PowerShell **Administrator** (chuột phải Start → *Terminal (Admin)*):

```powershell
wsl --install --no-distribution        # WSL2 cho Docker; xong thì khởi động lại máy
winget install Docker.DockerDesktop
winget install Cloudflare.cloudflared
```

Mở Docker Desktop, chấp nhận điều khoản, đợi *Engine running*.

**Bước 2: Docker Desktop chạy nền.** Settings ⚙ → **General**:
- bật *Start Docker Desktop when you sign in to your computer*;
- tắt *Open Docker Dashboard when Docker Desktop starts*;
- bấm **Apply**.

Đóng cửa sổ bằng nút **X** thì Docker vẫn chạy ở khay hệ thống. **Không** chọn *Quit Docker Desktop*. Cửa sổ "Welcome to WSL" chỉ là màn giới thiệu, tắt thoải mái.

**Bước 3: chạy 2 container** (PowerShell thường):

```powershell
docker run -d --name portfolio --restart unless-stopped -p 8080:80 ghcr.io/dungnt9/portfolio:latest

docker run -d --name watchtower --restart unless-stopped `
  -e DOCKER_API_VERSION=1.44 `
  -v /var/run/docker.sock:/var/run/docker.sock `
  containrrr/watchtower --interval 60 --cleanup portfolio
```

- `DOCKER_API_VERSION=1.44` là **bắt buộc** với Docker Engine 29+. Thiếu nó, Watchtower khởi động lại liên tục.
- `--cleanup` xoá image cũ sau khi cập nhật. Tham số `portfolio` ở cuối giới hạn để Watchtower chỉ cập nhật container này.

**Bước 4:** cài tunnel theo [6.5](#65-cloudflare-tunnel), rồi chỉnh nguồn điện theo [7.5](#75-giữ-laptop-chạy-liên-tục).

Kiểm tra: chạy lại toàn bộ [mục 2](#2-kiểm-tra-đã-dựng-những-gì).

### 6.3 Máy chạy web: Linux (Ubuntu / VPS)

Dùng khi muốn web chạy 24/7. Ubuntu 22.04/24.04, 1 vCPU / 1 GB RAM là đủ. Code và GitHub **không cần sửa**.

```bash
# 1. Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker
sudo systemctl enable --now docker          # Docker tự chạy khi bật máy (không cần đăng nhập như Windows)

# 2. Lấy file compose và chạy website + watchtower (giống hệt laptop)
git clone https://github.com/dungnt9/portfolio.git && cd portfolio
docker compose -f deploy/docker-compose.yml up -d
curl -s http://localhost:8080/healthz       # ok

# 3. cloudflared (gói .deb chính thức), cài thành service bằng CÙNG token tunnel
curl -fsSL -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb                # máy ARM: cloudflared-linux-arm64.deb
sudo cloudflared service install <TOKEN>
systemctl status cloudflared                # active (running)
```

Kiểm tra trên Linux:

| Windows | Linux |
|---|---|
| `Get-Service Cloudflared` | `systemctl is-active cloudflared` → `active` |
| `curl.exe -s …` | `curl -s …` |
| Docker Desktop AutoStart | `systemctl is-enabled docker` → `enabled` |
| Các lệnh `docker ps / logs / inspect` | giống hệt |

Khi máy Linux đã chạy ổn:
1. Gỡ tunnel trên laptop Windows (PowerShell Admin): `& "C:\Program Files (x86)\cloudflared\cloudflared.exe" service uninstall`.
2. Dừng container trên laptop: `docker rm -f portfolio watchtower`.

Route trong Cloudflare giữ nguyên. Trong lúc cả hai máy cùng chạy, tunnel có 2 connector và Cloudflare gửi truy cập tới máy nào đang sống, nên chuyển máy không bị gián đoạn.

**Cách khác (không dùng tunnel, deploy qua SSH):** `deploy.yml` có sẵn bước SSH, tự bỏ qua khi chưa có secret.
1. Trên server: tạo user `deploy` thuộc group `docker`, thêm public key, mở cổng 22 và 80.
2. Thêm repo secrets `SSH_HOST`, `SSH_USER`, `SSH_KEY`. Bước SSH tự bật và chạy container ở cổng **80**.
3. Trong Cloudflare: xoá route tunnel, tạo bản ghi DNS `A @ <IP>` và `A www <IP>` (Proxied), SSL mode **Full**.

### 6.4 Tên miền (Mắt Bão → Cloudflare)

1. Mắt Bão → Quản lý tên miền → cột **Bản Khai**: ký và nộp CCCD. Tên miền `.vn` chưa duyệt bản khai có thể bị tạm ngưng.
2. Cloudflare → **Domains → Add domain** → `dungnt.io.vn` → *Quick scan* → gói **Free**. Cloudflare cấp 2 name server.
3. Mắt Bão → bấm vào tên miền → **Quản trị tên miền** → tab **Name Server** → *Sử dụng Name Server tùy chỉnh*:
   - điền `peter.ns.cloudflare.com` và `raegan.ns.cloudflare.com`;
   - để trống các ô IP;
   - bấm **Lưu**.

   **Không** thêm bản ghi NS ở tab *Bản ghi DNS*: cách đó không có tác dụng.
4. Cloudflare → **Check nameservers now**. Chờ trạng thái **Active** (vài phút đến 24 giờ).

Kiểm tra trực tiếp ở máy chủ `.vn`: `nslookup -norecurse -type=NS dungnt.io.vn a.dns-servers.vn` phải ra 2 name server Cloudflare.

### 6.5 Cloudflare Tunnel

1. Cloudflare → **Zero Trust** (lần đầu chọn gói **Zero Trust Free**, 0 USD).
2. **Networking → Tunnels → Create Tunnel → Cloudflared** → tên `portfolio` → Save.
3. Màn cài connector hiện lệnh `cloudflared.exe service install eyJ...`. Phần `eyJ...` là **token**: giữ bí mật và **tuyệt đối không commit vào repo**.
4. Cài thành service:
   - Windows (PowerShell Admin): `& "C:\Program Files (x86)\cloudflared\cloudflared.exe" service install <TOKEN>`
   - Linux: xem [6.3](#63-máy-chạy-web-linux-ubuntu--vps)
5. Tunnel `portfolio` → **Routes → Add route → Published application**. Tạo 2 route:

   | Subdomain | Domain | Service |
   |---|---|---|
   | *(trống)* | `dungnt.io.vn` | HTTP `localhost:8080` |
   | `www` | `dungnt.io.vn` | HTTP `localhost:8080` |

   Cloudflare tự tạo bản ghi DNS và HTTPS. Nếu báo *record already exists*: Domains → DNS → Records → xoá bản ghi trùng ở `@` / `www`, rồi lưu lại route.
6. Khuyến nghị: Domains → `dungnt.io.vn` → SSL/TLS → Edge Certificates → bật **Always Use HTTPS**.

Kiểm tra: tunnel **Healthy**, `https://dungnt.io.vn/healthz` trả `ok`.

## 7. Vận hành

### 7.1 Lệnh thường dùng

| Việc | Lệnh |
|---|---|
| Kiểm tra nhanh toàn bộ | `docker ps`; `curl.exe -s https://dungnt.io.vn/healthz`; `Get-Service Cloudflared` |
| Log website | `docker logs --tail 50 portfolio` |
| Watchtower đã cập nhật chưa | `docker logs --tail 20 watchtower` (tìm `Found new … image`) |
| Ép cập nhật ngay (thay vì đợi ≤ 1 phút) | `docker run --rm -e DOCKER_API_VERSION=1.44 -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower --run-once --cleanup portfolio` |
| Khởi động lại website | `docker restart portfolio` |
| Khởi động lại tunnel | PowerShell Admin: `Restart-Service Cloudflared` |
| Log tunnel | Cloudflare → Tunnels → `portfolio` → **Live logs** |

### 7.2 Quay về bản cũ (rollback)

Mỗi lần deploy có image gắn mã commit: `ghcr.io/dungnt9/portfolio:<sha>` (xem ở GitHub → Packages → portfolio).

```powershell
docker stop watchtower        # nếu không, nó sẽ kéo :latest về lại
docker rm -f portfolio
docker run -d --name portfolio --restart unless-stopped -p 8080:80 ghcr.io/dungnt9/portfolio:<sha-cũ>
```

Sửa xong code và push bản đúng thì chạy `docker start watchtower`.

### 7.3 Đổi token tunnel (khi nghi bị lộ)

1. Cloudflare → Tunnels → `portfolio` → **Refresh token / Rotate token**, copy token mới.
2. PowerShell Admin:

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" service uninstall
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" service install <TOKEN_MỚI>
```

### 7.4 Gia hạn tên miền

Mắt Bão → Quản lý tên miền → **Gia hạn**. Hạn hiện tại **07/11/2028**: nên đặt lịch nhắc trước 1 tháng.

### 7.5 Giữ laptop chạy liên tục

| Cài đặt | Giá trị | Ở đâu |
|---|---|---|
| Sleep khi cắm sạc | **Never** | Settings → System → Power & battery → Screen, sleep & hibernate |
| Tắt màn hình | Tuỳ ý (không ảnh hưởng web) | như trên |
| Gập máy khi cắm sạc | **Do nothing** | Control Panel → Power Options → Choose what closing the lid does |
| Gập máy khi chạy pin | Sleep (khuyến nghị, tránh nóng máy trong balo) | như trên |

Đặt "gập máy không làm gì khi cắm sạc" bằng lệnh:

```powershell
powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
powercfg /setactive SCHEME_CURRENT
```

- Sau khi Windows Update khởi động lại máy: service Cloudflared tự chạy, nhưng **Docker Desktop chỉ chạy sau khi đăng nhập Windows**. Hãy đăng nhập rồi kiểm tra web. Nên đặt *Active hours* trong Windows Update trùng giờ hay dùng máy.
- Gập máy thì đặt trên mặt cứng, thoáng. Cắm dây mạng ổn định hơn Wi-Fi; nếu Wi-Fi rớt, tunnel tự kết nối lại.

### 7.6 Việc tuỳ chọn còn lại

- [ ] Điền `learning[].progress` (% thực tế) và `projects[].link` trong `src/content/profile.ts`.
- [ ] Google Search Console: thêm `dungnt.io.vn`, gửi `https://dungnt.io.vn/sitemap.xml`.
- [ ] Facebook Sharing Debugger: dán link để làm mới ảnh xem trước.
- [ ] Chuyển sang VPS Linux để chạy 24/7 ([6.3](#63-máy-chạy-web-linux-ubuntu--vps)).
- [ ] Ý tưởng sau này: trang case study từng dự án, blog MDX, backend .NET (contact form, view counter), hạ tầng Terraform.

## 8. Xử lý sự cố

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Web lỗi **530 / 1033** | Tunnel mất kết nối hoặc chưa có route | `Get-Service Cloudflared` phải Running; Cloudflare → tunnel **Healthy** + 2 route |
| Web lỗi **502** | Tunnel chạy nhưng container không chạy | `docker ps`; `docker start portfolio`; nếu `docker` không kết nối được thì mở Docker Desktop |
| Web không đổi sau khi push | Pipeline chưa xong hoặc đỏ; hoặc push không có file ảnh hưởng tới web (cố ý không deploy) | Tab Actions → mở lần chạy → job `changes` in ra danh sách file; `docker logs watchtower` |
| Push xong không thấy lần chạy nào trong Actions | Ai đó thêm `paths:` / `paths-ignore:` vào `on.push` | Bỏ đi, dùng bộ lọc trong job `changes` ([mục 1](#1-hệ-thống-đang-chạy-thế-nào)) |
| Actions: *Startup failure* / *account is locked due to a billing issue* | Thẻ GitHub lỗi | [6.1 bước 5](#61-github-đã-làm-chỉ-làm-lại-nếu-tạo-repo-mới) |
| Job `deploy` xám *skipped* | Push không có file ảnh hưởng tới web, `test` đỏ, hoặc bị huỷ do push mới hơn | Xem job `changes` và `test` |
| CI timeout > 40 phút | Ai đó bỏ cấu hình tắt WebGL trên CI | Giữ `--disable-webgl` trong `playwright.config.ts` và chỉ chạy `desktop` + `mobile` |
| `watchtower` *Restarting*, log `client version 1.25 is too old` | Thiếu `DOCKER_API_VERSION` | Xoá và tạo lại theo [6.2 bước 3](#62-máy-chạy-web-windows-đang-dùng) |
| `docker pull` báo *denied* | Package GHCR chưa Public | [6.1 bước 4](#61-github-đã-làm-chỉ-làm-lại-nếu-tạo-repo-mới) |
| Tên miền không phân giải / Cloudflare không Active | Đổi NS sai chỗ | Đổi ở tab **Name Server** của Mắt Bão, không phải bản ghi NS |
| `service install` báo *Access is denied* | Không chạy bằng quyền Admin | Mở Terminal (Admin) |
| `cloudflared tunnel login` báo *Failed to fetch resource* | Không cần dùng lệnh login | Dùng cách token ([6.5](#65-cloudflare-tunnel)) |
| Test visual đỏ sau khi cố ý đổi giao diện | Ảnh chuẩn cũ | Xem ảnh `*-diff.png` trong `tests/results/`; đúng ý thì `npm run test:e2e:update` |

## 9. Ghi chú quan trọng khi sửa code

Những bẫy đã gặp thực tế. Sửa nhầm thì web chậm hoặc vỡ giao diện mà test không phải lúc nào cũng bắt được.

1. **Không import `three` (hoặc `@/three/useSceneColors`) trong code tải ngay** (layout, hero text, ui). Hãy dùng `@/three/device` (`hasWebGL`, `LOW_POWER`, `blur`). Nếu không, three.js (~285 KB gzip) sẽ vào lượt tải đầu. Test `three.js is not part of the initial download` sẽ bắt lỗi này. `vite.config.ts` cũng đưa `preload-helper` vào `vendor-react` vì cùng lý do.
2. **Tailwind v4 dùng thuộc tính CSS `translate` / `scale` riêng.** Viết thêm `transform: translate(...)` hoặc keyframe `transform` lên phần tử đã có class `-translate-x-1/2` thì bị dịch **hai lần**. Đây chính là lỗi tâm "dungnt" trôi và vệ tinh lệch quỹ đạo trước đây. Keyframe chỉ nên dùng `scale:` hoặc `rotate`.
3. **Điện thoại:** không thêm `filter: blur` động hay `backdrop-filter`. Dùng `...blur(n)` từ `device.ts` (tự tắt trên máy yếu). Lenis tự tắt trên màn cảm ứng.
4. **Canvas 3D (react-three-fiber):**
   - giữ `resize={{ scroll: false }}`;
   - dùng `useThree((s) => s.x)` có selector, không gọi `useThree()` trần;
   - không đọc `window.scrollY` trong listener mà dùng `useScroll` của Motion.

   Nếu không, cả cảnh sẽ render lại mỗi lần cuộn.
5. **Thẻ đặt đè lên đường kẻ** (ví dụ Journey) phải dùng `card-solid`. Thẻ `.card` ở dark theme gần như trong suốt.
6. **Con trỏ** là con trỏ phần cứng (SVG trong biến CSS `--cursor-dot` / `--cursor-ring`), khung "morph" chỉ là một `div` vẽ thêm. Đừng quay lại kiểu `div` bám chuột, vì luôn trễ 1–2 frame.
7. **Không commit:** token tunnel, file `.env`, thư mục `dist*/`, các script thử `tests/_*.mjs` (đã có trong `.gitignore`).
