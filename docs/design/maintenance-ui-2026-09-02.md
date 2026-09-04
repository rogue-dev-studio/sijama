# UI Maintenance — 2026-09-02 — SIJAMA

Shift: `SHIFT-2026-09-02-01`

---

## Theme gate (sample routes)

| Route | Theme aligned | Consistency | A11y | Notes |
|-------|---------------|-------------|------|-------|
| `/login` | partial | MAINT-FE-006 vs maintenance page | ok | Public gate split |
| `/` dashboard | ok | tokens | loading no live region MAINT-FE-011 | |
| Master lists | ok | SimpleMasterList pattern | error alert fixed tick 1 | |
| `/master/hak-akses` | ok | — | — | FE-001 refetch fixed |

---

## Fixed tick 1

- **MAINT-FE-012:** Sidebar `NavBranch` expands when child route active
- **MAINT-FE-010 (partial):** `role="alert"` on `SimpleMasterListPage` errors

---

## Deferred

- MAINT-FE-002 route lazy loading (M)
- MAINT-FE-006 public auth/maintenance visual unify (M)
- MAINT-FE-007 token drift in App.css (M)
- MAINT-FE-003 mobile more sheet focus trap (S)

---

## UI/UX verdict tick 1

**pass** for scoped fixes · **defer** full theme audit to tick 2+
