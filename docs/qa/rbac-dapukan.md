# QA — RBAC Dapukan

Date: 2026-08-01

| Case | Result |
|------|--------|
| Login superadmin → dapukan + permissions + menus | pass (39 perms, 6 menus) |
| Login admin (operator@) | pass (35 perms) |
| Login 5s (petugas@) | pass (7 perms, 5 menus) |
| 5s akses GET /api/master/dapukan | pass (403) |
| Migrasi RBAC + RbacSeeder | pass |
| GET /api/master/dapukan (superadmin) | pass (3: superadmin, admin, 5s) |
| GET /api/master/matriks | pass (3 dapukan, 39 hak) |
