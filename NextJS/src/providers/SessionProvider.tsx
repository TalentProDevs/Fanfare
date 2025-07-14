"use client"; // This is a Client Component

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export const NextAuthSessionProviders = ({ children }: { children: ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
