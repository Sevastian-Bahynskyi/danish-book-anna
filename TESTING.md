# Testing

## Test account (live site)

| | |
|---|---|
| Phone | `+45 00 00 00 99` (or just `00000099`) |
| Password | `Test-X1pbBT28afmNP8` |

- It is an **admin**, so you can check the admin panel as well as the book.
- It is **hidden**: `profiles.is_test = true`. It does not appear in Anna's user list and does not count in the statistics. It also doesn't count as "the first account", so it could never take the admin role from Anna.
- Like every admin, it can be signed in on several devices at once. The one-active-session rule only applies to regular readers.
- It can only be managed with SQL, for example resetting the password through the Supabase dashboard (Authentication → Users, email `p4500000099@phone.dansk-paa-arbejde.app`).

## Phone layout check (no network needed)

```sh
cd client
npm run build:web
npm run test:layout            # CHROMIUM=/path/to/chrome if Playwright's browser isn't installed
```

`e2e/layout.mjs` serves the build with a mocked backend (fake admin, the real book content). It opens every screen at 320, 375, 430 and 1280px, in the light and dark themes. It fails if:
- sibling blocks overlap each other,
- anything sticks out past the right edge of the screen,
- or the page throws an error.

Options:
- `WIDTHS=375` limits the run to one width.
- `SHOTS=<dir>` saves screenshots.

Run it before every release that touches layout.

## Checking the live API from a cloud session

The sandbox can't open `*.supabase.co` directly. Use the Supabase MCP instead:

1. `create extension if not exists http` (as its own `execute_sql` call).
2. Sign in with the test account: POST `/auth/v1/token?grant_type=password` with the email `p4500000099@phone.dansk-paa-arbejde.app` and the publishable key from `client/.env`.
3. Call `/rest/v1/rpc/claim_session`, then read the content with the `x-session-id` header.
4. Run each step as a separate `execute_sql` call, because work inside one transaction isn't visible to the HTTP calls.
5. Finish with `drop extension if exists http;`.
