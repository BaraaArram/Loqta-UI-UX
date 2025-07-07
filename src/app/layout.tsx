// src/app/layout.tsx (SERVER COMPONENT)
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Footer />
            </AuthProvider>
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
