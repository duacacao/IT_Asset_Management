import { Inter, Be_Vietnam_Pro, Lexend, Nunito } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
})

export const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-be-vietnam',
})

export const lexend = Lexend({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-lexend',
})

export const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-nunito',
})
