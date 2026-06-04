import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ImageUploadField from '../../components/form/ImageUploadField'

const EMPTY = { title: '', duration: '', price: '', originalPrice: '', type: 'international', tag: '', description: '', image: '', isFeature: false, isActive: true }

export default function Packages() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/packages?limit=50${search ? `&search=${search}` : ''}`)
      .then((r) => setItems(r.data.data))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ ...item, price: String(item.price), originalPrice: String(item.originalPrice || '') }); setModal(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) { await api.put(`/packages/${editing._id}`, form); toast.success('Package updated') }
      else { await api.post('/packages', form); toast.success('Package created') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this package?')) return
    try { await api.delete(`/packages/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search packages..." className="input w-64" />
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add Package
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Title', 'Type', 'Duration', 'Price', 'Featured', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No packages found</td></tr>
              ) : items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-10 h-8 object-cover rounded-lg" />}
                      <span className="font-medium text-gray-900 line-clamp-1">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="capitalize text-gray-600">{item.type}</span></td>
                  <td className="px-4 py-3 text-gray-600">{item.duration}</td>
                  <td className="px-4 py-3 font-semibold text-primary">${item.price}</td>
                  <td className="px-4 py-3">{item.isFeature ? <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:underline font-semibold">Edit</button>
                      <button onClick={() => remove(item._id)} className="text-xs text-red-600 hover:underline font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Package' : 'Add Package'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => f('title', e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Duration *</label><input className="input" value={form.duration} onChange={(e) => f('duration', e.target.value)} placeholder="5 Days / 4 Nights" required /></div>
                <div><label className="label">Type</label>
                  <select className="input" value={form.type} onChange={(e) => f('type', e.target.value)}>
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Price ($) *</label><input type="number" className="input" value={form.price} onChange={(e) => f('price', e.target.value)} required /></div>
                <div><label className="label">Original Price ($)</label><input type="number" className="input" value={form.originalPrice} onChange={(e) => f('originalPrice', e.target.value)} /></div>
              </div>
              <div><label className="label">Tag</label><input className="input" value={form.tag} onChange={(e) => f('tag', e.target.value)} placeholder="Hill Stations, Beach..." /></div>
              <ImageUploadField label="Image" value={form.image} onChange={(url) => f('image', url)} />
              <div><label className="label">Description</label><textarea rows={3} className="input resize-none" value={form.description} onChange={(e) => f('description', e.target.value)} /></div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isFeature} onChange={(e) => f('isFeature', e.target.checked)} className="accent-primary" /> Featured</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => f('isActive', e.target.checked)} className="accent-primary" /> Active</label>
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
