import api from './api'

export async function uploadImage(file) {
  const data = new FormData()
  data.append('image', file)
  const res = await api.post('/uploads/image', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data.url
}
