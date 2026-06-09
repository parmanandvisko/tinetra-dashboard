const API_HOST = 'api.trinetraglobalholidays.com'

export function imageUrl(url) {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    if (parsed.hostname === API_HOST) parsed.protocol = 'https:'
    return parsed.toString()
  } catch {
    return url
  }
}
