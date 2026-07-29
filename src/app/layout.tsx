import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CompanyProvider } from "@/contexts/company-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Frotas | Grupo Felinto",
  description: "Sistema Integrado de Gestão de Frotas e Operações",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="pt-BR"
          suppressHydrationWarning
          className={`${inter.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
      <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
      >
        <CompanyProvider>{children}</CompanyProvider>
      </ThemeProvider>
      </body>
      </html>
  );
}