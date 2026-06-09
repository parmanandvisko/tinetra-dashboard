import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { uploadMedia } from '../../services/upload'

const EMPTY = {
  title: '',
  mediaType: 'image',
  mediaUrl: '',
  thumbnailUrl: '',
  order: 0,
  isActive: true,
}

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = () => {
    setLoading(true)
    api.get('/gallery')
      .then((res) => setItems(res.data.data || []))
      .catch(() => toast.error('Failed to load gallery'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const reset = () => {
    setEditing(null)
    setForm(EMPTY)
  }

  const selectMedia = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await uploadMedia(file)
      setForm((current) => ({
        ...current,
        mediaUrl: uploaded.url,
        mediaType: uploaded.mediaType,
      }))
      toast.success('Media uploaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Media upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const save = async (event) => {
    event.preventDefault()
    if (!form.mediaUrl) return toast.error('Upload an image or video')
    setSaving(true)
    try {
      const payload = { ...form, order: Number(form.order) || 0 }
      if (editing) {
        await api.put(`/gallery/${editing._id}`, payload)
        toast.success('Gallery item updated')
      } else {
        await api.post('/gallery', payload)
        toast.success('Gallery item added')
      }
      reset()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save gallery item')
    } finally {
      setSaving(false)
    }
  }

  const edit = (item) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl || '',
      order: item.order || 0,
      isActive: item.isActive,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id) => {
    if (!confirm('Delete this gallery item?')) return
    try {
      await api.delete(`/gallery/${id}`)
      toast.success('Gallery item deleted')
      if (editing?._id === id) reset()
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">{editing ? 'Edit Gallery Item' : 'Upload Gallery Item'}</h2>
            <p className="text-xs text-gray-500 mt-1">Images and videos added here appear on the website home page.</p>
          </div>
          {editing && <button type="button" onClick={reset} className="btn-secondary">Cancel Edit</button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Traveler memories" /></div>
          <div><label className="label">Display Order</label><input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
        </div>

        <div>
          <label className="label">Image or Video *</label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-secondary cursor-pointer">
              {uploading ? 'Uploading...' : form.mediaUrl ? 'Change Media' : 'Choose Media'}
              <input type="file" accept="image/*,video/*" onChange={selectMedia} className="hidden" disabled={uploading} />
            </label>
            <span className="text-xs text-gray-400">Images up to 5 MB, videos up to 50 MB.</span>
          </div>
        </div>

        {form.mediaUrl && (
          <div className="h-56 max-w-md overflow-hidden rounded-xl bg-gray-100">
            {form.mediaType === 'video'
              ? <video src={form.mediaUrl} controls className="w-full h-full object-cover" />
              : <img src={form.mediaUrl} alt="" className="w-full h-full object-cover" />}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" />
          Show on website
        </label>

        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? 'Saving...' : editing ? 'Update Item' : 'Add to Gallery'}
        </button>
      </form>

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-4">Gallery</h2>
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-gray-400">No gallery items yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <div className="h-44 bg-gray-100">
                  {item.mediaType === 'video'
                    ? <video src={item.mediaUrl} controls preload="metadata" className="w-full h-full object-cover" />
                    : <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{item.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400 capitalize">{item.mediaType} · Order {item.order}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button type="button" onClick={() => edit(item)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                    <button type="button" onClick={() => remove(item._id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
