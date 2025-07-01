import '../styles/globals.css';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps, router }) {
  const isAppPage = router.pathname.startsWith('/app');

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {isAppPage ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionContextProvider>
  );
}

function MyAppWrapper(props) {
  const router = useRouter();
  return <MyApp {...props} router={router} />;
}

export default MyAppWrapper;
