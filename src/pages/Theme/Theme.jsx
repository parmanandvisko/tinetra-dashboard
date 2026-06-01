import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const THEMES = [
  // ── Light Themes ──────────────────────────────────────────────
  {
    id: 'crimson-gold', name: 'Crimson & Gold', desc: 'Classic royal red with golden accents', tag: 'Default',
    primary: '#8B1A1A', gold: '#D4A017', bg: '#ffffff', surface: '#f9fafb', dark: false,
    preview: ['#8B1A1A', '#D4A017', '#ffffff', '#f3f4f6'],
  },
  {
    id: 'ocean-blue', name: 'Ocean Blue', desc: 'Deep ocean blue with sky blue accents', tag: 'Soft',
    primary: '#1E40AF', gold: '#0EA5E9', bg: '#ffffff', surface: '#EFF6FF', dark: false,
    preview: ['#1E40AF', '#0EA5E9', '#ffffff', '#EFF6FF'],
  },
  {
    id: 'forest-green', name: 'Forest Green', desc: 'Fresh forest green with lime accents', tag: 'Soft',
    primary: '#166534', gold: '#65A30D', bg: '#ffffff', surface: '#F0FDF4', dark: false,
    preview: ['#166534', '#65A30D', '#ffffff', '#F0FDF4'],
  },
  {
    id: 'rose-pink', name: 'Rose & Blush', desc: 'Elegant rose with soft pink accents', tag: 'Soft',
    primary: '#9D174D', gold: '#EC4899', bg: '#ffffff', surface: '#FDF2F8', dark: false,
    preview: ['#9D174D', '#EC4899', '#ffffff', '#FDF2F8'],
  },
  {
    id: 'warm-sunset', name: 'Warm Sunset', desc: 'Fiery orange sunset with amber glow', tag: 'Trending',
    primary: '#C2410C', gold: '#F59E0B', bg: '#ffffff', surface: '#FFF7ED', dark: false,
    preview: ['#C2410C', '#F59E0B', '#ffffff', '#FFF7ED'],
  },
  {
    id: 'royal-sapphire', name: 'Royal Sapphire', desc: 'Royal blue with deep violet accents', tag: 'Trending',
    primary: '#1D4ED8', gold: '#7C3AED', bg: '#ffffff', surface: '#EFF6FF', dark: false,
    preview: ['#1D4ED8', '#7C3AED', '#ffffff', '#EFF6FF'],
  },
  // ── Dark Themes ───────────────────────────────────────────────
  {
    id: 'dark-violet', name: 'Dark Violet', desc: 'Sleek dark interface with violet accents', tag: 'Dark',
    primary: '#7C3AED', gold: '#10B981', bg: '#111827', surface: '#1F2937', dark: true,
    preview: ['#7C3AED', '#10B981', '#1f2937', '#111827'],
  },
  {
    id: 'dark-navy', name: 'Dark Navy', desc: 'Deep navy darkness with electric blue', tag: 'Dark',
    primary: '#3B82F6', gold: '#38BDF8', bg: '#0F172A', surface: '#1E293B', dark: true,
    preview: ['#3B82F6', '#38BDF8', '#1e293b', '#0f172a'],
  },
  {
    id: 'neon-cyber', name: 'Neon Cyberpunk', desc: 'Dark background with glowing neon colors', tag: 'Neon',
    primary: '#22D3EE', gold: '#A3E635', bg: '#030712', surface: '#0D1B2A', dark: true,
    preview: ['#22D3EE', '#A3E635', '#0d1b2a', '#030712'],
  },
  {
    id: 'pure-black', name: 'Pure Black', desc: 'Jet black with gold highlights', tag: 'Dark',
    primary: '#F59E0B', gold: '#FBBF24', bg: '#000000', surface: '#111111', dark: true,
    preview: ['#F59E0B', '#FBBF24', '#111111', '#000000'],
  },
]

const tagColors = {
  Default: 'bg-red-100 text-red-700',
  Soft: 'bg-blue-100 text-blue-700',
  Trending: 'bg-orange-100 text-orange-700',
  Dark: 'bg-gray-800 text-gray-200',
  Neon: 'bg-purple-100 text-purple-700',
}

export default function Theme() {
  const [active, setActive] = useState('crimson-gold')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/settings').then((r) => {
      if (r.data.data?.activeTheme) setActive(r.data.data.activeTheme)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/settings', { activeTheme: active })
      toast.success('Theme applied to live website!')
    } catch {
      toast.error('Failed to save theme')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  const selected = THEMES.find(t => t.id === active)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Website Theme</h2>
        <p className="text-sm text-gray-500 mt-1">Select a theme — changes apply to the live website within 10 seconds.</p>
      </div>

      {/* Light Themes */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Light Themes</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.filter(t => !t.dark).map(theme => <ThemeCard key={theme.id} theme={theme} active={active} setActive={setActive} />)}
        </div>
      </div>

      {/* Dark Themes */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Dark Themes</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {THEMES.filter(t => t.dark).map(theme => <ThemeCard key={theme.id} theme={theme} active={active} setActive={setActive} />)}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="card p-5 flex items-center gap-6 flex-wrap sticky bottom-4">
        <div className="flex items-center gap-3">
          {selected.preview.map((c, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{selected.name}</p>
          <p className="text-xs text-gray-400">{selected.desc}</p>
        </div>
        <button onClick={save} disabled={saving} className="ml-auto btn-primary disabled:opacity-70 flex items-center gap-2 px-6">
          {saving ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Applying...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Apply to Website</>
          )}
        </button>
      </div>
    </div>
  )
}

function ThemeCard({ theme, active, setActive }) {
  const isActive = active === theme.id
  const tagColors = {
    Default: 'bg-red-100 text-red-700', Soft: 'bg-blue-100 text-blue-700',
    Trending: 'bg-amber-100 text-amber-700', Dark: 'bg-gray-700 text-gray-200', Neon: 'bg-purple-100 text-purple-700',
  }

  return (
    <button
      onClick={() => setActive(theme.id)}
      className={`relative text-left rounded-2xl border-2 p-4 transition-all ${isActive ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}
    >
      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColors[theme.tag] || 'bg-gray-100 text-gray-600'}`}>
        {theme.tag}
      </span>

      {/* Color swatches */}
      <div className="flex gap-2 mb-3">
        {theme.preview.map((color, i) => (
          <div key={i} className="w-7 h-7 rounded-lg border border-black/10 shadow-sm" style={{ backgroundColor: color }} />
        ))}
      </div>

      {/* Mini preview */}
      <div className="rounded-xl overflow-hidden border border-gray-100 mb-3" style={{ backgroundColor: theme.preview[2] }}>
        <div className="px-2 py-1.5 flex items-center justify-between" style={{ backgroundColor: theme.preview[2] }}>
          <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-5 h-1 rounded-full" style={{ backgroundColor: theme.preview[3] }} />)}
            <div className="w-8 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
          </div>
        </div>
        <div className="mx-1.5 mb-1.5 rounded-lg p-2" style={{ backgroundColor: theme.preview[3] }}>
          <div className="w-14 h-1.5 rounded-full mb-1" style={{ backgroundColor: theme.gold }} />
          <div className="w-20 h-2 rounded-full mb-1" style={{ backgroundColor: theme.primary }} />
          <div className="w-10 h-4 rounded-full mt-2" style={{ backgroundColor: theme.primary }} />
        </div>
        <div className="flex gap-1 px-1.5 pb-1.5">
          {[1,2,3].map(i => (
            <div key={i} className="flex-1 rounded-lg" style={{ backgroundColor: theme.preview[3] }}>
              <div className="h-4 rounded-t-lg" style={{ backgroundColor: theme.primary, opacity: 0.3 }} />
              <div className="p-0.5">
                <div className="h-1 rounded-full" style={{ backgroundColor: theme.primary, opacity: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="font-bold text-gray-900 text-xs">{theme.name}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{theme.desc}</p>

      {isActive && (
        <div className="absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.primary }}>
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}
