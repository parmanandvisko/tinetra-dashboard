import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const EMPTY = { name: '', description: '', type: 'general', isActive: true }
const types = ['general', 'blog', 'package', 'destination']

export default function Categories() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/categories').then((r) => setItems(r.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (item) => { setEditing(item); setForm(item); setModal(true) }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { await api.put(`/categories/${editing._id}`, form); toast.success('Updated') }
      else { await api.post('/categories', form); toast.success('Created') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete?')) return
    try { await api.delete(`/categories/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><span className="text-lg">+</span> Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-400 col-span-3 text-center py-10">Loading...</p>
          : items.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-10">No categories yet</p>
          : items.map((item) => (
            <div key={item._id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.slug}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  item.type === 'blog' ? 'bg-blue-100 text-blue-700' :
                  item.type === 'package' ? 'bg-purple-100 text-purple-700' :
                  item.type === 'destination' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{item.type}</span>
              </div>
              {item.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(item)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                  <button onClick={() => remove(item._id)} className="text-xs text-red-600 font-semibold hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => f('name', e.target.value)} required /></div>
              <div><label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => f('type', e.target.value)}>
                  {types.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div><label className="label">Description</label><textarea rows={2} className="input resize-none" value={form.description} onChange={(e) => f('description', e.target.value)} /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => f('isActive', e.target.checked)} className="accent-primary" /> Active</label>
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
