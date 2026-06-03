import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const TABS = ['Business Info', 'Social Links', 'Hero Section', 'About Us', 'FAQ', 'Legal Pages']

const DEFAULT = {
  businessName: 'Trinetra Global Holidays',
  tagline: 'Explore More, Worry Less.',
  phone: '+91 98924 94688',
  whatsapp: '919343088141',
  email: 'info@trinetraglobalholidays.com',
  address: '708, Mohan Nano Estates, Ambernath West, India 421505',
  logoUrl: '',
  facebook: '', instagram: '', twitter: '', youtube: '',
  heroTitle: 'Where Would You Like To Go?',
  heroSubtitle: 'One life. Many destinations',
  heroBg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop',
  aboutTitle: 'About Trinetra Global Holidays',
  aboutSubtitle: 'Your Trusted Travel Partner Since 2009',
  aboutDescription: '',
  aboutImage: '',
  teamMembers: [],
  stats: [{ value: '15+', label: 'Years Experience' }, { value: '5000+', label: 'Happy Travelers' }, { value: '200+', label: 'Destinations' }, { value: '100%', label: 'Satisfaction' }],
  faqs: [],
  termsContent: '',
  privacyContent: '',
  refundContent: '',
  copyrightText: '© 2025 Trinetra Global Holidays. All Rights Reserved.',
  footerTagline: 'Designed with ❤️ for Travelers',
}

export default function SiteContent() {
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data.data) setForm(prev => ({ ...prev, ...r.data.data }))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/settings', form)
      toast.success('Content saved & live on website!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  // Team helpers
  const addTeam = () => set('teamMembers', [...(form.teamMembers || []), { name: '', role: '', img: '' }])
  const setTeam = (i, k, v) => { const t = [...(form.teamMembers || [])]; t[i] = { ...t[i], [k]: v }; set('teamMembers', t) }
  const removeTeam = (i) => set('teamMembers', form.teamMembers.filter((_, idx) => idx !== i))

  // Stats helpers
  const addStat = () => set('stats', [...(form.stats || []), { value: '', label: '' }])
  const setStat = (i, k, v) => { const s = [...(form.stats || [])]; s[i] = { ...s[i], [k]: v }; set('stats', s) }
  const removeStat = (i) => set('stats', form.stats.filter((_, idx) => idx !== i))

  // FAQ helpers
  const addFaq = () => set('faqs', [...(form.faqs || []), { category: 'General', question: '', answer: '' }])
  const setFaq = (i, k, v) => { const f = [...(form.faqs || [])]; f[i] = { ...f[i], [k]: v }; set('faqs', f) }
  const removeFaq = (i) => set('faqs', form.faqs.filter((_, idx) => idx !== i))

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Site Content Manager</h2>
          <p className="text-sm text-gray-500 mt-0.5">All changes reflect on the live website instantly.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-70">
          {saving ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving...</> : <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Save All Changes
          </>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-0">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 -mb-px ${tab === i ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-4">

        {/* Tab 0: Business Info */}
        {tab === 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Business Name</label><input className="input" value={form.businessName} onChange={e => set('businessName', e.target.value)} /></div>
              <div><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={e => set('tagline', e.target.value)} /></div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div><label className="label">WhatsApp Number (with country code, no +)</label><input className="input" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="919343088141" /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div><label className="label">Logo URL (optional)</label><input className="input" value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." /></div>
            </div>
            <div><label className="label">Address</label><textarea rows={2} className="input resize-none" value={form.address} onChange={e => set('address', e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Copyright Text</label><input className="input" value={form.copyrightText} onChange={e => set('copyrightText', e.target.value)} /></div>
              <div><label className="label">Footer Tagline</label><input className="input" value={form.footerTagline} onChange={e => set('footerTagline', e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* Tab 1: Social Links */}
        {tab === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Social Media Links</h3>
            <p className="text-xs text-gray-400">Enter full URLs. Leave blank to hide the icon.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['facebook', '🟦 Facebook'], ['instagram', '🟪 Instagram'], ['twitter', '🟦 Twitter / X'], ['youtube', '🟥 YouTube']].map(([k, label]) => (
                <div key={k}>
                  <label className="label">{label}</label>
                  <input className="input" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Hero Section */}
        {tab === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Hero Section</h3>
            <div><label className="label">Subtitle (cursive text above main title)</label><input className="input" value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} /></div>
            <div><label className="label">Main Heading</label><input className="input" value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} /></div>
            <div><label className="label">Background Image URL</label><input className="input" value={form.heroBg} onChange={e => set('heroBg', e.target.value)} placeholder="https://..." /></div>
            {form.heroBg && (
              <div className="rounded-xl overflow-hidden h-40">
                <img src={form.heroBg} alt="Hero preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: About Us */}
        {tab === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">About Page Content</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Page Title</label><input className="input" value={form.aboutTitle} onChange={e => set('aboutTitle', e.target.value)} /></div>
                <div><label className="label">Subtitle</label><input className="input" value={form.aboutSubtitle} onChange={e => set('aboutSubtitle', e.target.value)} /></div>
              </div>
              <div><label className="label">Description</label><textarea rows={4} className="input resize-none" value={form.aboutDescription} onChange={e => set('aboutDescription', e.target.value)} placeholder="Tell your company story..." /></div>
              <div><label className="label">About Page Image URL</label><input className="input" value={form.aboutImage} onChange={e => set('aboutImage', e.target.value)} placeholder="https://..." /></div>
            </div>

            {/* Stats */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Stats / Achievements</h3>
                <button onClick={addStat} className="btn-secondary text-xs px-3 py-1.5">+ Add Stat</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(form.stats || []).map((s, i) => (
                  <div key={i} className="card p-3 relative">
                    <button onClick={() => removeStat(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                    <input className="input text-center font-bold text-lg mb-1 py-1" value={s.value} onChange={e => setStat(i, 'value', e.target.value)} placeholder="15+" />
                    <input className="input text-center text-xs py-1" value={s.label} onChange={e => setStat(i, 'label', e.target.value)} placeholder="Years" />
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Team Members</h3>
                <button onClick={addTeam} className="btn-secondary text-xs px-3 py-1.5">+ Add Member</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(form.teamMembers || []).map((m, i) => (
                  <div key={i} className="card p-4 flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      {m.img ? <img src={m.img} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">👤</div>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input className="input py-1.5 text-sm" value={m.name} onChange={e => setTeam(i, 'name', e.target.value)} placeholder="Full Name" />
                      <input className="input py-1.5 text-sm" value={m.role} onChange={e => setTeam(i, 'role', e.target.value)} placeholder="Job Title" />
                      <input className="input py-1.5 text-xs" value={m.img} onChange={e => setTeam(i, 'img', e.target.value)} placeholder="Photo URL" />
                    </div>
                    <button onClick={() => removeTeam(i)} className="text-red-400 hover:text-red-600 text-lg leading-none mt-0.5">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: FAQ */}
        {tab === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">FAQ Manager</h3>
              <button onClick={addFaq} className="btn-primary text-xs px-4 py-2">+ Add Question</button>
            </div>
            {(form.faqs || []).length === 0 && (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-sm">No FAQs yet. Click "+ Add Question" to start.</p>
              </div>
            )}
            <div className="space-y-3">
              {(form.faqs || []).map((f, i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="label">Category</label>
                      <input className="input py-1.5 text-sm" value={f.category} onChange={e => setFaq(i, 'category', e.target.value)} placeholder="e.g. Booking & Payment" />
                    </div>
                    <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600 mt-5 text-xl leading-none shrink-0">×</button>
                  </div>
                  <div>
                    <label className="label">Question</label>
                    <input className="input py-1.5 text-sm" value={f.question} onChange={e => setFaq(i, 'question', e.target.value)} placeholder="Enter question..." />
                  </div>
                  <div>
                    <label className="label">Answer</label>
                    <textarea rows={3} className="input resize-none text-sm" value={f.answer} onChange={e => setFaq(i, 'answer', e.target.value)} placeholder="Enter answer..." />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Legal Pages */}
        {tab === 5 && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Legal Page Content</h3>
            <p className="text-xs text-gray-400">Use plain text. Separate sections with a blank line. Use "## Section Title" for headings.</p>
            {[
              ['termsContent', 'Terms & Conditions'],
              ['privacyContent', 'Privacy Policy'],
              ['refundContent', 'Refund & Cancellation Policy'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="label text-base">{label}</label>
                <textarea rows={12} className="input resize-y font-mono text-xs leading-relaxed" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={`Enter ${label} content here...\n\nUse ## for section headings.\nLeave a blank line between sections.`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
