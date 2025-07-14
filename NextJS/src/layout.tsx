import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ApolloProviders, NextAuthSessionProviders } from "@/providers";
import MainLayout from "./(mainlayout)/mainlayout";
import { ReduxProviders } from "@/store/ReduxProvider";
import { GlobalModal } from "@/features/GlobalModal";
import { GlobalLoader } from "@/shared/components/GlobalLoader";
import { Open_Sans } from "next/font/google";
import { GameModal } from "@/features/Game/Components/GameModal";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Fanfare",
  description: "Fanfare Bangladesh",
};
const openSans = Open_Sans({
  subsets: ["latin"], // Choose the subset you need
  weight: ["400", "600", "700"], // Specify weights you use
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={openSans.className}>
      <head>
        <link rel="icon" href="/icons/fanfare_icon.svg" />
      </head>
      <body>
        <NextAuthSessionProviders>
          <ReduxProviders>
            <ApolloProviders>
              <MainLayout>
                
                <Toaster position="bottom-left" />
                {children}
              </MainLayout>
              <GlobalModal />
              <GameModal />
              <GlobalLoader />
            </ApolloProviders>
          </ReduxProviders>
        </NextAuthSessionProviders>
      </body>
    </html>
  );
}
