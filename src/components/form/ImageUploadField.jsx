import { useState } from 'react'
import toast from 'react-hot-toast'
import { uploadImage } from '../../services/upload'
import { imageUrl } from '../../utils/image'

export default function ImageUploadField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false)

  const selectFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <label className="btn-secondary cursor-pointer flex items-center justify-center min-w-32">
          {uploading ? 'Uploading...' : value ? 'Change Image' : 'Choose Image'}
          <input type="file" accept="image/*" onChange={selectFile} className="hidden" disabled={uploading} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs text-red-500 font-semibold hover:underline">
            Remove
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          <img src={imageUrl(value)} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  )
}
