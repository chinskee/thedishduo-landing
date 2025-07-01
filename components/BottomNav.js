// components/BottomNav.js
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function BottomNav() {
  const router = useRouter();

  const tabs = [
    { label: 'Home', href: '/app', icon: '🏠' },
    { label: 'List', href: '/app/shopping-list', icon: '📝' },
    { label: 'Swipe', href: '/app/swipe', icon: '🍽️' },
    { label: 'Saved', href: '/app/saved', icon: '❤️' },
    { label: 'Settings', href: '/app/settings', icon: '⚙️' }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-32">
          <Link href="/">
            <img
              src="/DishDuoLogo.png"
              alt="DishDuo Logo"
              width={120}
              height={120}
            />
          </Link>
        </div>
      </header>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
        <div className="max-w-md mx-auto flex justify-around">
          {tabs.map((tab) => {
            const active = router.pathname === tab.href;
            return (
              <Link
                href={tab.href}
                key={tab.label}
                className="flex flex-col items-center py-2"
              >
                <span className={`text-xl ${active ? 'text-primary' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                <span className={`text-xs mt-1 ${active ? 'block text-primary' : 'hidden'}`}>
                  {tab.label}
                </span>
                <span className={`h-1 w-1 rounded-full mt-1 ${active ? 'bg-primary' : 'bg-transparent'}`} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}