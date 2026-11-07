import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/I18nProvider'

const LINES = [
  '$ terraform apply -auto-approve',
  '  aws_vpc.main: Creation complete',
  '  aws_eks_cluster.vms: Creation complete',
  '$ kubectl rollout status deploy/portfolio',
  '  deployment "portfolio" successfully rolled out',
]
const STEP = 150

/** Intro "deploy" sequence — shown once per browser session. Any tap, key or wheel skips it. */
export function BootLoader() {
  const { t } = useI18n()
  const [show, setShow] = useState(() => { try { return !sessionStorage.getItem('booted') } catch { return true } })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!show) return
    document.body.style.overflow = 'hidden'
    const finish = () => { setShow(false); try { sessionStorage.setItem('booted', '1') } catch { /* ignore */ } }
    const id = setInterval(() => setN((v) => v + 1), STEP)
    const done = setTimeout(finish, STEP * (LINES.length + 2) + 200)
    const skip = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    skip.forEach((e) => window.addEventListener(e, finish, { once: true, passive: true }))
    return () => {
      clearInterval(id); clearTimeout(done); document.body.style.overflow = ''
      skip.forEach((e) => window.removeEventListener(e, finish))
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div data-boot className="fixed inset-0 z-[100] flex items-center justify-center bg-bg px-6" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}>
          <div className="w-full max-w-lg font-mono text-xs text-muted sm:text-sm">
            {LINES.slice(0, n).map((l, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className={l.startsWith('$') ? 'text-fg' : ''}>{l}</motion.p>
            ))}
            {n > LINES.length && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-accent">✓ {t('boot.ready')}<span className="caret">_</span></motion.p>}
            <div className="mt-6 h-0.5 overflow-hidden rounded bg-border">
              <motion.div className="h-full bg-gradient-to-r from-accent to-accent-2" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: (STEP / 1000) * (LINES.length + 2), ease: 'easeInOut' }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
