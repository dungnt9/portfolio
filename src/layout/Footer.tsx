import { profile } from '@/content/profile'
import { useI18n } from '@/i18n/I18nProvider'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-border px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
      <p>© {new Date().getFullYear()} {profile.nameShort}. {t('footer.built')}</p>
      <p className="hidden font-mono text-xs sm:block">{t('footer.hint')} <kbd className="rounded border border-border px-1.5">Ctrl K</kbd> / <kbd className="rounded border border-border px-1.5">`</kbd> {t('footer.hint2')}</p>
    </footer>
  )
}
