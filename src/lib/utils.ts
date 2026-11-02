import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert data to downloadable CSV
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(','))
  ].join('\r\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Generate simple avatar placeholder data URL with initials
export function generateInitialsAvatar(name: string, bg: string = '#0284c7'): string {
  const canvas = document.createElement('canvas')
  canvas.width = 120
  canvas.height = 120
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 120, 120)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 44px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()

  ctx.fillText(initials, 60, 60)
  return canvas.toDataURL('image/png')
}
