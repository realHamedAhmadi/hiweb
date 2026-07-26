# Hiweb — Authentication Architecture (Draft)

Status: **Draft proposal for Section 3 (Authentication & Identity) and
Section 18 (Pi Network Integration)** — a starting point for review,
not a final decision. Both remain 🟡 Needs Discussion in the Master
Specification.

This document expands the authentication summary already sketched in
`backend-architecture.md` (Section 2 there) into more detail. It does
not contradict that document — same flow, same `User` entity from
`database-design.md` (`piUid`, `displayName`, `email`, `role`,
`accountStatus`) — just deeper on flow variations, session mechanics,
security, and identity edge cases. No authentication code and no Pi
SDK implementation are included here.

---

## 1. Pi Login authentication flow (detailed)

Extends the 7-step summary in `backend-architecture.md` with the
branches that summary didn't cover:

**Happy path:**
1. User clicks "Login with Pi" (currently a placeholder button in
   `Header.tsx` with no `onClick`).
2. Frontend invokes the Pi SDK's authentication method. This is Pi
   Network's own client-side widget — Hiweb does not build a login UI
   for it.
3. Pi SDK returns a Pi access token and basic Pi profile info (exact
   fields depend on Pi Network's API — not yet reviewed in detail).
4. Frontend sends the Pi access token to `POST /auth/pi-login`
   (proposed in `backend-architecture.md`).
5. Backend calls Pi's Platform API server-to-server to verify the
   token is genuine and current.
6. Backend resolves a `User` record by `piUid` — creates one if this
   is a first login (see Section 4, Identity handling, below).
7. Backend issues a session (mechanism discussed in Section 2 below).
8. Frontend stores whatever session artifact it receives and treats
   the user as logged in.

**Failure branches — not yet handled by any code, but named so they're
not forgotten:**
- **User cancels the Pi SDK flow** → frontend should return to a
  logged-out state; no backend call happens.
- **Pi SDK returns a token, but backend verification fails** (expired,
  malformed, or Pi's API rejects it) → backend should return an auth
  error; frontend should show a retry state, not silently treat the
  user as logged in.
- **Pi's Platform API is unreachable** (network/outage) → backend
  cannot verify identity at all; the honest behavior is to fail the
  login attempt, not fall back to trusting the frontend's claim.
- **Token verifies, but the resulting `User.accountStatus` is
  `suspended`** — per `database-design.md`, this field exists but its
  rules aren't decided (Section 2). This document flags that a
  suspended user successfully verifying with Pi should probably still
  be denied a session, but that's a recommendation, not a decision.

None of these branches are implemented; this section exists so the
eventual implementation has a checklist instead of only the happy path.

## 2. Session concept

**Decided.** Short-lived **JWT access token** (containing `userId` +
`role`, ~15–60 minutes expiry) + a longer-lived **refresh token stored
in an `httpOnly`, `Secure` cookie**, used only to silently obtain a new
access token when it expires.

**Reasoning:** Phase 3 of the approved MVP scope (`hiweb-master-specification.md`
Section 1, Item 6) already commits to native mobile apps. A pure
server-side session + cookie approach works cleanly for a single web
frontend, but cookies don't travel naturally to a native mobile client
the same way — a bearer token does. JWT keeps the same auth mechanism
usable across `apps/web` today and a future mobile client without a
redesign later. The refresh token still lives in an `httpOnly` cookie
(not client-side storage) specifically to keep it inaccessible to any
XSS-injected script, addressing the main weakness plain JWT-in-
localStorage would have.

**Trade-off accepted knowingly:** revoking a still-valid access token
before its short expiry isn't instant (no server-side session to
delete) — mitigated by keeping the access token's expiry short. Refresh
tokens, being longer-lived, should be tracked server-side (e.g. a
`RefreshToken` record, not yet added to `database-design.md` — flagged
as a follow-up schema addition, not designed here) so a logout or
suspected compromise can revoke them explicitly.

**Session lifecycle, with the above chosen:**
- **Creation** — access + refresh token pair issued at the end of a successful Pi Login flow (Step 7 above)
- **Expiry** — access token: short (exact minutes still tunable, not fixed here); refresh token: longer (e.g. days-to-weeks — exact duration still open)
- **Refresh** — frontend silently exchanges a valid refresh token for a new access token; no re-login required for that
- **Revocation / logout** — deletes/invalidates the refresh token record server-side; the access token simply expires shortly after (accepted trade-off above)
- **Concurrent sessions** — multiple refresh tokens per `User` (one per device) is the natural fit for this mechanism; whether that's user-visible/manageable is still open (Section 2, Users & Roles)

## 3. Security considerations

- **Server-side verification only.** The frontend's claim of "the Pi
  SDK gave me a valid token" is never trusted directly — Step 5 above
  (backend calling Pi's Platform API) is mandatory, not optional, for
  every login attempt.
- **Transport security.** All authentication traffic over HTTPS/TLS —
  consistent with the general Section 4 (Security) requirement, not
  specific to auth, but worth restating here since credentials/tokens
  are the highest-value traffic on the platform.
- **Cookie flags, if server-side sessions are chosen:** `httpOnly`
  (not readable by JS, mitigates XSS token theft), `Secure` (HTTPS
  only), `SameSite` (mitigates CSRF) — the specific `SameSite` value
  (`Strict` vs `Lax`) depends on whether any cross-site flows are
  needed (e.g. Pi Network's own redirect behavior) — not decided.
- **Token replay protection.** The Pi access token used in Step 4
  should not be reusable indefinitely — whether Hiweb enforces a
  short window, or relies entirely on Pi's own token expiry, is not
  decided.
- **Rate limiting the login endpoint.** `POST /auth/pi-login` is a
  natural target for abuse (credential stuffing doesn't apply the same
  way with Pi Login, but request flooding still does) — Section 4's
  general rate-limiting requirement applies here specifically; no
  concrete limit is set by this document.
- **Minimal data retention.** Only store what's needed on `User`
  (per `database-design.md`) — avoid persisting the raw Pi access
  token or any Pi profile fields beyond what the product actually
  uses.
- **Audit logging of authentication events** (login success, login
  failure, logout) — flagged as likely needed, consistent with the
  audit-logging note already raised in `database-design.md` Section 3,
  but not modeled as a concrete entity here — that's Section 4's call.
- **Role is never derived from Pi Login itself.** Pi Login only proves
  *identity* (this is piUid X), never *authorization* (this person is
  an admin). Every new `User` should default to `role: user`; granting
  `admin` is a separate, deliberate action (mechanism not decided —
  likely a manual/seeded process at MVP scale, per Section 2).

## 4. User identity handling

- **`piUid` is the stable unique identifier.** Per `database-design.md`,
  `User.piUid` is what a login resolves against — not email, which may
  not exist for a given user.
- **First login provisions a new `User` record** automatically, with
  `role` defaulting to `user` (see security note above) and whatever
  profile fields Pi Network's API provides mapped into `displayName`
  (and `email`, if Pi provides one and the product chooses to store
  it — not decided).
- **No duplicate accounts per `piUid`.** A returning user's login
  always resolves to their existing `User` row; the backend should
  look up before creating, never create unconditionally.
- **Pi profile changes (e.g. display name) after first login** — whether
  Hiweb re-syncs these on every login or only captures them once is not
  decided. Flagged so it isn't silently assumed either way.
- **No account linking across identity methods** is designed, because
  no second identity method exists yet — Section 3's open question
  about an email/password fallback would need this document revisited
  if that's ever added, since it would introduce the question of
  merging a Pi-authenticated identity with a password-authenticated
  one.

## 5. What this document does NOT decide

- Session mechanism (cookie vs. JWT) — Section 2 above lays out the
  choice but does not make it
- Exact session/token expiry durations
- Sandbox vs. mainnet Pi Platform API specifics (Section 18)
- MFA (not applicable to Pi Login directly; relevant only if a
  password-based fallback is ever introduced)
- KYC requirements tied to Pi Network compliance (explicitly a Section
  18 item, referenced but not addressed here)
- The mechanism for granting `admin` role (manual DB edit, an internal
  admin-invite flow, etc.) — flagged as needed, not designed
- Any concrete library, framework, or Pi SDK version

## 6. Suggested next step
Review this document alongside `backend-architecture.md` and
`database-design.md`, section by section, Decided / Needs Discussion /
Deferred — particularly the session mechanism choice in Section 2,
since that has downstream effects on infrastructure (Section 17) —
before any authentication code is written.
