import { useLocation } from 'react-router-dom'

const titles = {
  dashboard: 'Dashboard',
  packages: 'Tour Packages',
  destinations: 'Destinations',
  blogs: 'Blog Management',
  categories: 'Categories',
  contacts: 'Contact Messages',
  bookings: 'Bookings',
}

export default function Header() {
  const { pathname } = useLocation()
  const key = pathname.split('/')[1] || 'dashboard'
  const title = titles[key] || 'Admin Panel'
  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}')

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400">Trinetra Admin Panel</p>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          View Site
        </a>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
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
