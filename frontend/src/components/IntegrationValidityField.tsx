/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:51:00
 */

import { DateField } from '../components/DateField'
import { validityLabel } from '../lib/integrationMeta'

type Props = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function IntegrationValidityField({
  id,
  label = 'Masa berlaku',
  value,
  onChange,
  disabled,
}: Props) {
  const status = validityLabel(value || null)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <DateField id={id} value={value} onChange={onChange} disabled={disabled} />
      <p className={`field-hint integration-validity integration-validity--${status.tone}`}>
        {status.text}
      </p>
    </div>
  )
}
