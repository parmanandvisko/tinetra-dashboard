import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ImageUploadField from '../../components/form/ImageUploadField'
import RichTextField from '../../components/form/RichTextField'

const TABS = ['Business Info', 'Social Links', 'Hero Section', 'About Us', 'Stats', 'Team', 'FAQ', 'Legal Pages', 'Payment Details']

const DEFAULT_TERMS_CONTENT = `## 1. Company Information
Trinetra Global Holidays is a registered travel company based in Ambernath West, Maharashtra, India - 421505. Contact: info@trinetraglobalholidays.com | +91 98924 94688

## 2. Booking & Confirmation
All bookings are subject to availability and confirmed only upon receipt of minimum 25% advance payment. Confirmation is sent via WhatsApp and email within 24 hours.

## 3. Pricing & Payment
All prices are quoted in INR. GST and applicable taxes are charged as per government regulations. Full payment must be completed at least 7 days before departure.

## 4. Cancellation Policy
- 30+ days before departure: 10%
- 15-29 days before departure: 25%
- 7-14 days before departure: 50%
- Less than 7 days / No Show: 100% (No refund)

## 5. Liability Limitations
Trinetra Global Holidays acts as an agent for hotels, airlines, and transport providers. We are not liable for injury, loss, delay, or damage caused by third-party service providers.

## 6. Governing Law
These Terms are governed by the laws of India. Disputes are subject to jurisdiction of courts in Ambernath, Maharashtra.`

const DEFAULT_PRIVACY_CONTENT = `## 1. Information We Collect
We collect personal details, contact information, travel documents when required, payment information, and website data such as IP address and cookies.

## 2. How We Use Your Information
- Processing and confirming tour bookings
- Communicating travel arrangements and updates
- Processing refunds and cancellation requests
- Visa applications and hotel/airline reservations
- Sending promotional offers with your consent
- Legal and regulatory compliance

## 3. Information Sharing
We do not sell or trade your personal information. We share only with service providers such as hotels, airlines, visa agencies, and when required by law.

## 4. Data Security
We implement appropriate security measures to protect your data. WhatsApp communications are end-to-end encrypted.

## 5. Your Rights
- Access: Request a copy of your data
- Correction: Request correction of inaccurate data
- Deletion: Request deletion, subject to legal requirements
- Opt-out: Unsubscribe from marketing at any time

## 6. Contact
For privacy queries: info@trinetraglobalholidays.com | +91 98924 94688`

const DEFAULT_REFUND_CONTENT = `## Cancellation Charges
| Period | Domestic | International |
| 30+ days before departure | 10% | 15% |
| 15-29 days before departure | 25% | 30% |
| 7-14 days before departure | 50% | 60% |
| Less than 7 days / No Show | 100% | 100% |

## Refund Process
Refunds are processed within 5-7 business days of receiving the cancellation request. Bank transfers may take 3-5 additional working days. UPI refunds may take 1-3 business days.

## Non-Refundable Components
- Visa application fees
- Travel insurance premiums
- Non-refundable airline tickets
- Non-refundable hotel bookings
- Adventure activity bookings

## How to Cancel
Send an email to info@trinetraglobalholidays.com with your booking reference number, or WhatsApp us at +91 98924 94688. Our team will confirm receipt within 24 hours.

## Cancellation by Company
In rare cases such as force majeure or insufficient group size, we will offer alternative dates or a full refund within 10 business days.`

const LIMITS = {
  businessName: 45,
  tagline: 80,
  phone: 18,
  whatsapp: 12,
  email: 80,
  address: 180,
  copyrightText: 90,
  footerTagline: 70,
  url: 250,
  heroSubtitle: 45,
  heroTitle: 65,
  aboutTitle: 65,
  aboutSubtitle: 80,
  aboutDescription: 1200,
  statValue: 8,
  statLabel: 26,
  teamName: 45,
  teamRole: 55,
  faqCategory: 45,
  faqQuestion: 140,
  faqAnswer: 800,
  legalContent: 8000,
  paymentDetails: 3000,
}

const DEFAULT = {
  businessName: 'Trinetra Global Holidays',
  tagline: 'Explore More, Worry Less.',
  phone: '+91 98924 94688',
  phone2: '',
  phone3: '',
  whatsapp: '919892494688',
  email: 'info@trinetraglobalholidays.com',
  address: '708, Mohan Nano Estates, Ambernath West, India 421505',
  logoUrl: '',
  facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '',
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
  termsContent: DEFAULT_TERMS_CONTENT,
  privacyContent: DEFAULT_PRIVACY_CONTENT,
  refundContent: DEFAULT_REFUND_CONTENT,
  paymentDetails: '',
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
  const count = (value, max) => <p className="text-[11px] text-gray-400 mt-1 text-right">{(value || '').length}/{max}</p>
  const inputProps = (key, max) => ({
    maxLength: max,
    value: form[key] || '',
    onChange: e => set(key, e.target.value),
  })

  const save = async () => {
    setSaving(true)
    try {
      const { _id, __v, createdAt, updatedAt, ...payload } = form
      await api.put('/settings', payload)
      toast.success('Content saved & live on website!')
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
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
    <div className="space-y-5 max-w-5xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900">Site Content Manager</h2>
          <p className="text-sm text-gray-500 mt-0.5">All changes reflect on the live website instantly.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70 w-full sm:w-auto shrink-0">
          {saving ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving...</> : <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Save All Changes
          </>}
        </button>
      </div>

      {/* Tabs */}
      <div className="sm:hidden">
        <label className="label">Section</label>
        <select value={tab} onChange={(e) => setTab(Number(e.target.value))} className="input">
          {TABS.map((t, i) => <option key={t} value={i}>{t}</option>)}
        </select>
      </div>

      <div className="hidden sm:flex gap-2 border-b border-gray-200 pb-0 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 -mb-px whitespace-nowrap shrink-0 ${tab === i ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="card p-4 sm:p-6 space-y-4 overflow-hidden">

        {/* Tab 0: Business Info */}
        {tab === 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Business Name</label><input className="input" {...inputProps('businessName', LIMITS.businessName)} />{count(form.businessName, LIMITS.businessName)}</div>
              <div><label className="label">Tagline</label><input className="input" {...inputProps('tagline', LIMITS.tagline)} />{count(form.tagline, LIMITS.tagline)}</div>
              <div><label className="label">Mobile Number 1</label><input className="input" maxLength={LIMITS.phone} value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
              <div><label className="label">Mobile Number 2</label><input className="input" maxLength={LIMITS.phone} value={form.phone2 || ''} onChange={e => set('phone2', e.target.value)} /></div>
              <div><label className="label">Mobile Number 3</label><input className="input" maxLength={LIMITS.phone} value={form.phone3 || ''} onChange={e => set('phone3', e.target.value)} /></div>
              <div><label className="label">WhatsApp Number (with country code, no +)</label><input className="input" inputMode="numeric" pattern="[0-9]{10,12}" maxLength={LIMITS.whatsapp} value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value.replace(/\D/g, '').slice(0, LIMITS.whatsapp))} placeholder="919892494688" />{count(form.whatsapp, LIMITS.whatsapp)}</div>
              <div><label className="label">Email</label><input className="input" type="email" {...inputProps('email', LIMITS.email)} />{count(form.email, LIMITS.email)}</div>
              <ImageUploadField label="Logo" value={form.logoUrl} onChange={url => set('logoUrl', url)} />
            </div>
            <div><label className="label">Address</label><textarea rows={2} className="input resize-none" maxLength={LIMITS.address} value={form.address || ''} onChange={e => set('address', e.target.value)} />{count(form.address, LIMITS.address)}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Copyright Text</label><input className="input" {...inputProps('copyrightText', LIMITS.copyrightText)} />{count(form.copyrightText, LIMITS.copyrightText)}</div>
              <div><label className="label">Footer Tagline</label><input className="input" {...inputProps('footerTagline', LIMITS.footerTagline)} />{count(form.footerTagline, LIMITS.footerTagline)}</div>
            </div>
          </div>
        )}

        {/* Tab 1: Social Links */}
        {tab === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Social Media Links</h3>
            <p className="text-xs text-gray-400">Enter full URLs. Leave blank to hide the icon.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['facebook', '🟦 Facebook'], ['instagram', '🟪 Instagram'], ['linkedin', 'LinkedIn'], ['twitter', '🟦 Twitter / X'], ['youtube', '🟥 YouTube']].map(([k, label]) => (
                <div key={k}>
                  <label className="label">{label}</label>
                  <input className="input" maxLength={LIMITS.url} value={form[k] || ''} onChange={e => set(k, e.target.value)} placeholder="https://..." />
                  {count(form[k], LIMITS.url)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Hero Section */}
        {tab === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Hero Section</h3>
            <div><label className="label">Subtitle (cursive text above main title)</label><input className="input" {...inputProps('heroSubtitle', LIMITS.heroSubtitle)} />{count(form.heroSubtitle, LIMITS.heroSubtitle)}</div>
            <div><label className="label">Main Heading</label><input className="input" {...inputProps('heroTitle', LIMITS.heroTitle)} />{count(form.heroTitle, LIMITS.heroTitle)}</div>
            <ImageUploadField label="Background Image" value={form.heroBg} onChange={url => set('heroBg', url)} />
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
                <div><label className="label">Page Title</label><input className="input" {...inputProps('aboutTitle', LIMITS.aboutTitle)} />{count(form.aboutTitle, LIMITS.aboutTitle)}</div>
                <div><label className="label">Subtitle</label><input className="input" {...inputProps('aboutSubtitle', LIMITS.aboutSubtitle)} />{count(form.aboutSubtitle, LIMITS.aboutSubtitle)}</div>
              </div>
              <RichTextField label="Description" rows={7} value={form.aboutDescription} maxLength={LIMITS.aboutDescription} onChange={value => set('aboutDescription', value)} placeholder="Tell your company story..." />
              <ImageUploadField label="About Page Image" value={form.aboutImage} onChange={url => set('aboutImage', url)} />
            </div>
          </div>
        )}

        {/* Tab 4: Stats */}
        {tab === 4 && (
          <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Stats / Achievements</h3>
                <button onClick={addStat} className="btn-secondary text-xs px-3 py-1.5">+ Add Stat</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(form.stats || []).map((s, i) => (
                  <div key={i} className="card p-3 relative">
                    <button onClick={() => removeStat(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                    <input className="input text-center font-bold text-lg mb-1 py-1" maxLength={LIMITS.statValue} value={s.value} onChange={e => setStat(i, 'value', e.target.value)} placeholder="15+" />
                    <input className="input text-center text-xs py-1" maxLength={LIMITS.statLabel} value={s.label} onChange={e => setStat(i, 'label', e.target.value)} placeholder="Years" />
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Tab 5: Team */}
        {tab === 5 && (
          <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
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
                      <input className="input py-1.5 text-sm" maxLength={LIMITS.teamName} value={m.name} onChange={e => setTeam(i, 'name', e.target.value)} placeholder="Full Name" />
                      <input className="input py-1.5 text-sm" maxLength={LIMITS.teamRole} value={m.role} onChange={e => setTeam(i, 'role', e.target.value)} placeholder="Job Title" />
                      <ImageUploadField label="Photo" value={m.img} onChange={url => setTeam(i, 'img', url)} />
                    </div>
                    <button onClick={() => removeTeam(i)} className="text-red-400 hover:text-red-600 text-lg leading-none mt-0.5">×</button>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Tab 6: FAQ */}
        {tab === 6 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                      <input className="input py-1.5 text-sm" maxLength={LIMITS.faqCategory} value={f.category} onChange={e => setFaq(i, 'category', e.target.value)} placeholder="e.g. Booking & Payment" />
                    </div>
                    <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600 mt-5 text-xl leading-none shrink-0">×</button>
                  </div>
                  <div>
                    <label className="label">Question</label>
                    <input className="input py-1.5 text-sm" maxLength={LIMITS.faqQuestion} value={f.question} onChange={e => setFaq(i, 'question', e.target.value)} placeholder="Enter question..." />
                  </div>
                  <div>
                    <label className="label">Answer</label>
                    <RichTextField value={f.answer} maxLength={LIMITS.faqAnswer} onChange={value => setFaq(i, 'answer', value)} rows={3} placeholder="Enter answer..." />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Legal Pages */}
        {tab === 7 && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Legal Page Content</h3>
            <p className="text-xs text-gray-400">Use plain text. Separate sections with a blank line. Use "## Section Title" for headings.</p>
            {[
              ['termsContent', 'Terms & Conditions'],
              ['privacyContent', 'Privacy Policy'],
              ['refundContent', 'Refund & Cancellation Policy'],
            ].map(([key, label]) => (
              <div key={key}>
                <RichTextField label={label} rows={12} value={form[key]} maxLength={LIMITS.legalContent} onChange={value => set(key, value)} placeholder={`Enter ${label} content here...\n\nUse ## for section headings.\nLeave a blank line between sections.`} />
              </div>
            ))}
          </div>
        )}

        {/* Tab 8: Payment Details */}
        {tab === 8 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-primary">Payment Details</h3>
            <p className="text-xs text-gray-400">Add bank account, UPI, QR instructions, advance payment notes, or payment policy shown on the website.</p>
            <RichTextField
              label="Payment Details Content"
              rows={14}
              value={form.paymentDetails}
              maxLength={LIMITS.paymentDetails}
              onChange={value => set('paymentDetails', value)}
              placeholder={'## Bank Transfer\nAccount Name: Trinetra Global Holidays\nBank Name: Your Bank\nAccount Number: XXXX\nIFSC: XXXX\n\n## UPI\nUPI ID: yourupi@bank\n\n- Mention your booking name after payment\n- Share payment screenshot on WhatsApp'}
            />
          </div>
        )}
      </div>
    </div>
  )
}
