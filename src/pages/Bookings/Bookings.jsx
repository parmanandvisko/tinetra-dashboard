import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ExportButton from '../../components/ui/ExportButton'
import { formatDate } from '../../utils/exportExcel'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

export default function Bookings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    const q = new URLSearchParams({ limit: 1000, ...(filterStatus && { status: filterStatus }), ...(search && { search }) })
    api.get(`/bookings?${q}`).then((r) => setItems(r.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatus, search])

  const updateStatus = async (id, status) => {
    try { await api.put(`/bookings/${id}`, { status }); toast.success('Status updated'); load(); if (selected?._id === id) setSelected((p) => ({ ...p, status })) }
    catch { toast.error('Failed') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this booking?')) return
    try { await api.delete(`/bookings/${id}`); toast.success('Deleted'); load(); setSelected(null) }
    catch { toast.error('Failed') }
  }
  const exportColumns = [
    { label: 'ID', value: (item) => item._id },
    { label: 'Name', value: (item) => item.name },
    { label: 'Email', value: (item) => item.email },
    { label: 'Phone', value: (item) => item.phone },
    { label: 'Package', value: (item) => item.packageTitle || item.package?.title },
    { label: 'Travel Date', value: (item) => item.travelDate ? new Date(item.travelDate).toLocaleDateString() : '' },
    { label: 'Adults', value: (item) => item.adults },
    { label: 'Children', value: (item) => item.children },
    { label: 'Status', value: (item) => item.status },
    { label: 'Payment Status', value: (item) => item.paymentStatus },
    { label: 'Total Amount', value: (item) => item.totalAmount },
    { label: 'Notes', value: (item) => item.notes },
    { label: 'Created At', value: (item) => formatDate(item.createdAt) },
    { label: 'Updated At', value: (item) => formatDate(item.updatedAt) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input w-full sm:w-60" />
          <ExportButton filename="bookings" rows={items} columns={exportColumns} disabled={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name', 'Package', 'Date', 'Guests', 'Status', 'Payment', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
                  : items.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No bookings found</td></tr>
                  : items.map((item) => (
                    <tr key={item._id} onClick={() => setSelected(item)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?._id === item._id ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.packageTitle || item.package?.title || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.travelDate ? new Date(item.travelDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.adults}A {item.children > 0 ? `${item.children}C` : ''}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>{item.status}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : item.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{item.paymentStatus}</span></td>
                      <td className="px-4 py-3"><button onClick={(e) => { e.stopPropagation(); remove(item._id) }} className="text-xs text-red-500 hover:text-red-700">✕</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="card p-5 lg:col-span-1">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">Select a booking</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Booking Details</h3>
              <div className="space-y-2 text-sm">
                {[['Name', selected.name], ['Email', selected.email], ['Phone', selected.phone], ['Package', selected.packageTitle || selected.package?.title || '—'], ['Travel Date', selected.travelDate ? new Date(selected.travelDate).toLocaleDateString() : '—'], ['Adults', selected.adults], ['Children', selected.children], ['Total', selected.totalAmount ? `$${selected.totalAmount}` : '—']].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
              {selected.notes && <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">{selected.notes}</div>}
              <div>
                <label className="label">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
                    <button key={s} onClick={() => updateStatus(selected._id, s)} className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${selected.status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Payment Status</label>
                <div className="flex gap-2">
                  {['unpaid', 'partial', 'paid'].map((s) => (
                    <button key={s} onClick={() => api.put(`/bookings/${selected._id}`, { paymentStatus: s }).then(() => { toast.success('Updated'); load(); setSelected((p) => ({ ...p, paymentStatus: s })) })} className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${selected.paymentStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => remove(selected._id)} className="btn-danger w-full text-center">Delete Booking</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
