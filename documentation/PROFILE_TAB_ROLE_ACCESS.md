# Profile: tab and section access by role

This document describes who can open each profile **section** (`?section=...` on the profile route). It is derived from:

- **Server enforcement:** `app/[locale]/(Home)/profile/page.tsx` (what users are allowed to load).
- **Navigation visibility:** `app/[locale]/(Home)/profile/_components/SideBar.tsx` and `MobileSidebar.tsx` (what appears in the sidebar). When these differ from the server, both behaviors are noted.

Roles in the Prisma `Role` enum include `USER`, `HOST`, `ADMIN`, `SUPERADMIN`, `WRITER`, and `SHOPOWNER`.

**Composite roles:** Users may have several roles at once (e.g. `HOST` + `WRITER`). Access is the **union** of every check that applies to any of their roles.

**“Writer-only”** means: `role` includes `WRITER`, and does **not** include `ADMIN`, `SUPERADMIN`, or `HOST`. Same idea for **“shop-owner-only”** with `SHOPOWNER`.

---

## Standard account settings (all signed-in users)

These sections have **no** role gate in `page.tsx`. Any authenticated user can open them.

| Section query value | Purpose (high level) |
|---------------------|----------------------|
| *(default / omitted)* | Main profile dashboard (`MyProfile`) |
| `my-profile` | Same as default for “current section” highlighting in the sidebar |
| `update-profile` | Update profile form |
| `change-password` | Password form |
| `delete-account` | Delete account form |
| `subscription` | Subscription / payment history view |
| `privacy-policy` | Privacy policy content |

---

## Admin section: server access (`page.tsx`)

The table below is the **authoritative** access matrix for loading content. **`ADMIN`** and **`SUPERADMIN`** are treated the same unless noted. **`HOST`** is included only where indicated.

**`WRITER`:** For post admin sections, access is granted if `role` includes `WRITER` (even without `ADMIN`/`SUPERADMIN`).

**`SHOPOWNER`:** For shop admin sections, access is granted if `role` includes `SHOPOWNER` (even without `ADMIN`/`SUPERADMIN`). `admin-edit-shop` also allows `HOST` (unchanged).

| Section | HOST | ADMIN | SUPERADMIN | WRITER | SHOPOWNER | Notes |
|---------|:----:|:-----:|:----------:|:------:|:---------:|-------|
| `admin-payment-management` | ✓ | ✓ | ✓ | ✗ | ✗ | Supports `page` / `pageSize` query params |
| `admin-email-composition` | ✓ | ✓ | ✓ | ✗ | ✗ | |
| `admin-all-events` | ✓ | ✓ | ✓ | ✗ | ✗ | **HOST** sees only events they host; **ADMIN**/**SUPERADMIN** see all events |
| `admin-create-event` | ✓ | ✓ | ✓ | ✗ | ✗ | |
| `admin-event-categories` | ✗ | ✓ | ✓ | ✗ | ✗ | |
| `admin-event-series` | ✗ | ✓ | ✓ | ✗ | ✗ | |
| `admin-manage-sponsors` | ✗ | ✓ | ✓ | ✗ | ✗ | |
| `admin-event-statistics` | ✓ | ✓ | ✓ | ✗ | ✗ | |
| `admin-edit-event` | ✓ | ✓ | ✓ | ✗ | ✗ | Requires `eventKeyName` |
| `admin-create-job` | ✗ | ✓ | ✓ | ✗ | ✗ | |
| `admin-all-jobs` | ✗ | ✓ | ✓ | ✗ | ✗ | |
| `admin-edit-job` | ✗ | ✓ | ✓ | ✗ | ✗ | Requires `jobId` |
| `admin-all-posts` | ✗ | ✓ | ✓ | ✓ | ✗ | |
| `admin-create-post` | ✗ | ✓ | ✓ | ✓ | ✗ | |
| `admin-edit-post` | ✗ | ✓ | ✓ | ✓ | ✗ | Requires `postId` |
| `admin-create-shop` | ✗ | ✓ | ✓ | ✗ | ✓ | |
| `admin-all-shops` | ✗ | ✓ | ✓ | ✗ | ✓ | |
| `admin-edit-shop` | ✓ | ✓ | ✓ | ✗ | ✓ | Requires `shopId`. **HOST** without **SHOPOWNER** does not see **Manage shops** in the sidebar but can still open this section if they have the URL |

If the user’s roles do not satisfy the check, the page returns: *“You do not have permission to view this page.”*

### Writer-only and shop-owner-only (effective admin surface)

If a user has **no** `HOST`, `ADMIN`, or `SUPERADMIN`, the only **admin** sections they can load are:

| Situation | Allowed admin sections |
|-----------|-------------------------|
| **Writer-only** | `admin-all-posts`, `admin-create-post`, `admin-edit-post` |
| **Shop-owner-only** | `admin-create-shop`, `admin-all-shops`, `admin-edit-shop` |
| **Writer-only + shop-owner-only** (both, still no admin/host/super) | Union of the two rows above |

Users with `HOST` and/or `ADMIN`/`SUPERADMIN` use the main table; extra roles (`WRITER`, `SHOPOWNER`) **add** access where those columns show ✓.

---

## Sidebar and mobile nav (what users *see*)

The **Admin Section** block is shown when **any** of:

- `HOST`, `ADMIN`, or `SUPERADMIN`, **or**
- **Writer-only** (see above), **or**
- **Shop-owner-only** (see above).

So users who are only writers and/or only shop owners still see an “Admin Section” heading, but only the dropdowns they are allowed to use.

Within that block:

| Item | HOST (no admin/super) | ADMIN / SUPERADMIN | WRITER (any) | SHOPOWNER (any) |
|------|:---------------------:|:------------------:|:------------:|:---------------:|
| Event manager (`admin-event-statistics`) | ✓ | ✓ | — | — |
| Payment management (`admin-payment-management`) | ✗ | ✓ | — | — |
| Email composition (`admin-email-composition`) | ✓ | ✓ | — | — |
| **Manage events** (full dropdown) | ✓ | ✓ | ✗ | ✗ |
| **Manage events** → Tags / series / sponsors | ✗ | ✓ | ✗ | ✗ |
| **Manage jobs** | ✗ | ✓ | ✗ | ✗ |
| **Manage shops** | ✗ | ✓ | ✗ | ✓ |
| **Manage posts** | ✗ | ✓ | ✓ | ✗ |

Notes:

- **HOST** without `WRITER` does **not** see **Manage posts** in the nav (server still allows post sections only if `WRITER` is present).
- **Manage shops** appears for `SHOPOWNER` even without `ADMIN`/`SUPERADMIN` (shop-owner-only).
- **Manage posts** appears for any user with `WRITER`, including writer-only.

There is **no** direct sidebar link for edit-only sections (`admin-edit-event`, `admin-edit-job`, `admin-edit-post`, `admin-edit-shop`); users reach them from flows inside the corresponding admin tools or bookmarks. **HOST** users do not see **Payment management** in the nav even though the server allows that section if they open the URL manually.

---

## Related files

- `app/[locale]/(Home)/profile/page.tsx` — section routing and permission checks
- `app/[locale]/(Home)/profile/_components/SideBar.tsx` — desktop nav
- `app/[locale]/(Home)/profile/_components/MobileSidebar.tsx` — mobile nav
