import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>DishDuo – Swipe, Save & Savor Together</title>
        <meta name="description" content="Swipe recipes with your partner, save favorites, and get automatic grocery lists—DishDuo makes meal planning fun." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bg-gradient-to-br from-primary to-purple-600 text-white flex flex-col">
        {/* Navigation */}
        <nav className="container mx-auto flex justify-between items-center py-6">
          <div className="flex items-center space-x-2">
            <img src="/assets/logo.png" alt="DishDuo logo" className="h-12 w-auto" />
            <span className="text-2xl font-bold text-white">DishDuo</span>
          </div>
          <div className="space-x-4">
            <a
              href="#demo"
              className="inline-block px-4 py-2 rounded-full bg-white/20 text-white font-medium hover:bg-white/40 transition"
            >
              Demo
            </a>
            <Link
              href="/signup"
              className="inline-block px-4 py-2 rounded-full bg-white/20 text-white font-medium hover:bg-white/40 transition"
            >
              Waitlist
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center py-20" style={{minHeight: '100vh'}}>
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
              Swipe, Save, and Savor<br/>Recipes Together
            </h1>
            <p className="text-lg sm:text-xl mb-8">
              AI-powered meal planning that’s fun and collaborative—just like Tinder, but for recipes.
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 gap-4 justify-center md:justify-start items-center">
              <a
                href="https://apps.apple.com/"
                className="inline-flex bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                App Store
              </a>
              <a
                href="https://play.google.com/"
                className="inline-flex bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Google Play
              </a>
            </div>
          </div>
          <div id="demo" className="md:w-1/2 mt-12 md:mt-0">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <video
                src="/media/dishduo-demo.mp4"
                controls
                poster="/media/dishduo-demo-poster.jpg"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Features You’ll Love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-lg">
              <img src="/assets/swipe.png" alt="Swipe to Plan" className="mx-auto h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Swipe to Plan</h3>
              <p className="text-gray-600">Quickly browse AI-curated recipes with simple swipes.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg">
              <img src="/assets/logo.png" alt="Save Favorites" className="mx-auto h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
              <p className="text-gray-600">Keep all your go-to recipes in one shared list.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg">
              <img src="/assets/shopping.png" alt="Auto Shopping List" className="mx-auto h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Auto Shopping List</h3>
              <p className="text-gray-600">Get a smart grocery list tailored to your picks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What Our Users Say</h2>
          <div className="relative overflow-hidden">
            <div className="flex space-x-8 snap-x snap-mandatory overflow-x-auto scrollbar-hide">
              <blockquote className="snap-center bg-white p-8 rounded-lg shadow-md flex-shrink-0 w-full sm:w-1/3">
                <p className="text-gray-700 mb-4">"DishDuo transformed how my partner and I plan meals. Swiping through recipes is so fun and easy!"</p>
                <footer className="text-sm font-semibold text-gray-900">– Jamie L.</footer>
              </blockquote>
              <blockquote className="snap-center bg-white p-8 rounded-lg shadow-md flex-shrink-0 w-full sm:w-1/3">
                <p className="text-gray-700 mb-4">"The auto shopping list saves us so much time at the grocery store. Highly recommend!"</p>
                <footer className="text-sm font-semibold text-gray-900">– Alex P.</footer>
              </blockquote>
              <blockquote className="snap-center bg-white p-8 rounded-lg shadow-md flex-shrink-0 w-full sm:w-1/3">
                <p className="text-gray-700 mb-4">"Collaborative meal planning has never been this simple and enjoyable. Love DishDuo!"</p>
                <footer className="text-sm font-semibold text-gray-900">– Morgan S.</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Waitlist</h2>
          <p className="text-gray-700 mb-6">Be the first to cook smarter when we launch.</p>
          {/* Simple email form */}
          <form action="/api/signup" method="POST" className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email" name="email" required
              placeholder="Your email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Sign Up Now
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-50">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} DishDuo. All rights reserved.
          <div className="mt-2">
            <Link href="/privacy" className="mx-2 hover:underline text-gray-600">Privacy Policy</Link>
            |
            <Link href="/terms" className="mx-2 hover:underline text-gray-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
