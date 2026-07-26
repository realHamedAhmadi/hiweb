"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, NodeMark } from "@hiweb/ui";
import { useAuth } from "@/context/AuthContext";
import { createServiceRequest } from "@/lib/serviceRequestApi";

/**
 * Contact page — now wired to actually create a ServiceRequest via
 * apps/api, gated behind login (creating a request requires an
 * authenticated user, per backend-architecture.md's permissions
 * table).
 *
 * HONEST STATUS: since Pi Login's backend verification is still
 * stubbed (apps/api/src/lib/piNetwork.ts), nobody can actually reach
 * "authenticated" status in a real deployment yet — so in practice
 * this form currently always shows the "please log in" state. The
 * submission code path itself is real and ready.
 *
 * Simplification flagged, not hidden: "Service Interest" is not yet
 * mapped to a real ServiceCategory.id (that would require fetching the
 * live category list client-side, which this pass didn't add) — the
 * selected label is folded into the free-text projectDetails instead.
 * Replacing this with a real serviceCategoryId once the dropdown is
 * populated from live data is a natural follow-up, not done here.
 *
 * Field choices otherwise unchanged: name/email captured but not
 * currently sent anywhere (apps/api's ServiceRequest doesn't have
 * fields for them — see database-design.md 1.3; only User.userId,
 * resolved from the access token, and projectDetails are used).
 */
export default function ContactPage() {
  const { status, accessToken, login } = useAuth();
  const [serviceInterest, setServiceInterest] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (status !== "authenticated" || !accessToken) {
      setSubmitError("Please log in with Pi first — use the button in the header.");
      return;
    }

    const projectDetails = serviceInterest
      ? `Service interest: ${serviceInterest}\n\n${message}`
      : message;

    setSubmitting(true);
    try {
      await createServiceRequest(accessToken, { projectDetails });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-start">
      <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
      <h1 className="max-w-2xl font-display text-3xl font-bold text-ink-900">
        Contact
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-700">
        Tell us about your project and our team will follow up with next
        steps — no payment required to get started.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {submitted ? (
            <p className="text-signal-emerald">
              Your request was submitted. You can track its status once the
              User Dashboard (Phase 2) is available.
            </p>
          ) : (
            <>
              {status !== "authenticated" && (
                <div className="mb-5 rounded-md border border-gold-300 bg-gold-50 p-3 text-sm text-ink-900">
                  Please log in with Pi (top of the page) before submitting a
                  request.
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="serviceInterest" className="text-sm font-medium text-ink-900">
                    Service Interest
                  </label>
                  <select
                    id="serviceInterest"
                    value={serviceInterest}
                    onChange={(e) => setServiceInterest(e.target.value)}
                    className="rounded-md border border-slate-200 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="">Select a service (optional)</option>
                    <option value="Custom Software & Digital Solutions">Custom Software & Digital Solutions</option>
                    <option value="Domain & Hosting Services">Domain & Hosting Services</option>
                    <option value="Maintenance & Support Plans">Maintenance & Support Plans</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-ink-900">
                    Project Details
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your project."
                    className="rounded-md border border-slate-200 bg-paper-50 px-3 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>

                {submitError && <p className="text-sm text-signal-rust">{submitError}</p>}

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="self-start"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send Request"}
                </Button>

                {status !== "authenticated" && (
                  <Button type="button" variant="outline" size="sm" onClick={login} className="self-start">
                    Login with Pi to continue
                  </Button>
                )}
              </form>
            </>
          )}
        </Card>

        {/* Contact info panel — clearly labeled placeholders only */}
        <Card>
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Contact Details
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-700">
            <li>Email address placeholder</li>
            <li>Phone number placeholder (if applicable)</li>
            <li>Business hours placeholder</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
