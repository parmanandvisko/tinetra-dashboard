import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ExportButton from '../../components/ui/ExportButton'
import { formatDate } from '../../utils/exportExcel'

const statusColors = { new: 'bg-blue-100 text-blue-700', read: 'bg-gray-100 text-gray-600', replied: 'bg-green-100 text-green-700' }

export default function Contacts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  const load = () => {
    setLoading(true)
    api.get(`/contacts?limit=1000${filterStatus ? `&status=${filterStatus}` : ''}`)
      .then((r) => setItems(r.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatus])

  const updateStatus = async (id, status) => {
    try { await api.put(`/contacts/${id}`, { status }); toast.success('Status updated'); load(); if (selected?._id === id) setSelected((p) => ({ ...p, status })) }
    catch { toast.error('Failed') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this message?')) return
    try { await api.delete(`/contacts/${id}`); toast.success('Deleted'); load(); if (selected?._id === id) setSelected(null) }
    catch { toast.error('Failed') }
  }
  const exportColumns = [
    { label: 'ID', value: (item) => item._id },
    { label: 'Name', value: (item) => item.name },
    { label: 'Email', value: (item) => item.email },
    { label: 'Phone', value: (item) => item.phone },
    { label: 'Subject', value: (item) => item.subject },
    { label: 'Message', value: (item) => item.message },
    { label: 'Status', value: (item) => item.status },
    { label: 'Created At', value: (item) => formatDate(item.createdAt) },
    { label: 'Updated At', value: (item) => formatDate(item.updatedAt) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['', 'new', 'read', 'replied'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <ExportButton filename="contacts" rows={items} columns={exportColumns} disabled={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="card overflow-hidden lg:col-span-1">
          <div className="divide-y divide-gray-50 max-h-[calc(100vh-220px)] overflow-y-auto">
            {loading ? <p className="p-6 text-center text-gray-400">Loading...</p>
              : items.length === 0 ? <p className="p-6 text-center text-gray-400">No messages</p>
              : items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => { setSelected(item); if (item.status === 'new') updateStatus(item._id, 'read') }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?._id === item._id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 truncate">{item.email}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.subject || item.message}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors[item.status]}`}>{item.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Detail */}
        <div className="card p-6 lg:col-span-2">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-5xl mb-3">✉️</div>
              <p className="text-sm">Select a message to view</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
                  <p className="text-sm text-gray-500">{selected.email} {selected.phone && `· ${selected.phone}`}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
              </div>
              {selected.subject && <p className="text-sm font-semibold text-gray-700 mb-3">Subject: {selected.subject}</p>}
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-5">{selected.message}</div>
              <p className="text-xs text-gray-400 mb-5">{new Date(selected.createdAt).toLocaleString()}</p>
              <div className="flex flex-wrap gap-2">
                {['new', 'read', 'replied'].map((s) => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)} disabled={selected.status === s} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${selected.status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Mark as {s}
                  </button>
                ))}
                <button onClick={() => remove(selected._id)} className="btn-danger ml-auto">Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
