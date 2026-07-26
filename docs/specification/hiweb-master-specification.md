# Hiweb — Master Specification
*Status legend: ✅ Decided · 🟡 Needs Discussion · ⏸ Deferred*
*This document reflects only what has been explicitly decided. Unreviewed sections are marked 🟡 by default — silence is never treated as approval.*

---

## 1. Product & Business

1. **Core problem statement** — ✅ Decided
   Hiweb solves the lack of a professional, secure, trustworthy digital services platform dedicated to the Pi Network ecosystem, connecting Pi users and businesses with high-quality software and digital solutions.

2. **Target market / geography** — ✅ Decided
   Global market. Primary language: English. Additional supported languages: Persian, Arabic, Turkish, French. Designed for worldwide expansion.

3. **Primary user personas** — ✅ Decided
   Individual Pi users, entrepreneurs, SMBs, startups, Pi ecosystem projects, enterprise clients, platform administrators.

4. **Value proposition vs. competitors** — ✅ Decided
   Differentiated by native Pi Network integration, enterprise-level security, production-quality development, professional UI/UX, transparent process, admin-managed dynamic content, scalability, multi-language support, mobile-first experience, reliable support. Positioned as a trusted professional platform, not a freelance marketplace.

5. **Monetization model** — ✅ Decided
   Fixed-price service packages; custom project quotations; domain & hosting services; maintenance & support plans; future subscription services; future AI-powered premium services. Pi Payment integration supported when appropriate (Phase 2).

6. **MVP scope vs. Phase 2/3** — ✅ Decided
   - **MVP:** Home, About, Services, Individual Service Pages, Portfolio, Contact, Pi Login, User role, Admin role, Admin Dashboard, CMS, FAQ, Portfolio Management, Service Management, Responsive Design, Multi-language infrastructure, production-ready security, quotation/inquiry-based service requests (no online payment), User Profile, User Request History, Request Status tracking, Admin Quotation Management.
   - **Phase 2:** User Dashboard, Project Management, Service Requests (expanded), Order Tracking, Notifications, Messaging, Analytics, API integrations, **Pi Payments**.
   - **Phase 3:** AI Assistant, Subscription services, Mobile applications, Advanced automation.

   **Architecture note (not yet designed):** MVP request status list is fixed as: `Submitted → Under Review → Quotation Sent → Approved → Rejected → In Progress → Completed → Cancelled`. Users must always see the current status of their requests. **Transition rules between statuses are intentionally undefined** — to be fully designed during Database Design, Admin Dashboard, User Dashboard, and Workflow Engine sections.

7. **Success metrics (KPIs)** — ✅ Decided
   - *Business:* registered users, Pi Login users, service requests, approved quotations, project completion rate, customer retention rate, revenue by service category, average project value.
   - *Operational:* average admin response time, quotation prep time, project delivery time, request processing success rate.
   - *Product:* active users, returning users, portfolio views, service page conversion rate, contact form conversion rate.
   - *Quality:* customer satisfaction score, project success rate, cancellation rate, support response quality.
   - *Technical:* uptime, page load time, API response time, error rate, security incident count.
   - To be monitored via the future Analytics module (Phase 2).

8. **Legal entity / jurisdiction** — ✅ Decided
   No registered legal company yet. Owner: Pasha Ahmadi. Brand: Hiweb. A legal entity will be established before commercial operation if required by future business, payment providers, or local regulations.

9. **ToS / Privacy Policy ownership** — ✅ Decided
   Owner: Pasha Ahmadi. Structure/technical requirements drafted with AI assistance during development. Reviewed and finalized by a qualified legal professional before public launch. Placeholder versions permitted during MVP dev/testing only; production requires finalized, owner-approved documents.

10. **Regulatory constraints** — 🟡 Needs Discussion
    Not yet resolved whether this is deferred to pre-launch legal review or needs early identification (e.g., Pi Network developer guidelines affecting architecture/KYC data handling now). Open question.

---

## 2. Users & Roles — 🟡 Needs Discussion
- Full role list beyond User/Admin (moderator? support staff? enterprise client sub-accounts?)
- Permission matrix per role
- Multi-role account support
- Account states (active, suspended, banned, pending, deleted)
- Onboarding flow per role
- Account deletion / data export flow
- Admin impersonation / support-access rules

## 3. Authentication & Identity — 🟡 Needs Discussion
- Pi Login confirmed as MVP auth method (✅ per Section 1); other methods (email/password fallback, social login) undecided
- MFA/2FA requirement
- Session management (token expiry, device limits)
- Account recovery flow
- Rate limiting on login attempts

## 4. Security — 🟡 Needs Discussion
- Encryption at rest/in transit standards
- OWASP Top 10 mitigation plan
- API authentication scheme
- Secrets management approach
- Input validation strategy
- Abuse prevention / bot protection
- Dependency vulnerability scanning
- Penetration testing schedule
- Audit logging of sensitive actions
- Incident response plan
- File upload security

## 5. Database & Data Architecture — 🟡 Needs Discussion
- Database type (relational vs NoSQL) — likely relational given structured request/quotation workflow, but not decided
- Full entity relationship model, including request status workflow (linked to Section 1 architecture note)
- Indexing strategy
- Data retention policy
- Soft vs hard delete
- Migration tooling
- Backup frequency/retention/restore testing

## 6. Backend / API — 🟡 Needs Discussion
- Architecture style (monolith vs modular vs microservices)
- API style (REST/GraphQL) and versioning
- Rate limiting per endpoint/role
- Standardized error format
- Idempotency for quotation/order operations
- Background job/queue needs
- Caching strategy
- Third-party integration fallback behavior
- API documentation requirement

## 7. Frontend & UI/UX — 🟡 Needs Discussion
- Platform targets: responsive web confirmed for MVP (✅); native mobile apps confirmed Phase 3 (✅ per Section 1)
- Design system/component library choice
- Wireframe → mockup → prototype pipeline
- Empty/loading/error states per screen
- Form validation UX
- Navigation/IA structure
- Dark mode support
- Offline behavior

## 8. Accessibility — 🟡 Needs Discussion
- WCAG conformance target
- Keyboard navigation
- Screen reader / ARIA support
- Color contrast compliance
- Text scaling support
- Accessibility testing in CI

## 9. Performance — 🟡 Needs Discussion
- Target load time / Core Web Vitals
- Asset optimization pipeline
- Lazy loading strategy
- Load testing plan
- Query performance budget
- CDN strategy

## 10. SEO — 🟡 Needs Discussion
- SSR/SSG needs (public marketing pages: Home, About, Services, Portfolio are public-facing per MVP scope)
- Meta tags / structured data strategy
- Sitemap / robots.txt
- URL structure across 5 languages
- Open Graph / social sharing

## 11. Internationalization / Multi-language — 🟡 Needs Discussion
Languages confirmed (✅ per Section 1): English (primary), Persian, Arabic, Turkish, French.
Open:
- i18n framework decision
- **RTL layout support required (Persian, Arabic) — real frontend architecture decision, not just translation files**
- Currency/date/number localization
- Translation management workflow
- Content that must stay language-agnostic (legal docs)

## 12. CMS / Content Management — 🟡 Needs Discussion
Admin-managed dynamic content confirmed as a value proposition (✅ per Section 1) and CMS is in MVP scope (✅ per Section 1). Open:
- Headless CMS vs custom-built admin tools
- Content versioning / draft-publish workflow
- Media library management
- Multi-language content workflow (linked to Section 11)

## 13. Admin Dashboard — 🟡 Needs Discussion
Confirmed MVP components (✅ per Section 1): Admin role, Admin Dashboard, Portfolio Management, Service Management, Admin Quotation Management.
Open:
- Full admin feature list beyond quotation management
- Role-based access within admin (single admin type or tiers?)
- User management tools
- Reporting/export tools
- System health visibility
- Feature flag/config management
- **Quotation status transition permissions (linked to Section 1 architecture note — deferred to Workflow Engine design)**

## 14. Logging & Monitoring — 🟡 Needs Discussion
- Application logging strategy
- Centralized log aggregation tool
- Error tracking tool
- Uptime monitoring & alerting
- APM tooling
- On-call/escalation process
(Note: Technical KPIs in Section 1, Item 7 — uptime, error rate, API response time — require this infrastructure to exist.)

## 15. Backup & Disaster Recovery — 🟡 Needs Discussion
- Backup schedule/location
- RPO/RTO targets
- DR runbook
- Restore-test cadence
- Failover strategy

## 16. Testing & QA — 🟡 Needs Discussion
- Unit/integration/E2E coverage targets
- Manual QA test plan
- Regression testing process
- Load/stress testing
- SAST/DAST tooling
- Cross-browser/device matrix
- Staging/production parity
- Bug triage process

## 17. Deployment & DevOps — 🟡 Needs Discussion
- CI/CD pipeline design
- Environment strategy (dev/staging/prod)
- Infrastructure as Code
- Containerization/orchestration needs
- Rollback strategy
- Blue-green/canary deployment
- Auto-scaling policy
- Cloud cost monitoring
- Domain/DNS/SSL management

## 18. Pi Network Integration — 🟡 Needs Discussion
Confirmed (✅ per Section 1): Pi Login at MVP; Pi Payments at Phase 2 (moved from Phase 3).
Open:
- Pi SDK integration scope details
- Sandbox vs mainnet testing plan
- Payment flow type(s): App-to-User / User-to-App / App-to-App
- KYC requirements tied to Pi Network compliance (linked to Section 10 — Regulatory constraints)
- Handling of failed/timeout/incomplete Pi transactions
- Wallet balance verification/reconciliation
- Compliance with Pi Network developer guidelines

## 19. Payments (beyond Pi) — 🟡 Needs Discussion
Confirmed (✅ per Section 1): No online payment at MVP; quotation/inquiry model with manual admin status management instead.
Open (relevant once Phase 2 arrives):
- Any non-Pi payment methods needed (e.g., for domain/hosting resale)
- PCI-DSS scope if card payments ever introduced
- Refund/dispute/chargeback handling
- Invoice/receipt generation
- Subscription billing logic (Phase 3 tie-in)
- Multi-currency support
- Transaction reconciliation & reporting

## 20. Notifications & Messaging — 🟡 Needs Discussion
Confirmed: Notifications and Messaging are Phase 2 (✅ per Section 1).
Open:
- Channels (email, push, SMS, in-app)
- Notification preference management
- Transactional vs marketing separation
- Real-time messaging architecture
- Delivery reliability/retry logic
- Template management (linked to Section 11 — multi-language templates)

## 21. Analytics — 🟡 Needs Discussion
Confirmed: Analytics module is Phase 2, will monitor KPIs defined in Section 1 Item 7 (✅).
Open:
- Specific analytics tool
- Event tracking plan
- Funnel/conversion tracking
- BI dashboards for admin
- Data warehouse needs
- Consent management for analytics (linked to Section 22 — privacy compliance)

## 22. Legal & Compliance — 🟡 Needs Discussion
Confirmed (✅ per Section 1): ToS/Privacy Policy drafted with AI assistance, legal review before launch, owner is Pasha Ahmadi, no registered entity yet.
Open:
- Cookie consent mechanism
- Age restriction policy
- Data processing agreements with third parties (e.g., Pi Network, hosting providers)
- IP ownership clarity
- Crypto/Pi-specific regulatory review (linked to Section 10)

## 23. Support & Operations — 🟡 Needs Discussion
- Support channel(s) — ticketing/chat/email
- SLA commitments
- Knowledge base / FAQ (FAQ page confirmed in MVP ✅, but content/ownership process undecided)
- Internal support documentation
- Escalation path

## 24. Future Scalability — 🟡 Needs Discussion
- Expected growth curve (Year 1 vs Year 3)
- Architecture bottleneck review at 10x/100x scale
- Feature flag system for rollouts
- Third-party developer API access (tie-in with Section 6 API versioning)
- Additional language/market runway beyond initial 5 languages
- Team scaling / codebase modularity

## 25. Documentation — 🟡 Needs Discussion
- Technical architecture documentation
- Developer-facing API docs
- New engineer onboarding docs
- Operational runbooks
- Decision log (this document serves as the seed of that log)

---

## Summary

| Status | Count |
|---|---|
| ✅ Decided | 9 items (all within Section 1) |
| 🟡 Needs Discussion | Section 1 Item 10, plus all of Sections 2–25 |
| ⏸ Deferred | 0 (nothing has been consciously deferred yet — items not yet reviewed are marked Needs Discussion, not Deferred, to avoid mistaking silence for a decision) |

**Next step:** Review 🟡 items in whatever order you choose. Recommend starting with items that block architecture decisions early — Section 5 (Database, since the request-status workflow depends on it), Section 3 (Authentication, since Pi Login is already MVP-committed), and Section 18 (Pi Network Integration details).
