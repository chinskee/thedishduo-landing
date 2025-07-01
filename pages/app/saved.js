import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function Saved() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const [savedRecipes, setSavedRecipes] = useState([])

  useEffect(() => {
    const fetchSaved = async () => {
      if (!session?.user) return
      const { data, error } = await supabase
        .from('liked_recipes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved recipes:', error)
      } else {
        setSavedRecipes(data)
      }
    }

    fetchSaved()
  }, [session])

  return (
    <div className="w-full max-w-[350px] mx-auto pt-32 px-4 pb-24 space-y-4">
      {savedRecipes.length === 0 ? (
        <p className="text-center text-gray-500">No saved recipes found.</p>
      ) : (
        savedRecipes.map((recipe) => (
          <div key={recipe.id} className="relative group">
            <Link href={`/saved/${recipe.id}`}>
              <div className="bg-white rounded-xl shadow-card p-6 space-y-4 cursor-pointer hover:opacity-90">
                <h2 className="text-2xl font-bold text-neutralDark">{recipe.title}</h2>
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-xl"
                />
                <p className="text-base text-neutralDark">
                  Ready in {recipe.readyinminutes} min
                </p>
                <div
                  className="text-base text-neutralDark leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                />
              </div>
            </Link>
            <button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                await supabase.from('liked_recipes').delete().eq('id', recipe.id)
                setSavedRecipes(savedRecipes.filter((r) => r.id !== recipe.id))
              }}
              className="absolute top-4 right-4 p-2 bg-red-100 rounded-full hover:bg-red-200 shadow-card"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5 text-red-600" />
            </button>
          </div>
        ))
      )}
    </div>
  )
}