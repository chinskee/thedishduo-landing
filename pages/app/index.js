import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import InputForm from '../../components/InputField';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data?.recipes?.length) {
        localStorage.setItem('fetchedRecipes', JSON.stringify(data));
        router.push('/swipe');
      } else {
        alert('No recipes found.');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Something went wrong.');
    }
  };

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
        style={{
          paddingTop: '12px',                            // offset for fixed header (reduced)
          paddingBottom: 'env(safe-area-inset-bottom)',  // mobile safe-area
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <InputForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}