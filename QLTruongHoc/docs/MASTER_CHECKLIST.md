# MASTER CHECKLIST — QLTruongHoc

## Sprint 0D.1 — Shared UI + Routing + User Aggregation

### Shared components
- [x] Form appearance config.
- [x] FormField.
- [x] TextField.
- [x] SelectField.
- [x] DateField.
- [x] DateTimeField.
- [x] CurrencyInput.
- [x] Shared CSS.
- [x] User page migrated to shared controls.
- [ ] Audit page migrated to shared controls.
- [ ] Role page migrated to shared controls.
- [ ] Login page migrated to shared controls.

### User aggregation
- [x] Aggregate by user ID.
- [x] Roles array.
- [x] One row per user.
- [x] Role badges.
- [x] Reload user list after assignment panel closes.
- [ ] Aggregate units summary.
- [ ] Server-side pagination/search.

### Routing
- [x] Add react-router-dom.
- [x] BrowserRouter.
- [x] Central appRoutes config.
- [x] NavLink sidebar.
- [x] Route per page.
- [x] Reload preserves page.
- [x] Browser back/forward.
- [x] Root redirect.
- [x] Unknown route redirect.
- [ ] Route permission guard.
- [ ] 403 page.
- [ ] Breadcrumb.

### Runtime
- [ ] `pnpm install`.
- [ ] `pnpm typecheck`.
- [ ] Reload `/users`.
- [ ] Reload `/roles`.
- [ ] Reload `/audit-logs`.
- [ ] One row per user.
- [ ] Multiple role badges.
- [ ] Shared controls display correctly.
- [ ] User confirms PASS.

## Next
- [ ] Sprint 0D.2 Route Permission Guard.
- [ ] Sprint 1 — Tuyển sinh.
