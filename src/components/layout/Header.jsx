import { useLocation } from 'react-router-dom'

const titles = {
  dashboard: 'Dashboard', packages: 'Tour Packages', destinations: 'Destinations',
  blogs: 'Blog Management', categories: 'Categories', contacts: 'Contact Messages',
  bookings: 'Bookings', searches: 'Website Searches', theme: 'Theme Settings',
}

export default function Header({ onMenuToggle }) {
  const { pathname } = useLocation()
  const key = pathname.split('/')[1] || 'dashboard'
  const title = titles[key] || 'Admin Panel'
  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}')

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">Trinetra Admin Panel</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </a>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(admin.name || 'A')[0].toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{admin.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 leading-tight capitalize">{admin.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
