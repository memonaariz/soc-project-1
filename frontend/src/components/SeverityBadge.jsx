const map = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
  INFORMATIONAL: 'badge-info',
  UNKNOWN: 'badge-info',
}

export default function SeverityBadge({ severity }) {
  return (
    <span className={map[severity] || 'badge-info'}>
      {severity}
    </span>
  )
}
