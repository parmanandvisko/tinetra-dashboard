import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ImageUploadField from '../../components/form/ImageUploadField'
import ExportButton from '../../components/ui/ExportButton'
import { formatDate } from '../../utils/exportExcel'
import { imageUrl } from '../../utils/image'

const EMPTY = {
  title: '',
  duration: '',
  price: '',
  originalPrice: '',
  discount: '',
  type: 'international',
  tag: '',
  description: '',
  inclusions: '',
  exclusions: '',
  image: '',
  isFeature: false,
  isActive: true,
}

const linesToArray = (value) => value
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)

const formatINR = (value) => Number(value || 0).toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

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
    api.get(`/packages?limit=1000${search ? `&search=${search}` : ''}`)
      .then((r) => setItems(r.data.data))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (item) => {
    setEditing(item)
    setForm({
      ...item,
      price: String(item.price),
      originalPrice: String(item.originalPrice || ''),
      discount: String(item.discount || ''),
      inclusions: (item.inclusions || []).join('\n'),
      exclusions: (item.exclusions || []).join('\n'),
    })
    setModal(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        discount: Number(form.discount) || 0,
        inclusions: linesToArray(form.inclusions),
        exclusions: linesToArray(form.exclusions),
      }
      if (editing) { await api.put(`/packages/${editing._id}`, payload); toast.success('Package updated') }
      else { await api.post('/packages', payload); toast.success('Package created') }
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
  const exportColumns = [
    { label: 'ID', value: (item) => item._id },
    { label: 'Title', value: (item) => item.title },
    { label: 'Type', value: (item) => item.type },
    { label: 'Duration', value: (item) => item.duration },
    { label: 'Price (INR)', value: (item) => formatINR(item.price) },
    { label: 'Original Price (INR)', value: (item) => item.originalPrice ? formatINR(item.originalPrice) : '' },
    { label: 'Discount (%)', value: (item) => item.discount },
    { label: 'Tag', value: (item) => item.tag },
    { label: 'Description', value: (item) => item.description },
    { label: 'Inclusions', value: (item) => (item.inclusions || []).join('\n') },
    { label: 'Exclusions', value: (item) => (item.exclusions || []).join('\n') },
    { label: 'Image', value: (item) => item.image },
    { label: 'Featured', value: (item) => item.isFeature ? 'Yes' : 'No' },
    { label: 'Active', value: (item) => item.isActive ? 'Yes' : 'No' },
    { label: 'Created At', value: (item) => formatDate(item.createdAt) },
    { label: 'Updated At', value: (item) => formatDate(item.updatedAt) },
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search packages..." className="input w-full sm:w-64" />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <ExportButton filename="packages" rows={items} columns={exportColumns} disabled={loading} />
          <button onClick={openCreate} className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none">
            <span className="text-lg leading-none">+</span> Add Package
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Title', 'Type', 'Duration', 'Price', 'Discount', 'Featured', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No packages found</td></tr>
              ) : items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={imageUrl(item.image)} alt="" className="w-10 h-8 object-cover rounded-lg" />}
                      <span className="font-medium text-gray-900 line-clamp-1">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="capitalize text-gray-600">{item.type}</span></td>
                  <td className="px-4 py-3 text-gray-600">{item.duration}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatINR(item.price)}</td>
                  <td className="px-4 py-3">{item.discount > 0 ? <span className="text-blue-700 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full">{item.discount}% Off</span> : <span className="text-gray-400 text-xs">None</span>}</td>
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
            <form onSubmit={save} className="p-4 sm:p-5 space-y-4">
              <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => f('title', e.target.value)} required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Duration *</label><input className="input" value={form.duration} onChange={(e) => f('duration', e.target.value)} placeholder="5 Days / 4 Nights" required /></div>
                <div><label className="label">Type</label>
                  <select className="input" value={form.type} onChange={(e) => f('type', e.target.value)}>
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="label">Price (₹ INR) *</label><input type="number" min="0" className="input" value={form.price} onChange={(e) => f('price', e.target.value)} required /></div>
                <div><label className="label">Original Price (₹ INR)</label><input type="number" min="0" className="input" value={form.originalPrice} onChange={(e) => f('originalPrice', e.target.value)} /></div>
                <div><label className="label">Discount (%)</label><input type="number" min="0" max="100" className="input" value={form.discount} onChange={(e) => f('discount', e.target.value)} placeholder="30" /></div>
              </div>
              <div><label className="label">Tag</label><input className="input" value={form.tag} onChange={(e) => f('tag', e.target.value)} placeholder="Hill Stations, Beach..." /></div>
              <ImageUploadField label="Image" value={form.image} onChange={(url) => f('image', url)} />
              <div><label className="label">Description</label><textarea rows={5} className="input resize-y" value={form.description} onChange={(e) => f('description', e.target.value)} placeholder="Enter the package description. Line breaks will be preserved." /></div>
              <div>
                <label className="label">Package Inclusions</label>
                <textarea rows={7} className="input resize-y" value={form.inclusions} onChange={(e) => f('inclusions', e.target.value)} placeholder={'Enter one inclusion per line\n✅ Hotel accommodation\n✅ Daily breakfast and dinner'} />
                <p className="mt-1 text-xs text-gray-400">Enter each inclusion on a new line.</p>
              </div>
              <div>
                <label className="label">Package Exclusions</label>
                <textarea rows={7} className="input resize-y" value={form.exclusions} onChange={(e) => f('exclusions', e.target.value)} placeholder={'Enter one exclusion per line\n❌ Airfare or train tickets\n❌ Personal expenses'} />
                <p className="mt-1 text-xs text-gray-400">Enter each exclusion on a new line.</p>
              </div>
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
