import { useTranslations } from 'next-intl'

export default function Index({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('Index')

  return <h1 className='p-4 font-sans text-3xl font-bold'>{t('title')}</h1>
}
