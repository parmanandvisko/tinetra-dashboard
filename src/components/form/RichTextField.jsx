import { useRef } from 'react'

const actions = [
  { label: 'B', title: 'Bold', before: '**', after: '**' },
  { label: 'I', title: 'Italic', before: '*', after: '*' },
  { label: 'H2', title: 'Heading', before: '## ', after: '' },
  { label: '•', title: 'Bullet', before: '- ', after: '' },
]

export default function RichTextField({ label, value, onChange, rows = 6, placeholder = '', maxLength }) {
  const ref = useRef(null)
  const text = value || ''

  const apply = ({ before, after }) => {
    const el = ref.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = text.slice(start, end)
    const next = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`.slice(0, maxLength || undefined)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition">
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
          {actions.map((action) => (
            <button
              key={action.title}
              type="button"
              title={action.title}
              onClick={() => apply(action)}
              className="min-w-8 h-8 px-2 rounded-md text-xs font-bold text-gray-600 hover:bg-white hover:text-primary border border-transparent hover:border-gray-200"
            >
              {action.label}
            </button>
          ))}
        </div>
        <textarea
          ref={ref}
          rows={rows}
          className="w-full px-3 py-2.5 text-sm focus:outline-none resize-y"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-1">
        Supports headings, bold, italic, bullets and line breaks.
        {maxLength ? ` ${text.length}/${maxLength} characters.` : ''}
      </p>
    </div>
  )
}
