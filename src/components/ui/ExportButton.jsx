import { exportToExcel } from '../../utils/exportExcel'

export default function ExportButton({ filename, rows, columns, disabled }) {
  const isDisabled = disabled || rows.length === 0

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => exportToExcel(filename, rows, columns)}
      className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      Export Excel
    </button>
  )
}
