import { HeroUIProvider } from '@heroui/react'
import Layout from '@/components/layout';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <HeroUIProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </HeroUIProvider>
  );
}
