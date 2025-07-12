"use client";
// src/app/layout.tsx (SERVER COMPONENT)
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Footer from '@/components/Footer';
import { Provider } from 'react-redux';
import store from '@/store';
import ClientLayout from './ClientLayout';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <ClientLayout>
            {children}
            {pathname !== '/documentation' && <Footer />}
          </ClientLayout>
        </Provider>
      </body>
    </html>
  );
}
