import { useEffect, useState } from 'react'
import api from '../../services/api'

const statCards = [
  { key: 'bookings', label: 'Total Bookings', color: 'bg-blue-500', icon: '📋' },
  { key: 'destinations', label: 'Destinations', color: 'bg-green-500', icon: '🌍' },
  { key: 'packages', label: 'Tour Packages', color: 'bg-purple-500', icon: '📦' },
  { key: 'blogs', label: 'Blog Posts', color: 'bg-orange-500', icon: '✍️' },
  { key: 'contacts', label: 'Total Contacts', color: 'bg-pink-500', icon: '✉️' },
  { key: 'newContacts', label: 'New Messages', color: 'bg-red-500', icon: '🔔' },
  { key: 'pendingBookings', label: 'Pending Bookings', color: 'bg-indigo-500', icon: '⏳' },
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, color, icon }) => (
          <div key={key} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-lg`}>{icon}</div>
              <span className="text-2xl font-bold text-gray-900">{data?.stats?.[key] ?? 0}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Bookings</h3>
            <a href="/bookings" className="text-xs text-primary font-semibold hover:underline">View All</a>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.recentBookings || []).length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">No bookings yet</p>
            ) : (
              data.recentBookings.map((b) => (
                <div key={b._id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.packageTitle || b.package?.title || '—'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{b.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Messages</h3>
            <a href="/contacts" className="text-xs text-primary font-semibold hover:underline">View All</a>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.recentContacts || []).length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">No messages yet</p>
            ) : (
              data.recentContacts.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{c.subject || c.message}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    c.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    c.status === 'read' ? 'bg-gray-100 text-gray-600' :
                    'bg-green-100 text-green-700'
                  }`}>{c.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
