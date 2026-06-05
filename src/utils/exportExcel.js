function escapeCell(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(', ')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return value
}

export function exportToExcel(filename, rows, columns) {
  const tableRows = rows.map((row) => (
    `<tr>${columns.map((column) => `<td>${escapeCell(formatValue(column.value(row)))}</td>`).join('')}</tr>`
  )).join('')

  const headerRows = `<tr>${columns.map((column) => `<th>${escapeCell(column.label)}</th>`).join('')}</tr>`
  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>${headerRows}</thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleString() : ''
}
