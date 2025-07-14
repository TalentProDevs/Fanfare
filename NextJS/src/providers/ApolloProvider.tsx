"use client"; // This is a Client Component

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/shared/utils";

export const ApolloProviders = ({ children }: { children: ReactNode }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
