import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ImageUploadField from '../../components/form/ImageUploadField'
import ExportButton from '../../components/ui/ExportButton'
import { formatDate } from '../../utils/exportExcel'

const EMPTY = { name: '', subtitle: '', country: '', category: 'international', description: '', image: '', isFeature: false, isActive: true, rating: 4.5 }

export default function Destinations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/destinations?limit=1000').then((r) => setItems(r.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (item) => { setEditing(item); setForm(item); setModal(true) }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { await api.put(`/destinations/${editing._id}`, form); toast.success('Updated') }
      else { await api.post('/destinations', form); toast.success('Created') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete?')) return
    try { await api.delete(`/destinations/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const exportColumns = [
    { label: 'ID', value: (item) => item._id },
    { label: 'Name', value: (item) => item.name },
    { label: 'Subtitle', value: (item) => item.subtitle },
    { label: 'Country', value: (item) => item.country },
    { label: 'Category', value: (item) => item.category },
    { label: 'Description', value: (item) => item.description },
    { label: 'Image', value: (item) => item.image },
    { label: 'Rating', value: (item) => item.rating },
    { label: 'Featured', value: (item) => item.isFeature ? 'Yes' : 'No' },
    { label: 'Active', value: (item) => item.isActive ? 'Yes' : 'No' },
    { label: 'Created At', value: (item) => formatDate(item.createdAt) },
    { label: 'Updated At', value: (item) => formatDate(item.updatedAt) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <ExportButton filename="destinations" rows={items} columns={exportColumns} disabled={loading} />
        <button onClick={openCreate} className="btn-primary flex items-center justify-center gap-2"><span className="text-lg">+</span> Add Destination</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-400 col-span-3 text-center py-10">Loading...</p>
          : items.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-10">No destinations yet</p>
          : items.map((item) => (
            <div key={item._id} className="card overflow-hidden group">
              <div className="relative h-36">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl">🌍</div>}
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.isFeature && <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.subtitle} · {item.country}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{item.category}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                    <button onClick={() => remove(item._id)} className="text-xs text-red-600 font-semibold hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Destination' : 'Add Destination'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={save} className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => f('name', e.target.value)} required /></div>
                <div><label className="label">Subtitle *</label><input className="input" value={form.subtitle} onChange={(e) => f('subtitle', e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Country *</label><input className="input" value={form.country} onChange={(e) => f('country', e.target.value)} required /></div>
                <div><label className="label">Category</label>
                  <select className="input" value={form.category} onChange={(e) => f('category', e.target.value)}>
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>
              <ImageUploadField label="Image" value={form.image} onChange={(url) => f('image', url)} />
              <div><label className="label">Description</label><textarea rows={3} className="input resize-none" value={form.description} onChange={(e) => f('description', e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Rating</label><input type="number" step="0.1" min="0" max="5" className="input" value={form.rating} onChange={(e) => f('rating', e.target.value)} /></div>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isFeature} onChange={(e) => f('isFeature', e.target.checked)} className="accent-primary" /> Featured</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => f('isActive', e.target.checked)} className="accent-primary" /> Active</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
