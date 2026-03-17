import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <FileQuestion className="w-10 h-10 text-gray-400" aria-hidden="true" />
      </div>
      <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Page non trouvee</h2>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-sm">
        La page que vous recherchez n'existe pas ou a ete deplacee.
      </p>
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
      >
        Retour aux projets
      </Link>
    </div>
  )
}
