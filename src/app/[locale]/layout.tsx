import localFont from 'next/font/local'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Switch from './switch'
import { cn } from '@/lib/utils'
import './globals.css'

export const fontInter = localFont({
  src: [
    {
      path: '../../../public/fonts/inter-regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/inter-medium.woff2',
      weight: '500',
      style: 'medium'
    },
    {
      path: '../../../public/fonts/inter-semibold.woff2',
      weight: '600',
      style: 'semibold'
    },
    {
      path: '../../../public/fonts/inter-bold.woff2',
      weight: '700',
      style: 'bold'
    }
  ],
  variable: '--font-inter',
  display: 'swap'
})

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={cn(fontInter.variable)}>
        <NextIntlClientProvider messages={messages}>
          <Switch />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
