import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const EMPTY = { title: '', excerpt: '', content: '', image: '', author: 'Admin', status: 'draft', readTime: '5 min read', tags: '' }

export default function AdminBlogs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get(`/blogs?limit=50${search ? `&search=${search}` : ''}`).then((r) => setItems(r.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ ...item, tags: (item.tags || []).join(', ') }); setModal(true) }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }
    try {
      if (editing) { await api.put(`/blogs/${editing._id}`, payload); toast.success('Updated') }
      else { await api.post('/blogs', payload); toast.success('Created') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this blog?')) return
    try { await api.delete(`/blogs/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs..." className="input w-64" />
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><span className="text-lg">+</span> New Blog</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Title', 'Author', 'Status', 'Read Time', 'Date', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              : items.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No blogs yet</td></tr>
              : items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-10 h-8 object-cover rounded-lg" />}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{item.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.author}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.readTime}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                      <button onClick={() => remove(item._id)} className="text-xs text-red-600 font-semibold hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Blog' : 'New Blog Post'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => f('title', e.target.value)} required /></div>
              <div><label className="label">Excerpt *</label><textarea rows={2} className="input resize-none" value={form.excerpt} onChange={(e) => f('excerpt', e.target.value)} required /></div>
              <div><label className="label">Content *</label><textarea rows={6} className="input resize-none" value={form.content} onChange={(e) => f('content', e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Author</label><input className="input" value={form.author} onChange={(e) => f('author', e.target.value)} /></div>
                <div><label className="label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => f('status', e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Read Time</label><input className="input" value={form.readTime} onChange={(e) => f('readTime', e.target.value)} placeholder="5 min read" /></div>
                <div><label className="label">Tags (comma-separated)</label><input className="input" value={form.tags} onChange={(e) => f('tags', e.target.value)} placeholder="travel, tips..." /></div>
              </div>
              <div><label className="label">Image URL</label><input className="input" value={form.image} onChange={(e) => f('image', e.target.value)} placeholder="https://..." /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : editing ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
