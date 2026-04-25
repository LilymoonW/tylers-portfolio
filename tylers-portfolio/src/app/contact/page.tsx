import type { Metadata } from 'next'
import ContactPageClient from '@/components/ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact | Tyler Yoon',
  description: 'Get in touch for VFX editing, motion, and creative video work.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
