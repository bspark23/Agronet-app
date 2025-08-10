'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

interface ClientProvidersProps {
  children: React.ReactNode;
  defaultOpen: boolean;
}

export function ClientProviders({
  children,
  defaultOpen,
}: ClientProvidersProps) {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className='flex-1 flex flex-col min-h-screen'>{children}</main>
      </SidebarProvider>
    </AuthProvider>
  );
}
