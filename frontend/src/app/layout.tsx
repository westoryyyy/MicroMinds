import type { Metadata } from "next";
import { Gochi_Hand, Patrick_Hand } from "next/font/google";
import Providers from "@/components/Providers";
import { LangProvider } from "@/components/LangProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { CrayonDefs } from "@/components/Crayon";
import Footer from "@/components/Footer";
import "./globals.css";

const gochi = Gochi_Hand({ weight: "400", subsets: ["latin"], variable: "--font-gochi" });
const patrick = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-patrick" });

export const metadata: Metadata = {
    title: "MicroMinds | The Agent Economy on Monad",
    description: "Bayar per panggilan API, dengan escrow di Monad.",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('mm_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className={`${gochi.variable} ${patrick.variable}`}>
                <CrayonDefs />
                <ThemeProvider>
                    <LangProvider>
                        <Providers>
                            <>
                                <Navbar />
                                <main>{children}</main>
                                <Footer />
                            </>
                        </Providers>
                    </LangProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}