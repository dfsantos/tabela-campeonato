import type { Metadata } from "next";
import { Space_Grotesk, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tabela Campeonato",
  description: "Gerencie campeonatos de futebol no modelo de pontos corridos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${manrope.variable} antialiased`}
      >
        <Sidebar />
        <div className="lg:ml-64 min-h-screen bg-surface flex flex-col">
          <TopHeader />
          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
