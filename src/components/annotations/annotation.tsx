import { match } from 'ts-pattern'

type AnnotationProps = {
  y: number
  x: number
  type: 'crux' | 'rest'
  name: string
  rating?: number // 1-5 difficulty or rest quality
}

type AnnotationStyle = {
  readonly fill: string
  readonly stroke: string
  readonly strokeWidth: string
  readonly shape: 'triangle' | 'circle'
}

export const Annotation = ({ x, y, type, name, rating }: AnnotationProps) => {
  const style: AnnotationStyle = match(type)
    .with('crux', () => ({
      fill: '#ff4444',
      stroke: '#cc0000',
      strokeWidth: '2',
      shape: 'triangle' as const,
    }))
    .with('rest', () => ({
      fill: '#44ff44',
      stroke: '#00cc00',
      strokeWidth: '2',
      shape: 'circle' as const,
    }))
    .exhaustive()

  const markerSize = 10

  const renderMarker = () =>
    match(style.shape)
      .with('triangle', () => {
        const trianglePoints = `${x},${y - markerSize} ${x - markerSize},${y + markerSize} ${x + markerSize},${y + markerSize}`
        return <polygon points={trianglePoints} fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
      })
      .with('circle', () => (
        <circle
          cx={x}
          cy={y}
          r={markerSize / 2}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
        />
      ))
      .exhaustive()

  return (
    <g>
      {renderMarker()}
      <text
        x={x + markerSize + 6}
        y={y + 4}
        fontSize="13"
        fill="#333333"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
        fontWeight="500"
      >
        {name}
        {rating !== undefined ? ` (${rating}/5)` : ''}
      </text>
    </g>
  )
}
