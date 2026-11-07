/**
 * SINGLE SOURCE OF TRUTH for all personal content.
 * Edit this file to update the site — no component changes needed.
 * Every user-facing string is bilingual: { en, vi }.
 * Source: LinkedIn https://www.linkedin.com/in/dungnt910/ (synced 11/2026) + My-info.txt
 */
import type { OrgLogo, Profile } from './types'

/** Official logos (from elcom.com.vn / hust.edu.vn), stored in /public/logos. */
const ELCOM_LOGO: OrgLogo = { dark: '/logos/elcom-white.png', light: '/logos/elcom-blue.png' }

export const profile: Profile = {
  name: 'Nguyễn Tiến Dũng',
  nameShort: 'Nguyễn Tiến Dũng',
  handle: 'dungnt',
  role: { en: 'Full-stack Developer @ ELCOM Corp', vi: 'Full-stack Developer @ ELCOM Corp' },
  tagline: {
    en: 'I build scalable VMS/VAS platforms with AI video analytics — .NET microservices, real-time React, and the cloud infrastructure underneath.',
    vi: 'Tôi xây dựng nền tảng VMS/VAS quy mô lớn tích hợp AI phân tích video — microservice .NET, React realtime và hạ tầng cloud bên dưới.',
  },
  rotatingTitles: [
    { en: 'Full-stack Developer · .NET & React', vi: 'Full-stack Developer · .NET & React' },
    { en: 'Microservices builder', vi: 'Người xây microservice' },
    { en: 'Video & AI systems engineer', vi: 'Kỹ sư hệ thống Video & AI' },
    { en: 'Cloud & DevOps learner', vi: 'Đang chinh phục Cloud & DevOps' },
    { en: 'Future Solutions Architect', vi: 'Solutions Architect tương lai' },
  ],
  location: { en: 'Hanoi, Vietnam', vi: 'Hà Nội, Việt Nam' },
  company: 'ELCOM Corporation',
  companyLogo: ELCOM_LOGO,
  available: true,
  contact: {
    email: 'dungntworkspace@gmail.com',
    linkedin: 'https://www.linkedin.com/in/dungnt910/',
    github: 'https://github.com/dungnt9',
  },
  about: [
    {
      en: 'Full-stack software engineer with a B.Sc. in Mathematics and Computer Science from Hanoi University of Science and Technology (HUST, GPA 3.41/4.0 — Very Good). I joined ELCOM Corporation in November 2024 and now build VMS/VAS systems that power AI camera networks for smart cities.',
      vi: 'Kỹ sư phần mềm Full-stack, Cử nhân Toán – Tin tại Đại học Bách khoa Hà Nội (HUST, GPA 3.41/4.0 — Giỏi). Tôi gia nhập ELCOM từ 11/2024 và hiện xây dựng hệ thống VMS/VAS vận hành mạng lưới camera AI cho đô thị thông minh.',
    },
    {
      en: "I don't just want to write better code — I want to understand the full lifecycle of a system: build → deploy → operate → secure → architect.",
      vi: 'Tôi không chỉ muốn viết code tốt hơn — tôi muốn hiểu toàn bộ vòng đời hệ thống: phát triển → triển khai → vận hành → bảo mật → kiến trúc.',
    },
  ],
  traits: [
    { icon: 'target', title: { en: 'Precision', vi: 'Chính xác' }, desc: { en: 'Research first, no guessing.', vi: 'Research trước, không phỏng đoán.' } },
    { icon: 'network', title: { en: 'Systems thinking', vi: 'Tư duy hệ thống' }, desc: { en: 'How every service connects.', vi: 'Hiểu cách các service liên kết.' } },
    { icon: 'scale', title: { en: 'Trade-off minded', vi: 'Cân nhắc đánh đổi' }, desc: { en: 'AWS vs Azure, CKA vs CKAD…', vi: 'AWS vs Azure, CKA vs CKAD…' } },
    { icon: 'compass', title: { en: 'Long-term vision', vi: 'Tầm nhìn dài hạn' }, desc: { en: 'Solutions Architect in 5 years.', vi: 'Solutions Architect trong 5 năm.' } },
  ],
  stats: [
    { value: 2, suffix: '+', label: { en: 'Years at ELCOM', vi: 'Năm tại ELCOM' } },
    { value: 39, suffix: '', label: { en: 'Skills on LinkedIn', vi: 'Kỹ năng trên LinkedIn' } },
    { value: 805, suffix: '', label: { en: 'TOEIC score', vi: 'Điểm TOEIC' } },
    { value: 4900, suffix: '+', label: { en: 'LinkedIn followers', vi: 'Người theo dõi LinkedIn' } },
  ],
  education: {
    school: 'Hanoi University of Science and Technology',
    short: 'HUST',
    logo: '/logos/hust.png',
    degree: { en: "Bachelor's degree, Mathematics and Computer Science", vi: 'Cử nhân Toán – Tin' },
    period: '09/2021 — 08/2025',
    note: { en: 'GPA 3.41/4.0 · Very Good', vi: 'GPA 3.41/4.0 · Loại Giỏi' },
  },
  certs: [
    { name: 'TOEIC — 805', issuer: 'IIG Vietnam', date: '09/2024' },
    { name: 'AWS Solutions Architect Associate (SAA-C03)', issuer: 'Amazon Web Services', date: 'In progress' },
  ],
  experience: [
    {
      period: '05/2025 — Now',
      title: { en: 'Full-stack Developer', vi: 'Full-stack Developer' },
      company: 'ELCOM Corporation',
      logo: ELCOM_LOGO,
      points: [
        { en: 'Build scalable VMS/VAS (Video Management / Video Analytics) systems integrating AI video analytics.', vi: 'Xây dựng hệ thống VMS/VAS (quản lý & phân tích video) quy mô lớn tích hợp AI phân tích video.' },
        { en: 'Microservice architecture — device, media, AI and log services behind an API Gateway, communicating via gRPC.', vi: 'Kiến trúc microservice — các service thiết bị, media, AI, log sau API Gateway, giao tiếp qua gRPC.' },
        { en: 'Redis caching, RabbitMQ event messaging, MinIO media storage.', vi: 'Redis cache, RabbitMQ cho event, MinIO lưu trữ media.' },
        { en: 'ReactJS + Socket.io front-end for real-time live view, playback and notifications.', vi: 'Front-end ReactJS + Socket.io cho live view, playback và thông báo realtime.' },
        { en: 'SSO & Authz service; camera integration via ONVIF/SDK; AI-driven event alerts.', vi: 'SSO & dịch vụ phân quyền; tích hợp camera qua ONVIF/SDK; cảnh báo sự kiện từ AI.' },
      ],
      tags: ['ASP.NET', 'React', 'gRPC', 'Redis', 'RabbitMQ', 'MinIO', 'Socket.io', 'ONVIF'],
    },
    {
      period: '11/2024 — 04/2025',
      title: { en: 'Software Engineer', vi: 'Software Engineer' },
      company: 'ELCOM Corporation',
      logo: ELCOM_LOGO,
      points: [
        { en: 'Developed mobile.colearn.vn — a PWA (Vue.js + Vite) on a Java Spring microservices backend.', vi: 'Phát triển mobile.colearn.vn — PWA (Vue.js + Vite) trên backend microservice Java Spring.' },
        { en: 'Redis, RabbitMQ and Memcached for caching, messaging and scalability; deployed behind Nginx with PWA caching.', vi: 'Redis, RabbitMQ, Memcached cho cache, messaging và mở rộng; deploy sau Nginx, tối ưu PWA caching.' },
        { en: 'Google Login, SSO and Google Analytics 4 integration.', vi: 'Tích hợp Google Login, SSO và Google Analytics 4.' },
      ],
      tags: ['Vue.js', 'Vite', 'Java Spring', 'Redis', 'RabbitMQ', 'Nginx', 'PWA'],
    },
  ],
  projects: [
    {
      slug: 'vms',
      featured: true,
      title: { en: 'AI Video Management Platform (VMS/VAS)', vi: 'Nền tảng quản lý & phân tích video AI (VMS/VAS)' },
      summary: {
        en: 'Microservice platform powering AI camera networks in the ELCOM ITS ecosystem: device, media, AI and log services behind an API Gateway (gRPC), with real-time live view, playback and AI event alerts.',
        vi: 'Nền tảng microservice vận hành mạng lưới camera AI trong hệ sinh thái ELCOM ITS: service thiết bị, media, AI, log sau API Gateway (gRPC), live view, playback và cảnh báo sự kiện AI theo thời gian thực.',
      },
      challenge: { en: 'Many camera vendors (ONVIF/SDK, RTSP), heavy media traffic, real-time alerts at scale.', vi: 'Nhiều hãng camera (ONVIF/SDK, RTSP), lưu lượng media lớn, cảnh báo realtime quy mô lớn.' },
      solution: { en: 'Service-per-domain, gRPC internally, RabbitMQ events, Redis cache, MinIO storage, Socket.io push.', vi: 'Tách service theo domain, gRPC nội bộ, event qua RabbitMQ, cache Redis, lưu MinIO, đẩy realtime bằng Socket.io.' },
      tags: ['.NET', 'React', 'gRPC', 'RabbitMQ', 'Redis', 'MinIO', 'ONVIF', 'HLS'],
    },
    {
      slug: 'colearn',
      title: { en: 'Colearn — Learning PWA', vi: 'Colearn — Nền tảng học tập PWA' },
      summary: {
        en: 'mobile.colearn.vn: students search & filter exercises, view detailed solutions, earn rewards via missions/videos and buy premium Q&A packages.',
        vi: 'mobile.colearn.vn: học sinh tìm & lọc bài tập, xem lời giải chi tiết, nhận thưởng qua nhiệm vụ/video và mua gói hỏi đáp premium.',
      },
      tags: ['Vue.js', 'Java Spring', 'PWA', 'GA4', 'SSO'],
      link: 'https://mobile.colearn.vn',
    },
    {
      slug: 'portfolio',
      title: { en: 'This Portfolio', vi: 'Chính website này' },
      summary: {
        en: 'React 19 + Vite + Tailwind v4 + Motion. Bilingual, themeable, with a built-in terminal. Content-driven architecture.',
        vi: 'React 19 + Vite + Tailwind v4 + Motion. Song ngữ, đổi theme, có terminal tích hợp. Kiến trúc hướng nội dung.',
      },
      tags: ['React', 'TypeScript', 'Tailwind', 'Motion'],
    },
  ],
  skills: [
    { group: { en: 'Backend', vi: 'Backend' }, items: ['C#', 'ASP.NET', 'Microservices', 'gRPC', 'API Gateway', 'Java Spring'] },
    { group: { en: 'Frontend', vi: 'Frontend' }, items: ['React.js', 'Vue.js', 'TypeScript', 'Socket.io', 'PWA'] },
    { group: { en: 'Data & Messaging', vi: 'Dữ liệu & Messaging' }, items: ['SQL', 'PostgreSQL', 'Redis', 'Memcached', 'RabbitMQ', 'Kafka', 'MinIO'] },
    { group: { en: 'Cloud (AWS)', vi: 'Cloud (AWS)' }, items: ['EC2', 'VPC', 'ELB', 'S3', 'CloudFront', 'RDS', 'ECS/Fargate'] },
    { group: { en: 'DevOps', vi: 'DevOps' }, items: ['Docker', 'Kubernetes', 'Nginx', 'CI/CD', 'Linux', 'Terraform'] },
    { group: { en: 'Security & Auth', vi: 'Bảo mật & Xác thực' }, items: ['SSO', 'Authz', 'Google OAuth'] },
    { group: { en: 'Video', vi: 'Video' }, items: ['ONVIF', 'Camera SDK', 'RTSP', 'HLS', 'MediaMTX'] },
  ],
  journey: [
    { year: '2021', status: 'done', title: { en: 'HUST — Math & CS', vi: 'Bách khoa — Toán Tin' }, desc: { en: 'Started B.Sc. at Hanoi University of Science and Technology.', vi: 'Bắt đầu học Cử nhân tại ĐH Bách khoa Hà Nội.' } },
    { year: '2024', status: 'done', title: { en: 'Software Engineer @ ELCOM', vi: 'Software Engineer @ ELCOM' }, desc: { en: 'Colearn PWA on Java Spring microservices. TOEIC 805.', vi: 'Colearn PWA trên microservice Java Spring. TOEIC 805.' } },
    { year: '2025', status: 'done', title: { en: 'Full-stack Developer + Graduated', vi: 'Full-stack Developer + Tốt nghiệp' }, desc: { en: 'VMS/VAS with AI video analytics. Graduated GPA 3.41 (Very Good).', vi: 'VMS/VAS tích hợp AI video. Tốt nghiệp GPA 3.41 (Giỏi).' } },
    { year: '2026', status: 'now', title: { en: 'Cloud & DevOps', vi: 'Cloud & DevOps' }, desc: { en: 'AWS SAA-C03, Docker, Kubernetes, Terraform.', vi: 'AWS SAA-C03, Docker, Kubernetes, Terraform.' } },
    { year: '2027', status: 'next', title: { en: 'Platform / DevOps Engineer', vi: 'Platform / DevOps Engineer' }, desc: { en: 'CKA/CKAD, GitOps (Argo CD), DevSecOps.', vi: 'CKA/CKAD, GitOps (Argo CD), DevSecOps.' } },
    { year: '2030', status: 'goal', title: { en: 'Solutions Architect', vi: 'Solutions Architect' }, desc: { en: 'Design reliable, scalable, cost-aware systems.', vi: 'Thiết kế hệ thống tin cậy, mở rộng, tối ưu chi phí.' } },
  ],
  learning: [
    { name: 'AWS SAA-C03', progress: 80 },
    { name: 'Kubernetes (CKA/CKAD)', progress: 40 },
    { name: 'Terraform', progress: 35 },
    { name: 'Ansible', progress: 25 },
    { name: 'Helm + Argo CD', progress: 20 },
    { name: 'DevSecOps', progress: 15 },
    { name: 'English → C1', progress: 60 },
  ],
}
