import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ExportButton from '../../components/ui/ExportButton'
import { formatDate } from '../../utils/exportExcel'

const typeColors = {
  destination: 'bg-blue-100 text-blue-700',
  package: 'bg-green-100 text-green-700',
  general: 'bg-gray-100 text-gray-600',
}

export default function Searches() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get(`/searches?limit=1000${filterType ? `&selectedType=${filterType}` : ''}${search ? `&search=${search}` : ''}`)
      .then((r) => setItems(r.data.data))
      .catch(() => toast.error('Failed to load searches'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterType, search])

  const remove = async (id) => {
    if (!confirm('Delete this search entry?')) return
    try { await api.delete(`/searches/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }
  const exportColumns = [
    { label: 'ID', value: (item) => item._id },
    { label: 'Search Query', value: (item) => item.query },
    { label: 'Selected Name', value: (item) => item.selectedName },
    { label: 'Selected Type', value: (item) => item.selectedType },
    { label: 'Selected ID', value: (item) => item.selectedId },
    { label: 'Category', value: (item) => item.category },
    { label: 'Check In', value: (item) => item.checkIn },
    { label: 'Guests', value: (item) => item.guests },
    { label: 'Source', value: (item) => item.source },
    { label: 'Created At', value: (item) => formatDate(item.createdAt) },
    { label: 'Updated At', value: (item) => formatDate(item.updatedAt) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search query..." className="input w-full sm:w-64" />
        <div className="flex gap-2 flex-wrap">
          {['', 'destination', 'package', 'general'].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterType === t ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
              {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <ExportButton filename="searches" rows={items} columns={exportColumns} disabled={loading} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Search Query', 'Selected', 'Type', 'Check In', 'Guests', 'Date', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No searches found</td></tr>
              ) : items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.query || '-'}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-semibold line-clamp-1">{item.selectedName || '-'}</p>
                    {item.category && <p className="text-xs text-gray-400 capitalize">{item.category}</p>}
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[item.selectedType] || typeColors.general}`}>{item.selectedType}</span></td>
                  <td className="px-4 py-3 text-gray-600">{item.checkIn || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.guests || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(item._id)} className="text-xs text-red-600 font-semibold hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
