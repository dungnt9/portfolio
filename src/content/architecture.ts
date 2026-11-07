import type { L } from './types'

/**
 * Blueprint for the 3D "Cloud Architecture" scrollytelling section:
 * how the VMS/VAS platform maps onto AWS. Coordinates: x → right, z → toward camera.
 */
export type ArchKind = 'user' | 'edge' | 'security' | 'lb' | 'service' | 'data' | 'storage' | 'observe'
export interface ArchNode { id: string; label: string; sub: string; pos: [number, number, number]; step: number; kind: ArchKind }

export const archNodes: ArchNode[] = [
  { id: 'users', label: 'Users', sub: 'Web · Mobile', pos: [-6.2, 0, 0], step: 0, kind: 'user' },
  { id: 'r53', label: 'Route 53', sub: 'DNS', pos: [-4.4, 0, -1.4], step: 0, kind: 'edge' },
  { id: 'cf', label: 'CloudFront', sub: 'CDN · SPA + HLS', pos: [-4.4, 0, 1.4], step: 0, kind: 'edge' },
  { id: 'waf', label: 'AWS WAF', sub: 'Shield', pos: [-2.9, 0, 1.4], step: 1, kind: 'security' },
  { id: 'alb', label: 'ALB', sub: 'Multi-AZ', pos: [-1.6, 0, 0], step: 1, kind: 'lb' },
  { id: 'gw', label: 'API Gateway', sub: 'EKS · .NET', pos: [0.6, 0, -2.1], step: 2, kind: 'service' },
  { id: 'device', label: 'Device Svc', sub: 'ONVIF · SDK', pos: [0.6, 0, -0.7], step: 2, kind: 'service' },
  { id: 'media', label: 'Media Svc', sub: 'RTSP → HLS', pos: [0.6, 0, 0.7], step: 2, kind: 'service' },
  { id: 'ai', label: 'AI Svc', sub: 'Video analytics', pos: [0.6, 0, 2.1], step: 2, kind: 'service' },
  { id: 'rds', label: 'RDS', sub: 'PostgreSQL', pos: [3.2, 0, -1.6], step: 3, kind: 'data' },
  { id: 'redis', label: 'ElastiCache', sub: 'Redis', pos: [3.2, 0, 0], step: 3, kind: 'data' },
  { id: 'mq', label: 'Amazon MQ', sub: 'RabbitMQ', pos: [3.2, 0, 1.6], step: 3, kind: 'data' },
  { id: 's3', label: 'S3', sub: 'Media · Snapshots', pos: [5.6, 0, 1.2], step: 3, kind: 'storage' },
  { id: 'cw', label: 'CloudWatch', sub: 'Logs · Alarms', pos: [1.9, 2.3, -0.2], step: 4, kind: 'observe' },
]

export const archEdges: [string, string][] = [
  ['users', 'r53'], ['users', 'cf'], ['cf', 'waf'], ['r53', 'alb'], ['waf', 'alb'],
  ['alb', 'gw'], ['alb', 'media'], ['gw', 'device'], ['gw', 'ai'], ['device', 'media'], ['media', 'ai'],
  ['gw', 'rds'], ['device', 'redis'], ['media', 'mq'], ['ai', 'mq'], ['media', 's3'], ['ai', 's3'],
  ['gw', 'cw'], ['media', 'cw'], ['rds', 'cw'],
]

export const archSteps: { title: L; desc: L; tags: string[] }[] = [
  {
    title: { en: 'Edge — global entry', vi: 'Edge — cửa ngõ toàn cầu' },
    desc: { en: 'Users resolve through Route 53; CloudFront serves the React SPA and caches HLS video segments close to viewers.', vi: 'Người dùng phân giải qua Route 53; CloudFront phục vụ React SPA và cache segment video HLS gần người xem.' },
    tags: ['Route 53', 'CloudFront'],
  },
  {
    title: { en: 'Security & load balancing', vi: 'Bảo mật & cân bằng tải' },
    desc: { en: 'WAF + Shield filter attacks; an Application Load Balancer routes traffic into a private, multi-AZ VPC.', vi: 'WAF + Shield lọc tấn công; Application Load Balancer định tuyến vào VPC private, đa AZ.' },
    tags: ['WAF', 'Shield', 'ALB', 'VPC'],
  },
  {
    title: { en: 'Microservices on EKS', vi: 'Microservice trên EKS' },
    desc: { en: 'API Gateway, Device (ONVIF/SDK), Media (RTSP → HLS) and AI analytics services in .NET, talking over gRPC.', vi: 'Các service API Gateway, Device (ONVIF/SDK), Media (RTSP → HLS) và AI analytics viết bằng .NET, giao tiếp gRPC.' },
    tags: ['EKS', '.NET', 'gRPC', 'Docker'],
  },
  {
    title: { en: 'Data, cache & events', vi: 'Dữ liệu, cache & sự kiện' },
    desc: { en: 'RDS PostgreSQL for state, ElastiCache Redis for hot data, Amazon MQ (RabbitMQ) for AI events, S3 for media (MinIO-compatible).', vi: 'RDS PostgreSQL lưu trạng thái, ElastiCache Redis cho dữ liệu nóng, Amazon MQ (RabbitMQ) cho sự kiện AI, S3 lưu media (tương thích MinIO).' },
    tags: ['RDS', 'Redis', 'RabbitMQ', 'S3'],
  },
  {
    title: { en: 'Observe & automate', vi: 'Giám sát & tự động hoá' },
    desc: { en: 'CloudWatch logs, metrics and alarms. Everything provisioned with Terraform and shipped via GitOps (Argo CD).', vi: 'CloudWatch cho log, metric, alarm. Toàn bộ hạ tầng dựng bằng Terraform và triển khai qua GitOps (Argo CD).' },
    tags: ['CloudWatch', 'Terraform', 'Argo CD'],
  },
]
