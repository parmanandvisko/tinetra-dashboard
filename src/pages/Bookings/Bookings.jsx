import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ExportButton from '../../components/ui/ExportButton'
import { formatDate } from '../../utils/exportExcel'
import defaultLogo from '../../../assets/logo/trinetralogo.png'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

const serviceOptions = [
  ['hotel', 'Hotel'],
  ['flight', 'Flight'],
  ['airportTransfer', 'Airport Transfer'],
  ['sightseeing', 'Sightseeing'],
  ['visa', 'Visa'],
  ['insurance', 'Insurance'],
]

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  packageTitle: '',
  destination: '',
  travelDate: '',
  checkInDate: '',
  checkOutDate: '',
  adults: 2,
  children: 0,
  numberOfGuests: 2,
  totalAmount: '',
  invoiceDescription: 'Tour package booking',
  invoiceAmount: '',
  notes: '',
  status: 'pending',
  paymentStatus: 'unpaid',
  servicesIncluded: {
    hotel: false,
    flight: false,
    airportTransfer: false,
    sightseeing: false,
    visa: false,
    insurance: false,
  },
}

const fallbackCompany = {
  name: 'Trinetra Global Holidays',
  tagline: 'Explore More, Worry Less.',
  phone: '+91 98924 94688',
  email: 'info@trinetraglobalholidays.com',
  gstNumber: 'GSTIN: 27AHNPN4301P1ZW',
  businessRegistration: 'Legal Name: DAVASI MUTHU NADAR | Constitution: Proprietorship',
  address: 'Flat No 708, O Wing, Mohan Nano Estates, Khutavali, Ambernath West, Ambarnath, Thane, Maharashtra - 421501',
  logoUrl: defaultLogo,
}

const formatINR = (value) => Number(value || 0).toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
const displayDate = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '-'
const formatInvoiceDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
const escapeHtml = (value) => String(value ?? '-')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const apiHost = api.defaults.baseURL?.replace(/\/api\/?$/, '') || ''
const resolveAssetUrl = (url) => {
  if (!url) return defaultLogo
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${apiHost}${url}`
  return url
}
const isPlaceholderFirmValue = (value) => !value || /available on request/i.test(value)

const printableHtml = (title, body) => `
  <html>
    <head>
      <title>${title}</title>
      <base href="${window.location.origin}/" />
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; background: #f3f4f6; color: #111827; font-family: Arial, Helvetica, sans-serif; }
        .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 14mm 16mm 18mm; position: relative; }
        .brand-line { height: 8px; background: linear-gradient(90deg, #8b1e2d 0%, #c99a2e 100%); margin: -14mm -16mm 18px; }
        .letterhead { display: grid; grid-template-columns: 132px 1fr 180px; gap: 20px; align-items: center; border-bottom: 3px solid #8b1e2d; padding-bottom: 18px; }
        .logo-wrap { width: 132px; min-height: 116px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; padding: 8px; }
        .logo { width: 116px; max-height: 108px; object-fit: contain; display: block; }
        .firm-name { font-size: 29px; font-weight: 900; letter-spacing: .4px; text-transform: uppercase; color: #8b1e2d; margin: 0; line-height: 1.05; }
        .tagline { margin-top: 6px; color: #111827; font-size: 13px; font-weight: 800; }
        .firm-meta { margin-top: 10px; color: #374151; font-size: 11.5px; line-height: 1.65; }
        .doc-badge { text-align: right; background: #fff8ea; border: 1px solid #c99a2e; border-top: 4px solid #8b1e2d; padding: 12px 13px; min-width: 180px; }
        .doc-title { color: #8b1e2d; font-size: 19px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; letter-spacing: .3px; }
        .doc-sub { color: #374151; font-size: 11.5px; line-height: 1.7; }
        .section-title { margin: 24px 0 10px; color: #8b1e2d; font-size: 13px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; padding-bottom: 7px; letter-spacing: .2px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .box { border: 1px solid #d1d5db; border-left: 4px solid #c99a2e; padding: 13px; min-height: 102px; background: #fff; }
        .label { color: #6b7280; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
        .value { color: #111827; font-size: 14px; font-weight: 800; line-height: 1.5; }
        .muted-value { color: #374151; font-size: 12px; line-height: 1.55; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #8b1e2d; color: #fff; font-size: 11px; text-transform: uppercase; text-align: left; border: 1px solid #8b1e2d; padding: 9px; }
        td { border: 1px solid #d1d5db; padding: 11px 10px; font-size: 12.5px; vertical-align: top; line-height: 1.5; }
        .right { text-align: right; }
        .center { text-align: center; }
        .status { display: inline-block; padding: 5px 10px; background: #ecfdf5; border: 1px solid #16a34a; color: #166534; font-size: 11px; font-weight: 900; text-transform: uppercase; }
        .total-row td { font-weight: 900; font-size: 14px; background: #fff8ea; color: #111827; }
        .terms { margin-top: 18px; color: #4b5563; font-size: 10.5px; line-height: 1.55; }
        .signature-row { display: grid; grid-template-columns: 1fr 180px; gap: 30px; align-items: end; margin-top: 44px; }
        .signature-box { border-top: 1px solid #111827; padding-top: 7px; text-align: center; font-size: 11px; font-weight: 700; }
        .footer { position: absolute; left: 16mm; right: 16mm; bottom: 11mm; border-top: 1px solid #e5e7eb; padding-top: 8px; color: #6b7280; font-size: 10px; text-align: center; }
        @page { size: A4; margin: 0; }
        @media print {
          body { background: #fff; }
          .page { margin: 0; width: auto; min-height: 297mm; box-shadow: none; }
        }
      </style>
    </head>
    <body><div class="page">${body}</div><script>window.print()</script></body>
  </html>
`

function openPrintWindow(title, html) {
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) {
    toast.error('Please allow popups to print')
    return
  }
  printWindow.document.write(printableHtml(title, html))
  printWindow.document.close()
}

function buildLetterhead(firm, documentTitle, metaRows) {
  const meta = metaRows.map(([label, value]) => `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`).join('')
  const phoneLine = [firm.phone, firm.phone2, firm.phone3].filter(Boolean).join(' | ')
  return `
    <div class="brand-line"></div>
    <header class="letterhead">
      <div class="logo-wrap"><img class="logo" src="${escapeHtml(resolveAssetUrl(firm.logoUrl))}" alt="${escapeHtml(firm.name)}" /></div>
      <div>
        <h1 class="firm-name">${escapeHtml(firm.name)}</h1>
        <div class="tagline">${escapeHtml(firm.tagline)}</div>
        <div class="firm-meta">
          ${escapeHtml(firm.address)}<br />
          Phone: ${escapeHtml(phoneLine || '-')} | Email: ${escapeHtml(firm.email || '-')}<br />
          ${escapeHtml(firm.gstNumber || '-')} | ${escapeHtml(firm.businessRegistration || '-')}
        </div>
      </div>
      <div class="doc-badge">
        <div class="doc-title">${escapeHtml(documentTitle)}</div>
        <div class="doc-sub">${meta}</div>
      </div>
    </header>
  `
}

function buildVoucher(booking, firm) {
  const services = serviceOptions
    .filter(([key]) => booking.servicesIncluded?.[key])
    .map(([, label]) => label)
    .join(', ') || '-'
  const guestCount = booking.numberOfGuests || Number(booking.adults || 0) + Number(booking.children || 0)

  return `
    ${buildLetterhead(firm, 'Booking Voucher', [
      ['Voucher No.', booking.voucherNo || '-'],
      ['Booking ID', booking.bookingRefNo || '-'],
      ['Date', formatInvoiceDate(booking.createdAt)],
    ])}
    <div class="section-title">Guest & Booking Details</div>
    <div class="grid-2">
      <div class="box">
        <div class="label">Guest Name</div>
        <div class="value">${escapeHtml(booking.name)}</div>
        <div class="muted-value">${escapeHtml(booking.phone)}<br />${escapeHtml(booking.email || '-')}</div>
      </div>
      <div class="box">
        <div class="label">Booking Status</div>
        <div class="value"><span class="status">${escapeHtml(booking.status)}</span></div>
        <div class="muted-value">Payment: ${escapeHtml(booking.paymentStatus || '-')}</div>
      </div>
    </div>
    <table>
      <tbody>
        <tr><th>Destination</th><td>${escapeHtml(booking.destination || booking.packageTitle)}</td><th>Guests</th><td>${escapeHtml(guestCount)}</td></tr>
        <tr><th>Check-in Date</th><td>${displayDate(booking.checkInDate || booking.travelDate)}</td><th>Check-out Date</th><td>${displayDate(booking.checkOutDate)}</td></tr>
        <tr><th>Adults</th><td>${escapeHtml(booking.adults || 0)}</td><th>Children</th><td>${escapeHtml(booking.children || 0)}</td></tr>
      </tbody>
    </table>
    <div class="section-title">Services Included</div>
    <table>
      <thead>
        <tr><th>Included Services</th></tr>
      </thead>
      <tbody>
        <tr><td>${escapeHtml(services)}</td></tr>
      </tbody>
    </table>
    <div class="section-title">Important Notes</div>
    <div class="terms">
      This voucher is valid only for the guest and booking reference mentioned above. Services are subject to supplier confirmation,
      hotel policies, airline rules, visa approvals, and destination regulations. Please carry valid government ID while travelling.
    </div>
    <div class="signature-row">
      <div class="muted-value">Prepared by ${escapeHtml(firm.name)}</div>
      <div class="signature-box">Authorized Signatory</div>
    </div>
    <div class="footer">${escapeHtml(firm.name)} | ${escapeHtml(firm.email || '-')} | ${escapeHtml(firm.phone || '-')}</div>
  `
}

function buildInvoice(booking, firm) {
  const amount = Number(booking.invoiceAmount || booking.totalAmount || 0)
  return `
    ${buildLetterhead(firm, 'GST Invoice', [
      ['Invoice No.', booking.invoiceNo || '-'],
      ['Invoice Date', formatInvoiceDate(booking.invoiceDate || booking.createdAt)],
      ['Booking ID', booking.bookingRefNo || '-'],
    ])}
    <div class="section-title">Billing Details</div>
    <div class="grid-2">
      <div class="box">
        <div class="label">Bill To</div>
        <div class="value">${escapeHtml(booking.name)}</div>
        <div class="muted-value">${escapeHtml(booking.address)}<br />Mobile: ${escapeHtml(booking.phone)}<br />Email: ${escapeHtml(booking.email || '-')}</div>
      </div>
      <div class="box">
        <div class="label">Travel Details</div>
        <div class="value">${escapeHtml(booking.destination || booking.packageTitle)}</div>
        <div class="muted-value">Check-in: ${displayDate(booking.checkInDate || booking.travelDate)}<br />Check-out: ${displayDate(booking.checkOutDate)}</div>
      </div>
    </div>
    <div class="section-title">Invoice Particulars</div>
    <table>
      <thead>
        <tr>
          <th class="center" style="width: 42px">Sr.</th>
          <th style="width: 55%">Description</th>
          <th class="center">HSN/SAC</th>
          <th class="center">Qty</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="center">1</td>
          <td>${escapeHtml(booking.invoiceDescription || 'Tour package booking')}</td>
          <td class="center">-</td>
          <td class="center">1</td>
          <td class="right">${formatINR(amount)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" class="right">Total Amount</td>
          <td class="right">${formatINR(amount)}</td>
        </tr>
      </tbody>
    </table>
    <div class="section-title">Terms & Declaration</div>
    <div class="terms">
      Amount received/receivable against travel booking services. Taxes, if applicable, are charged as per current government rules.
      Payment is subject to booking terms, cancellation policy, and supplier conditions shared with the customer.
    </div>
    <div class="signature-row">
      <div class="muted-value">Thank you for choosing ${escapeHtml(firm.name)}.</div>
      <div class="signature-box">Authorized Signatory</div>
    </div>
    <div class="footer">${escapeHtml(firm.name)} | ${escapeHtml(firm.email || '-')} | ${escapeHtml(firm.phone || '-')}</div>
  `
}

export default function Bookings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)
  const [firm, setFirm] = useState(fallbackCompany)

  const load = () => {
    setLoading(true)
    const q = new URLSearchParams({ limit: 1000, ...(filterStatus && { status: filterStatus }), ...(search && { search }) })
    api.get(`/bookings?${q}`).then((r) => {
      setItems(r.data.data)
      if (selected) {
        const fresh = r.data.data.find((item) => item._id === selected._id)
        if (fresh) setSelected(fresh)
      }
    }).catch(() => toast.error('Failed to load bookings')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatus, search])

  useEffect(() => {
    api.get('/settings')
      .then((r) => {
        const settings = r.data.data || {}
        setFirm({
          ...fallbackCompany,
          name: settings.businessName || fallbackCompany.name,
          tagline: settings.tagline || fallbackCompany.tagline,
          phone: settings.phone || fallbackCompany.phone,
          phone2: settings.phone2 || '',
          phone3: settings.phone3 || '',
          email: settings.email || fallbackCompany.email,
          address: settings.address || fallbackCompany.address,
          gstNumber: isPlaceholderFirmValue(settings.gstNumber) ? fallbackCompany.gstNumber : settings.gstNumber,
          businessRegistration: isPlaceholderFirmValue(settings.businessRegistration) ? fallbackCompany.businessRegistration : settings.businessRegistration,
          logoUrl: settings.logoUrl || fallbackCompany.logoUrl,
        })
      })
      .catch(() => setFirm(fallbackCompany))
  }, [])

  const exportColumns = useMemo(() => [
    { label: 'Booking ID', value: (item) => item.bookingRefNo },
    { label: 'Voucher No', value: (item) => item.voucherNo },
    { label: 'Invoice No', value: (item) => item.invoiceNo },
    { label: 'Invoice Date', value: (item) => formatDate(item.invoiceDate) },
    { label: 'Guest Name', value: (item) => item.name },
    { label: 'Email', value: (item) => item.email },
    { label: 'Mobile No', value: (item) => item.phone },
    { label: 'Address', value: (item) => item.address },
    { label: 'Destination', value: (item) => item.destination || item.packageTitle || item.package?.title },
    { label: 'Check-in Date', value: (item) => displayDate(item.checkInDate || item.travelDate) },
    { label: 'Check-out Date', value: (item) => displayDate(item.checkOutDate) },
    { label: 'Guests', value: (item) => item.numberOfGuests },
    { label: 'Services', value: (item) => serviceOptions.filter(([key]) => item.servicesIncluded?.[key]).map(([, label]) => label).join(', ') },
    { label: 'Booking Status', value: (item) => item.status },
    { label: 'Payment Status', value: (item) => item.paymentStatus },
    { label: 'Invoice Amount', value: (item) => item.invoiceAmount || item.totalAmount },
    { label: 'Notes', value: (item) => item.notes },
  ], [])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateGuestCount = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      next.numberOfGuests = Number(next.adults || 0) + Number(next.children || 0)
      return next
    })
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditing(null)
  }

  const startEdit = (booking) => {
    setEditing(booking._id)
    setForm({
      ...initialForm,
      ...booking,
      travelDate: toDateInput(booking.travelDate),
      checkInDate: toDateInput(booking.checkInDate),
      checkOutDate: toDateInput(booking.checkOutDate),
      invoiceDate: toDateInput(booking.invoiceDate),
      totalAmount: booking.totalAmount || '',
      invoiceAmount: booking.invoiceAmount || booking.totalAmount || '',
      servicesIncluded: { ...initialForm.servicesIncluded, ...(booking.servicesIncluded || {}) },
    })
  }

  const save = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      totalAmount: Number(form.totalAmount || 0),
      invoiceAmount: Number(form.invoiceAmount || form.totalAmount || 0),
      adults: Number(form.adults || 0),
      children: Number(form.children || 0),
      numberOfGuests: Number(form.numberOfGuests || 0),
    }

    try {
      const response = editing
        ? await api.put(`/bookings/${editing}`, payload)
        : await api.post('/bookings', payload)
      toast.success(editing ? 'Booking updated' : 'Booking created')
      setSelected(response.data.data)
      resetForm()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save booking')
    }
  }

  const updateStatus = async (id, data) => {
    try {
      const response = await api.put(`/bookings/${id}`, data)
      toast.success('Updated')
      setSelected(response.data.data)
      load()
    } catch {
      toast.error('Failed to update')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this booking?')) return
    try {
      await api.delete(`/bookings/${id}`)
      toast.success('Deleted')
      setSelected(null)
      if (editing === id) resetForm()
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-500">Vouchers, GST invoices, services, and booking status.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guest, booking ID, invoice..." className="input w-full sm:w-64" />
          <ExportButton filename="booking-management" rows={items} columns={exportColumns} disabled={loading} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Booking ID', 'Guest', 'Destination', 'Dates', 'Guests', 'Status', 'Invoice', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
                  : items.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No bookings found</td></tr>
                  : items.map((item) => (
                    <tr key={item._id} onClick={() => setSelected(item)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?._id === item._id ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.bookingRefNo || '-'}</p>
                        <p className="text-xs text-gray-400">{item.voucherNo || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.destination || item.packageTitle || item.package?.title || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{displayDate(item.checkInDate || item.travelDate)} to {displayDate(item.checkOutDate)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.numberOfGuests || Number(item.adults || 0) + Number(item.children || 0)}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>{item.status}</span></td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-700">{item.invoiceNo || '-'}</p>
                        <p className="text-xs text-gray-400">{formatINR(item.invoiceAmount || item.totalAmount)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); startEdit(item) }} className="text-xs text-primary font-semibold hover:underline mr-3">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); remove(item._id) }} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Booking' : 'Create Booking'}</h3>
              {editing && <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-800">Cancel</button>}
            </div>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Guest Name</label><input required value={form.name} onChange={(e) => updateField('name', e.target.value)} className="input" /></div>
                <div><label className="label">Mobile No.</label><input required value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input" /></div>
                <div><label className="label">Email</label><input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input" /></div>
                <div><label className="label">Destination</label><input value={form.destination} onChange={(e) => updateField('destination', e.target.value)} className="input" /></div>
                <div><label className="label">Check-in</label><input type="date" value={form.checkInDate} onChange={(e) => updateField('checkInDate', e.target.value)} className="input" /></div>
                <div><label className="label">Check-out</label><input type="date" value={form.checkOutDate} onChange={(e) => updateField('checkOutDate', e.target.value)} className="input" /></div>
                <div><label className="label">Adults</label><input type="number" min="0" value={form.adults} onChange={(e) => updateGuestCount('adults', e.target.value)} className="input" /></div>
                <div><label className="label">Children</label><input type="number" min="0" value={form.children} onChange={(e) => updateGuestCount('children', e.target.value)} className="input" /></div>
                <div><label className="label">Invoice Amount</label><input type="number" min="0" value={form.invoiceAmount} onChange={(e) => { updateField('invoiceAmount', e.target.value); updateField('totalAmount', e.target.value) }} className="input" /></div>
                <div><label className="label">Status</label><select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="input">{['pending', 'confirmed', 'cancelled', 'completed'].map((s) => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="label">Billing Address</label><textarea value={form.address} onChange={(e) => updateField('address', e.target.value)} className="input min-h-20" /></div>
              <div><label className="label">Services Included</label><div className="grid grid-cols-2 gap-2">{serviceOptions.map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={!!form.servicesIncluded[key]} onChange={(e) => setForm((prev) => ({ ...prev, servicesIncluded: { ...prev.servicesIncluded, [key]: e.target.checked } }))} />{label}</label>)}</div></div>
              <div><label className="label">Notes</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input min-h-20" /></div>
              <button type="submit" className="btn-primary w-full">{editing ? 'Update Booking' : 'Create Booking'}</button>
            </form>
          </div>

          <div className="card p-5">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <p className="text-sm">Select a booking</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">Booking Details</h3>
                    <p className="text-xs text-gray-500">{selected.bookingRefNo || '-'}</p>
                  </div>
                  <button onClick={() => startEdit(selected)} className="btn-secondary px-3 py-2 text-xs">Edit</button>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Voucher No.', selected.voucherNo],
                    ['Invoice No.', selected.invoiceNo],
                    ['Guest', selected.name],
                    ['Mobile', selected.phone],
                    ['Destination', selected.destination || selected.packageTitle || selected.package?.title],
                    ['Check-in', displayDate(selected.checkInDate || selected.travelDate)],
                    ['Check-out', displayDate(selected.checkOutDate)],
                    ['Guests', selected.numberOfGuests],
                    ['Amount', formatINR(selected.invoiceAmount || selected.totalAmount)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-900 text-right">{v || '-'}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="label">Booking Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
                      <button key={s} onClick={() => updateStatus(selected._id, { status: s })} className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${selected.status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Payment Status</label>
                  <div className="flex gap-2">
                    {['unpaid', 'partial', 'paid'].map((s) => (
                      <button key={s} onClick={() => updateStatus(selected._id, { paymentStatus: s })} className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${selected.paymentStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => openPrintWindow('Booking Voucher', buildVoucher(selected, firm))} className="btn-secondary">Print Voucher</button>
                  <button onClick={() => openPrintWindow('GST Invoice', buildInvoice(selected, firm))} className="btn-secondary">Print Invoice</button>
                </div>
                <button onClick={() => remove(selected._id)} className="btn-danger w-full text-center">Delete Booking</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
