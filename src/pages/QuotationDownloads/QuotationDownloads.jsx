import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ExportButton from '../../components/ui/ExportButton'
import { formatDate } from '../../utils/exportExcel'

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-green-100 text-green-700',
}

const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

export default function QuotationDownloads() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    const query = new URLSearchParams({
      limit: 1000,
      ...(status && { status }),
      ...(search && { search }),
    })

    api.get(`/quotation-downloads?${query}`)
      .then((response) => setItems(response.data.data))
      .catch(() => toast.error('Failed to load quotation downloads'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status, search])

  const updateStatus = async (item, nextStatus) => {
    try {
      await api.put(`/quotation-downloads/${item._id}`, { status: nextStatus })
      toast.success('Status updated')
      setSelected((current) => current?._id === item._id ? { ...current, status: nextStatus } : current)
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const remove = async (item) => {
    if (!confirm('Delete this quotation download record?')) return
    try {
      await api.delete(`/quotation-downloads/${item._id}`)
      toast.success('Record deleted')
      if (selected?._id === item._id) setSelected(null)
      load()
    } catch {
      toast.error('Failed to delete record')
    }
  }

  const exportColumns = [
    { label: 'ID', value: (item) => item._id },
    { label: 'Mobile Number', value: (item) => item.phone },
    { label: 'Package', value: (item) => item.packageTitle },
    { label: 'Duration', value: (item) => item.packageDuration },
    { label: 'Price Per Person', value: (item) => item.packagePrice },
    { label: 'Package Type', value: (item) => item.packageType },
    { label: 'Status', value: (item) => item.status },
    { label: 'Source URL', value: (item) => item.sourceUrl },
    { label: 'Downloaded At', value: (item) => formatDate(item.createdAt) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          {['', 'new', 'contacted'].map((itemStatus) => (
            <button
              key={itemStatus}
              type="button"
              onClick={() => setStatus(itemStatus)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${
                status === itemStatus
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-primary'
              }`}
            >
              {itemStatus || 'All'}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search mobile or package..."
            className="input w-full sm:w-64"
          />
          <ExportButton filename="quotation-downloads" rows={items} columns={exportColumns} disabled={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Mobile Number', 'Package', 'Costing', 'Downloaded At', 'Status', ''].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No quotation downloads found</td></tr>
                ) : items.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelected(item)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${selected?._id === item._id ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <a href={`tel:${item.phone}`} onClick={(event) => event.stopPropagation()} className="font-semibold text-primary hover:underline">
                        {item.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.packageTitle}</p>
                      <p className="text-xs capitalize text-gray-400">{item.packageDuration} {item.packageType && `- ${item.packageType}`}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{formatPrice(item.packagePrice)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); remove(item) }}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          {!selected ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-gray-400">
              <svg className="mb-3 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M5 4h14a2 2 0 012 2v14H3V6a2 2 0 012-2z" />
              </svg>
              <p className="text-sm">Select a quotation download</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Quotation Lead</p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">{selected.packageTitle}</h3>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  ['Mobile Number', selected.phone],
                  ['Duration', selected.packageDuration || '-'],
                  ['Cost Per Person', formatPrice(selected.packagePrice)],
                  ['Package Type', selected.packageType || '-'],
                  ['Downloaded At', new Date(selected.createdAt).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-right font-medium capitalize text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              <a href={`tel:${selected.phone}`} className="btn-primary block w-full text-center">
                Call Customer
              </a>

              <div>
                <label className="label">Lead Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['new', 'contacted'].map((itemStatus) => (
                    <button
                      key={itemStatus}
                      type="button"
                      onClick={() => updateStatus(selected, itemStatus)}
                      className={`rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
                        selected.status === itemStatus
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {itemStatus}
                    </button>
                  ))}
                </div>
              </div>

              {selected.sourceUrl && (
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="block text-center text-sm font-semibold text-primary hover:underline">
                  Open Package Page
                </a>
              )}
              <button type="button" onClick={() => remove(selected)} className="btn-danger w-full">
                Delete Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
