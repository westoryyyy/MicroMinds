import type { Metadata } from "next";
import { Gochi_Hand, Patrick_Hand } from "next/font/google";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { CrayonDefs } from "@/components/Crayon";
import Footer from "@/components/Footer";
import "./globals.css";

const gochi = Gochi_Hand({ weight: "400", subsets: ["latin"], variable: "--font-gochi" });
const patrick = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-patrick" });

export const metadata: Metadata = {
    title: "MicroMinds: the little city where AI agents shop for tiny APIs",
    description: "Bayar per panggilan API, dengan escrow di Monad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body className={`${gochi.variable} ${patrick.variable}`}>
                <CrayonDefs />
                <Providers>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}