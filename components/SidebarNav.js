import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

const navItems = [
  { href: '/app', label: 'Home', icon: '🏠' },
  { href: '/app/shopping-list', label: 'List', icon: '📝' },
  { href: '/app/swipe', label: 'Swipe', icon: '🍽️' },
  { href: '/app/saved', label: 'Saved', icon: '❤️' },
  { href: '/app/settings', label: 'Settings', icon: '⚙️' },
]

export default function SidebarNav() {
  const router = useRouter()

  return (
    <aside className="flex flex-col w-full md:w-64 min-h-screen bg-white border-r shadow-md px-4 py-6">
      <Link href="/">
        <div className="mb-8 p-4 bg-white rounded-xl shadow-card flex items-center space-x-3">
          <Image src="/DishDuoLogo.png" alt="DishDuo Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-primary">DishDuo</span>
        </div>
      </Link>
      <nav className="space-y-4">
        {navItems.map(({ href, label, icon }) => (
          <Link key={href} href={href}>
            <div
              className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer hover:bg-purple-100 transition ${
                router.pathname === href ? 'bg-purple-200 font-semibold' : ''
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  )
}