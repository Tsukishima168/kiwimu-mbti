import { notFound } from 'next/navigation';

export const metadata = {
  robots: 'noindex',
};

export default function NotFoundPage() {
  notFound();
}
