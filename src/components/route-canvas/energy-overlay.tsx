import type { EnergyPoint } from '../../lib/tactical-engine'
import type { Annotation } from '../../types'

// Three-stop gradient: green (100) → orange (50) → red (0)
const energyToColor = (energy: number): string => {
  const t = energy / 100
  if (t >= 0.5) {
    // green → orange (t=0.5 to 1.0, mapped to 0→1)
    const u = (t - 0.5) * 2
    const r = Math.round(255 - (255 - 56) * u)   // 255 → 56
    const g = Math.round(140 + (161 - 140) * u)   // 140 → 161
    const b = Math.round(0 + (105 - 0) * u)       // 0 → 105
    return `rgb(${r},${g},${b})`
  } else {
    // red → orange (t=0 to 0.5, mapped to 0→1)
    const u = t * 2
    const r = Math.round(229 - (229 - 255) * u)   // 229 → 255
    const g = Math.round(62 + (140 - 62) * u)     // 62 → 140
    const b = Math.round(62 + (0 - 62) * u)       // 62 → 0
    return `rgb(${r},${g},${b})`
  }
}

type Props = {
  energyProfile: EnergyPoint[]
  annotations: readonly Annotation[]
  canvasWidth: number
  canvasHeight: number
}

export const EnergyOverlay = ({ energyProfile, annotations, canvasWidth, canvasHeight }: Props) => {
  if (energyProfile.length === 0) {
    return null
  }

  // Sort by y DESCENDING — bottom of canvas = start of route (full energy)
  const sorted = [...energyProfile]
    .map((ep) => {
      const annotation = annotations.find((a) => a.id === ep.annotationId)
      return { ...ep, y: annotation?.y ?? 0 }
    })
    .sort((a, b) => b.y - a.y)

  const barX = canvasWidth - 18
  const barWidth = 8

  // Build segments bottom-to-top (start → finish of route)
  const segments: { y1: number; y2: number; color: string }[] = []

  // From bottom of canvas to first annotation (highest y) — full energy
  const first = sorted[0]
  if (first && first.y < canvasHeight) {
    segments.push({ y1: first.y, y2: canvasHeight, color: energyToColor(100) })
  }

  // Between annotations (bottom to top)
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    if (!current) continue
    const y2 = current.y
    const y1 = next?.y ?? 0
    segments.push({ y1, y2, color: energyToColor(current.energyAfter) })
  }

  const trueCrux = sorted.find((ep) => ep.isTrueCrux)

  return (
    <g>
      {/* Energy bar segments */}
      {segments.map((seg, i) => (
        <rect
          key={i}
          x={barX}
          y={seg.y1}
          width={barWidth}
          height={Math.max(1, seg.y2 - seg.y1)}
          fill={seg.color}
          opacity={0.85}
        />
      ))}

      {/* Bar border */}
      <rect
        x={barX}
        y={0}
        width={barWidth}
        height={canvasHeight}
        fill="none"
        stroke="#ccc"
        strokeWidth="0.5"
        opacity={0.5}
      />

      {/* ⚡ label at top (finish line) */}
      <text
        x={barX + barWidth / 2}
        y={12}
        textAnchor="middle"
        fontSize="8"
        fill="#666"
        fontFamily="-apple-system, sans-serif"
      >
        ⚡
      </text>

      {/* Tick marks and energy% at each annotation */}
      {sorted.map((ep) => (
        <g key={ep.annotationId}>
          <line
            x1={barX - 4}
            y1={ep.y}
            x2={barX + barWidth}
            y2={ep.y}
            stroke="#666"
            strokeWidth="0.75"
            opacity={0.6}
          />
          <text
            x={barX - 6}
            y={ep.y + 3}
            textAnchor="end"
            fontSize="7"
            fill="#888"
            fontFamily="-apple-system, sans-serif"
          >
            {Math.round(ep.energyBefore)}%
          </text>
        </g>
      ))}

      {/* True crux highlight ring */}
      {trueCrux && (
        <>
          <circle
            cx={canvasWidth - 80}
            cy={trueCrux.y}
            r={16}
            fill="none"
            stroke="#e53e3e"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity={0.8}
          />
          <text
            x={canvasWidth - 80}
            y={trueCrux.y - 20}
            textAnchor="middle"
            fontSize="8"
            fill="#e53e3e"
            fontWeight="bold"
            fontFamily="-apple-system, sans-serif"
          >
            TRUE CRUX
          </text>
        </>
      )}
    </g>
  )
}
