import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@heroui/react";
import Layout from "@/components/layout";
import "@/styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <HeroUIProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </HeroUIProvider>
    </SessionProvider>
  );
}
