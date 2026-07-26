"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card, CardHeader, CardBody, Button } from "@hiweb/ui";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/adminApi";

interface SettingRow {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
}

const inputClass =
  "rounded-md border border-slate-200 bg-paper-50 px-3 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500";

/**
 * SettingEntry.value has no fixed shape per database-design.md 1.8's
 * own "not decided" note — this form accepts a raw JSON string and
 * parses it, rather than assuming any particular structure.
 */
export default function AdminSettingsPage() {
  const { accessToken } = useAuth();
  const [settings, setSettings] = useState<SettingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ key: "", valueJson: "" });
  const [saving, setSaving] = useState(false);

  function load() {
    if (!accessToken) return;
    adminApi
      .listSettings(accessToken)
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }

  useEffect(load, [accessToken]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(form.valueJson);
    } catch {
      setError("Value must be valid JSON — e.g. \"a string\", 42, true, or {\"nested\":\"object\"}");
      return;
    }

    setSaving(true);
    try {
      await adminApi.updateSetting(accessToken, form.key, parsedValue);
      setForm({ key: "", valueJson: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>Add / Update Setting</CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="mt-2 flex flex-col gap-3">
            <input
              className={inputClass}
              placeholder="Key — e.g. footer.contact_email"
              required
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
            />
            <textarea
              className={inputClass}
              placeholder='Value as JSON — e.g. "hello@hiweb.example" or true'
              required
              rows={3}
              value={form.valueJson}
              onChange={(e) => setForm({ ...form, valueJson: e.target.value })}
            />
            <Button type="submit" variant="accent" size="sm" disabled={saving} className="self-start">
              {saving ? "Saving…" : "Save Setting"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {error && <p className="text-sm text-signal-rust">{error}</p>}

      {!settings ? (
        <p className="text-sm text-ink-700">Loading…</p>
      ) : settings.length === 0 ? (
        <p className="text-sm text-ink-700">No settings configured yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {settings.map((setting) => (
            <Card key={setting.id}>
              <p className="font-medium text-ink-900">{setting.key}</p>
              <pre className="mt-2 overflow-x-auto rounded-md bg-paper-100 p-3 text-xs text-ink-700">
                {JSON.stringify(setting.value, null, 2)}
              </pre>
              <p className="mt-2 text-xs text-slate-400">
                Updated {new Date(setting.updatedAt).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
