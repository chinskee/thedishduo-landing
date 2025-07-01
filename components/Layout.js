import { useRouter } from 'next/router';
import BottomNav from './BottomNav';
import SidebarNav from './SidebarNav';

export default function Layout({ children }) {
  const router = useRouter();
  const isLandingPage = router.pathname === '/';
  const isAppPage = router.pathname.startsWith('/app');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900">
      {/* Sidebar for app pages on desktop */}
      {isAppPage && (
        <div className="hidden md:flex md:w-64 bg-white border-r shadow-md">
          <SidebarNav />
        </div>
      )}

      {/* Main content */}
      <main
        className={`flex-1 p-4 md:p-8 ${
          isAppPage ? 'flex flex-col items-center justify-center' : ''
        }`}
      >
        {children}
      </main>

      {/* Bottom nav for app pages on mobile */}
      {isAppPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
