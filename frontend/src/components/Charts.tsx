interface ChartPoint {
  label: string
  value: number
}

function niceMax(value: number) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

function yTicks(max: number, count = 5) {
  const step = max / count
  return Array.from({ length: count + 1 }, (_, index) => Math.round(step * index))
}

function mosqueBarPath(x: number, baseline: number, width: number, barHeight: number) {
  if (barHeight <= 0) return ''

  const domeHeight = Math.min(28, Math.max(14, barHeight * 0.28))
  const bodyHeight = Math.max(barHeight - domeHeight, 2)
  const left = x
  const right = x + width
  const mid = x + width / 2
  const bodyTop = baseline - bodyHeight
  const tip = bodyTop - domeHeight
  const shoulder = bodyTop - domeHeight * 0.18

  return [
    `M ${left} ${baseline}`,
    `L ${left} ${bodyTop}`,
    `C ${left} ${shoulder}, ${mid - width * 0.08} ${tip + domeHeight * 0.48}, ${mid} ${tip}`,
    `C ${mid + width * 0.08} ${tip + domeHeight * 0.48}, ${right} ${shoulder}, ${right} ${bodyTop}`,
    `L ${right} ${baseline}`,
    'Z',
  ].join(' ')
}

export function SimpleBarChart({
  title,
  data,
  emptyText = 'Belum ada data.',
}: {
  title: string
  data: ChartPoint[]
  emptyText?: string
}) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="chart-panel">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p className="empty-state">{emptyText}</p>
      ) : (
        <div className="bar-chart" role="img" aria-label={title}>
          {data.map((item) => (
            <div key={item.label} className="bar-chart__row">
              <span className="bar-chart__label" title={item.label}>
                {item.label}
              </span>
              <div className="bar-chart__track">
                <div
                  className="bar-chart__fill"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
              <span className="bar-chart__value">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SimpleColumnChart({
  title,
  data,
  emptyText = 'Belum ada data.',
  yAxisLabel,
  xAxisLabel = 'Periode',
  denseLabels = false,
  embedded = false,
}: {
  title: string
  data: ChartPoint[]
  emptyText?: string
  yAxisLabel?: string
  xAxisLabel?: string
  denseLabels?: boolean
  embedded?: boolean
}) {
  const rawMax = Math.max(...data.map((item) => item.value), 1)
  const max = niceMax(rawMax)
  const ticks = yTicks(max, 5)

  const leftPad = 48
  const rightPad = 16
  const topPad = 28
  const bottomPad = denseLabels ? 72 : 42
  const plotHeight = 168
  const slotFloor = denseLabels ? 48 : 42
  const slot = Math.max(slotFloor, Math.min(56, Math.floor(560 / Math.max(data.length, 1))))
  const barWidth = Math.max(16, Math.floor(slot * (denseLabels ? 0.48 : 0.55)))
  const width = leftPad + rightPad + Math.max(data.length, 1) * slot
  const height = topPad + plotHeight + bottomPad
  const baseline = topPad + plotHeight

  const body =
    data.length === 0 ? (
      <p className="empty-state">{emptyText}</p>
    ) : (
      <div className="column-chart" role="img" aria-label={title || xAxisLabel}>
        <svg viewBox={`0 0 ${width} ${height}`} className="column-chart__svg" preserveAspectRatio="xMidYMid meet">
          {ticks.map((tick) => {
            const y = baseline - (tick / max) * plotHeight
            return (
              <g key={`tick-${tick}`}>
                <text
                  x={leftPad - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="column-chart__axis-num"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {yAxisLabel && (
            <text
              className="column-chart__axis-title"
              transform={`translate(14 ${topPad + plotHeight / 2}) rotate(-90)`}
              textAnchor="middle"
            >
              {yAxisLabel}
            </text>
          )}

          {data.map((item, index) => {
            const barHeight = (item.value / max) * plotHeight
            const x = leftPad + index * slot + (slot - barWidth) / 2
            const tipY = baseline - barHeight
            const path = mosqueBarPath(x, baseline, barWidth, barHeight)
            const hitTop = Math.min(tipY, baseline - 8)
            const labelX = x + barWidth / 2
            const labelY = baseline + (denseLabels ? 14 : 16)

            return (
              <g key={item.label} className="column-chart__bar-group">
                <title>{`${item.label}: ${item.value}`}</title>
                <rect
                  className="column-chart__hit"
                  x={x - 4}
                  y={hitTop}
                  width={barWidth + 8}
                  height={baseline - hitTop + (denseLabels ? 40 : 20)}
                />
                {path && <path d={path} className="column-chart__dome-bar" />}
                <text
                  x={labelX}
                  y={Math.max(14, tipY - 8)}
                  textAnchor="middle"
                  className="column-chart__num"
                >
                  {item.value}
                </text>
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={denseLabels ? 'end' : 'middle'}
                  className={`column-chart__tick${denseLabels ? ' column-chart__tick--angled' : ''}`}
                  transform={denseLabels ? `rotate(-40 ${labelX} ${labelY})` : undefined}
                >
                  {item.label}
                </text>
              </g>
            )
          })}

          <line
            x1={leftPad}
            y1={baseline}
            x2={width - rightPad}
            y2={baseline}
            className="column-chart__baseline"
          />
          <text
            x={(leftPad + width - rightPad) / 2}
            y={height - 8}
            textAnchor="middle"
            className="column-chart__axis-title"
          >
            {xAxisLabel}
          </text>
        </svg>
      </div>
    )

  if (embedded) {
    return <div className="column-chart-embed">{body}</div>
  }

  return (
    <div className={`chart-panel${denseLabels ? ' chart-panel--wide' : ''}`}>
      {title ? <h2>{title}</h2> : null}
      {body}
    </div>
  )
}
