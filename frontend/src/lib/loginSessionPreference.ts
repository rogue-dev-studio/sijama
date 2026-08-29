/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 14:00:00
 */

export type LoginSessionPreference = {
  untilLogout: boolean
  minutesInput: string
}

const STORAGE_KEY = 'sijama.login_session_pref'

const DEFAULT_PREFERENCE: LoginSessionPreference = {
  untilLogout: false,
  minutesInput: '',
}

export function readLoginSessionPreference(): LoginSessionPreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PREFERENCE }

    const parsed = JSON.parse(raw) as Partial<LoginSessionPreference>
    return {
      untilLogout: parsed.untilLogout === true,
      minutesInput: typeof parsed.minutesInput === 'string' ? parsed.minutesInput : '',
    }
  } catch {
    return { ...DEFAULT_PREFERENCE }
  }
}

export function writeLoginSessionPreference(preference: LoginSessionPreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
  } catch {
    /* ignore quota / private mode */
  }
}

export function syncPreferenceFromRememberMinutes(
  minutes: number | null | undefined,
  untilLogout = false,
): LoginSessionPreference {
  if (untilLogout) {
    return { untilLogout: true, minutesInput: '' }
  }

  if (minutes == null) {
    return { untilLogout: false, minutesInput: '' }
  }

  return { untilLogout: false, minutesInput: String(minutes) }
}
