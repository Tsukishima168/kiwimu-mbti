import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex',
};

export default function RootPage() {
  redirect('/en');
}
