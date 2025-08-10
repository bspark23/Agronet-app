import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { cookies } from 'next/headers';
import { ClientProviders } from '@/components/client-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgroNet - Agricultural Marketplace',
  description: 'Connect, trade, and chat in the agricultural marketplace.',
  generator: 'v0.dev',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ Correctly awaiting cookies() for dynamic usage
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

  return (
    <html lang='en'>
      <body cz-shortcut-listen='true' className={inter.className}>
        <ClientProviders defaultOpen={defaultOpen}>{children}</ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
