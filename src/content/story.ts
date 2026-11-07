import type { L } from './types'

/**
 * The page is told as a program being run.
 * Each chapter opens with a command that types itself as you scroll, followed by its output.
 */
export interface Chapter { id: string; cmd: string; out: L }

export const chapters: Record<string, Chapter> = {
  about: { id: 'ch-about', cmd: 'cat ~/README.md', out: { en: '# Chapter 1 — who is dungnt?', vi: '# Chương 1 — dungnt là ai?' } },
  cloud: { id: 'ch-cloud', cmd: 'terraform plan -out=vms-on-aws', out: { en: 'Plan: 14 to add, 0 to change, 0 to destroy.', vi: 'Kế hoạch: thêm 14, sửa 0, xoá 0.' } },
  journey: { id: 'ch-journey', cmd: 'git log --oneline --graph career/main', out: { en: '6 commits · from Hello World to Architect', vi: '6 commit · từ Hello World tới Architect' } },
  experience: { id: 'ch-exp', cmd: 'docker ps --filter "org=elcom"', out: { en: '2 roles · uptime 2y · status: healthy', vi: '2 vai trò · uptime 2 năm · trạng thái: healthy' } },
  projects: { id: 'ch-proj', cmd: 'ls -la ~/projects', out: { en: 'total 3 · 1 featured', vi: 'tổng 3 · 1 nổi bật' } },
  skills: { id: 'ch-skills', cmd: 'npm ls --depth=0', out: { en: 'dungnt@2026.11 · 40+ packages, 0 vulnerabilities', vi: 'dungnt@2026.11 · 40+ package, 0 lỗ hổng' } },
  contact: { id: 'ch-contact', cmd: 'ssh dungnt@hire.me', out: { en: 'Connection established. Say hi 👋', vi: 'Đã kết nối. Gửi lời chào nhé 👋' } },
}

/** Commit hashes + conventional-commit messages for the career log. */
export const commits: { hash: string; msg: L }[] = [
  { hash: 'a1f3c2e', msg: { en: 'init: enrol at HUST — Math & CS', vi: 'init: nhập học Bách khoa — Toán Tin' } },
  { hash: '4b9e017', msg: { en: 'feat(career): join ELCOM as Software Engineer', vi: 'feat(career): gia nhập ELCOM — Software Engineer' } },
  { hash: '7c2d8f1', msg: { en: 'feat: ship VMS/VAS microservices · chore: graduate', vi: 'feat: ship microservice VMS/VAS · chore: tốt nghiệp' } },
  { hash: 'e5a90b3', msg: { en: 'wip(cloud): AWS SAA, Docker, K8s, Terraform', vi: 'wip(cloud): AWS SAA, Docker, K8s, Terraform' } },
  { hash: 'f0d41aa', msg: { en: 'todo(platform): CKA/CKAD, GitOps, DevSecOps', vi: 'todo(platform): CKA/CKAD, GitOps, DevSecOps' } },
  { hash: 'pending', msg: { en: 'goal: Solutions Architect', vi: 'goal: Solutions Architect' } },
]
