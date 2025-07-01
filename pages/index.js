import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900 w-full max-w-full">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="text-2xl font-bold text-indigo-600">DishDuo</div>
        <div className="space-x-4">
          <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">Sign Up</Link>
          <Link href="/app" className="text-gray-700 font-semibold hover:underline">App</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 md:px-12 text-center bg-indigo-50 min-h-screen">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-indigo-700">
          Simplify Mealtime Decisions Instantly
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl text-indigo-600">
          Get AI-powered recipe ideas, meal plans, and grocery lists based on what you already have.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Link href="/signup" className="bg-indigo-700 text-white px-8 py-3 rounded-lg w-full sm:w-auto hover:bg-indigo-800 transition">
            Get Started
          </Link>
          <Link href="/app" className="border border-indigo-700 text-indigo-700 px-8 py-3 rounded-lg w-full sm:w-auto hover:bg-indigo-100 transition">
            Try Demo
          </Link>
        </div>
        <div className="mt-12 w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            src="/media/dishduo-demo.mp4"
            controls
            className="w-full h-full object-cover"
            poster="/media/dishduo-demo-poster.jpg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 md:px-12 bg-white text-center max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Why is meal planning so hard?</h2>
        <p className="text-gray-700 text-lg max-w-3xl mx-auto">
          Endless debates about what to eat, last-minute grocery runs, and wasted ingredients. Meal planning shouldn't be a chore.
        </p>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 md:px-12 bg-indigo-50 text-center max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700">DishDuo makes meal planning effortless</h2>
        <p className="text-indigo-600 text-lg max-w-3xl mx-auto mb-12">
          Swipe through AI-curated recipes with your partner, save your favorites, and get an automatic shopping list tailored to your tastes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-xl mb-2 text-indigo-800">Swipe to Plan</h3>
            <p className="text-indigo-700">A fun, collaborative interface that makes meal planning a breeze.</p>
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-2 text-indigo-800">Save Favorites</h3>
            <p className="text-indigo-700">Keep all your loved meals in one shared list with your partner.</p>
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-2 text-indigo-800">Auto Shopping List</h3>
            <p className="text-indigo-700">Get a smart grocery list with exactly what you need, no extras.</p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-6 md:px-12 bg-white text-center max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">See it in action</h2>
        <p className="text-gray-700 text-lg mb-8 max-w-3xl mx-auto">
          Watch how DishDuo transforms your meal planning experience.
        </p>
        <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            src="/media/dishduo-demo.mp4"
            controls
            className="w-full h-full object-cover"
            poster="/media/dishduo-demo-poster.jpg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 md:px-12 bg-indigo-50 text-center max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700">Simple pricing for every duo</h2>
        <p className="text-indigo-600 mb-12 max-w-3xl mx-auto">Start cooking smarter today.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <div className="border border-indigo-300 rounded-xl bg-white p-8 flex flex-col items-center shadow-md">
            <h3 className="text-2xl font-semibold mb-2 text-indigo-800">Free Taste</h3>
            <p className="text-4xl font-bold mb-6 text-indigo-900">Free</p>
            <ul className="text-indigo-700 mb-8 space-y-3 text-left w-full max-w-xs">
              <li>✔ Swipe recipes</li>
              <li>✔ Save favorites</li>
              <li>✔ Auto shopping list</li>
            </ul>
            <button className="bg-indigo-700 text-white px-8 py-3 rounded-lg w-full hover:bg-indigo-800 transition">
              Start Free
            </button>
          </div>
          <div className="border border-indigo-300 rounded-xl bg-white p-8 flex flex-col items-center shadow-md">
            <h3 className="text-2xl font-semibold mb-2 text-indigo-800">Pro Chef</h3>
            <p className="text-4xl font-bold mb-6 text-indigo-900">£4/mo</p>
            <ul className="text-indigo-700 mb-8 space-y-3 text-left w-full max-w-xs">
              <li>✔ Everything in Free Taste</li>
              <li>✔ Shared plans</li>
              <li>✔ Recipe recommendations</li>
              <li>✔ No ads</li>
            </ul>
            <button className="bg-indigo-700 text-white px-8 py-3 rounded-lg w-full hover:bg-indigo-800 transition">
              Go Pro
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-12 bg-white max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10 text-gray-900">Features</h2>
        <div className="flex flex-col md:flex-row justify-center gap-16 max-w-5xl mx-auto">
          <div className="max-w-xs">
            <div className="mb-4 text-indigo-700 text-5xl">🍳</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-800">Smart Recipes</h3>
            <p className="text-gray-700">
              AI-curated recipes tailored to your pantry and preferences.
            </p>
          </div>
          <div className="max-w-xs">
            <div className="mb-4 text-indigo-700 text-5xl">📅</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-800">Meal Planning</h3>
            <p className="text-gray-700">
              Effortlessly plan meals together with your partner.
            </p>
          </div>
          <div className="max-w-xs">
            <div className="mb-4 text-indigo-700 text-5xl">🛒</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-800">Smart Grocery Lists</h3>
            <p className="text-gray-700">
              Automatically generated shopping lists that minimize waste.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-6 md:px-12 bg-indigo-50 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10 text-indigo-700">Why Choose DishDuo?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-16 max-w-5xl mx-auto">
          <div className="max-w-xs">
            <div className="mb-4 text-indigo-700 text-5xl">⏰</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-800">Cook Smarter</h3>
            <p className="text-indigo-700">
              Save time with quick meal planning and AI-powered suggestions.
            </p>
          </div>
          <div className="max-w-xs">
            <div className="mb-4 text-indigo-700 text-5xl">♻️</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-800">Reduce Food Waste</h3>
            <p className="text-indigo-700">
              Use what you have and avoid buying unnecessary ingredients.
            </p>
          </div>
          <div className="max-w-xs">
            <div className="mb-4 text-indigo-700 text-5xl">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-800">Tailored for You</h3>
            <p className="text-indigo-700">
              Personalized meal plans that fit your tastes and dietary needs.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 md:px-12 bg-white max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-900">What Our Users Say</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-indigo-50 p-8 rounded-lg shadow-md">
            <p className="text-indigo-700 italic mb-4">
              “DishDuo made cooking fun again and saved me hours every week!”
            </p>
            <p className="font-semibold text-indigo-900">Jamie, Busy Parent</p>
          </div>
          <div className="bg-indigo-50 p-8 rounded-lg shadow-md">
            <p className="text-indigo-700 italic mb-4">
              “Planning meals with DishDuo has brought me and my partner closer.”
            </p>
            <p className="font-semibold text-indigo-900">Morgan, Couple</p>
          </div>
          <div className="bg-indigo-50 p-8 rounded-lg shadow-md">
            <p className="text-indigo-700 italic mb-4">
              “The shopping list feature is a game-changer for our busy lifestyle.”
            </p>
            <p className="font-semibold text-indigo-900">Taylor, Professional Chef</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 bg-indigo-50 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-indigo-700">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-8 text-left">
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">Is DishDuo free to use?</h4>
            <p className="text-indigo-800">
              Yes! You can use the basic features for free, forever.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">Can I use it solo?</h4>
            <p className="text-indigo-800">
              Absolutely! DishDuo works great for singles, but it shines when used with a partner.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">Do I need to install anything?</h4>
            <p className="text-indigo-800">
              No installation needed. DishDuo is a web app accessible on any device.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 md:px-12 bg-indigo-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Cook Smarter?</h2>
        <p className="mb-8 max-w-3xl mx-auto">
          Join home cooks transforming their kitchens with DishDuo.
        </p>
        <Link href="/signup" className="bg-white text-indigo-700 px-10 py-4 text-lg rounded-xl font-semibold hover:bg-indigo-100 transition">
          Get Started
        </Link>
      </section>
    </div>
  )
}
