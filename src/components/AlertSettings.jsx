import { useEffect, useMemo, useState } from "react";
import { notificationsApi, preferencesApi } from "../api";
import { NEWS_CATEGORIES } from "../categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  browserNotificationsSupported,
  requestBrowserPermission,
} from "../hooks/useBrowserAlerts";

const FREQUENCIES = [
  { value: "immediate", label: "Real-Time", help: "As soon as new stories are found (checked every minute)." },
  { value: "hourly", label: "Hourly", help: "At most one alert per hour." },
  { value: "daily", label: "Daily", help: "At most one alert per day." },
];

const sameList = (a, b) => a.length === b.length && a.every((item) => b.includes(item));

function Toggle({ id, checked, onChange, disabled, label, description }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 rounded-xl border p-3 transition ${
        checked ? "border-brand bg-brand-soft/60" : "border-gray-200 bg-white"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-brand/60"}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-brand"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs text-gray-600">{description}</span>
      </span>
    </label>
  );
}

export default function AlertSettings() {
  const { user, setPreferences } = useAuth();
  const toast = useToast();
  const saved = user.preferences;

  const [categories, setCategories] = useState(saved.categories);
  const [frequency, setFrequency] = useState(saved.frequency);
  const [channels, setChannels] = useState(saved.channels);
  const [busy, setBusy] = useState(""); // "", "save", "off", "test"

  // Whenever the saved preferences change (after saving, or on login), show them.
  useEffect(() => {
    setCategories(saved.categories);
    setFrequency(saved.frequency);
    setChannels(saved.channels);
  }, [saved]);

  const dirty = useMemo(
    () =>
      !sameList(categories, saved.categories) ||
      frequency !== saved.frequency ||
      channels.email !== saved.channels.email ||
      channels.browser !== saved.channels.browser,
    [categories, frequency, channels, saved],
  );

  const toggleCategory = (category) =>
    setCategories((list) =>
      list.includes(category) ? list.filter((c) => c !== category) : [...list, category],
    );

  const setBrowser = async (on) => {
    if (!on) {
      setChannels((c) => ({ ...c, browser: false }));
      return;
    }
    const permission = await requestBrowserPermission();
    if (permission === "granted") {
      setChannels((c) => ({ ...c, browser: true }));
    } else if (permission === "denied") {
      toast.error(
        "Your browser is blocking notifications for this site. Allow them in the site settings (the icon next to the address bar), then try again.",
      );
    } else if (permission === "unsupported") {
      toast.error("This browser does not support desktop notifications.");
    }
  };

  const save = async () => {
    if (!categories.length) {
      toast.error("Choose at least one topic.");
      return;
    }
    if (!channels.email && !channels.browser) {
      toast.error("Choose at least one way to receive alerts.");
      return;
    }
    setBusy("save");
    try {
      const result = await preferencesApi.save({ categories, frequency, channels });
      setPreferences(result.preferences);
      toast.success(
        saved.subscribed
          ? "Preferences saved."
          : "Alerts are on! Your first alert will arrive within a few minutes.",
      );
    } catch (err) {
      toast.error(`Your preferences were not saved: ${err.message}`);
    } finally {
      setBusy("");
    }
  };

  const turnOff = async () => {
    setBusy("off");
    try {
      const result = await preferencesApi.unsubscribe();
      setPreferences(result.preferences);
      toast.success("Alerts are off. Your topics are kept for when you turn them back on.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy("");
    }
  };

  const sendTest = async () => {
    setBusy("test");
    try {
      const result = await notificationsApi.sendTest();
      if (result.success === false) toast.error(result.message);
      else toast.success(result.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy("");
    }
  };

  const frequencyHelp = FREQUENCIES.find((f) => f.value === frequency)?.help;
  const supported = browserNotificationsSupported();

  return (
    <section
      aria-labelledby="alert-settings-title"
      className="flex min-w-0 flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <div>
        <h2 id="alert-settings-title" className="text-lg font-bold text-slate-900">
          Manage Your News Alerts
        </h2>
        <p
          className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            saved.subscribed ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${saved.subscribed ? "bg-emerald-500" : "bg-gray-400"}`}
            aria-hidden="true"
          />
          {saved.subscribed ? "Alerts are on" : "Alerts are off"}
        </p>
        {!saved.subscribed && (
          <p className="mt-2 text-sm text-gray-600">
            Pick your topics and press <strong>Save preferences</strong> to start receiving alerts.
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-semibold text-gray-700">Topics</legend>
        <div className="flex flex-wrap gap-2">
          {NEWS_CATEGORIES.map((category) => {
            const selected = categories.includes(category);
            return (
              <button
                type="button"
                key={category}
                onClick={() => toggleCategory(category)}
                aria-pressed={selected}
                className={`flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium capitalize transition ${
                  selected
                    ? "border-brand bg-brand-soft text-brand-ink"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span aria-hidden="true">{selected ? "✓" : "+"}</span>
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-semibold text-gray-700">How often</legend>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {FREQUENCIES.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setFrequency(option.value)}
              aria-pressed={frequency === option.value}
              className={`min-h-10 rounded-[9px] px-2 text-sm font-semibold transition ${
                frequency === option.value
                  ? "bg-white text-brand-ink shadow-sm ring-1 ring-brand"
                  : "text-gray-700 hover:bg-white/70"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600">{frequencyHelp}</p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-semibold text-gray-700">Send alerts by</legend>
        <Toggle
          id="channel-email"
          checked={channels.email}
          onChange={(on) => setChannels((c) => ({ ...c, email: on }))}
          label="Email"
          description={`Sent to ${user.email}`}
        />
        <Toggle
          id="channel-browser"
          checked={channels.browser}
          onChange={setBrowser}
          disabled={!supported}
          label="Browser notifications"
          description={
            supported
              ? "Desktop pop-ups while this site is open in a tab."
              : "Not supported in this browser."
          }
        />
      </fieldset>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={save}
          disabled={Boolean(busy) || (!dirty && saved.subscribed)}
          className="min-h-13 w-full rounded-xl bg-brand px-5 text-base font-semibold text-white transition enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "save"
            ? "Saving..."
            : saved.subscribed && !dirty
              ? "Preferences saved"
              : "Save preferences"}
        </button>
        {dirty && saved.subscribed && (
          <p className="-mt-1 text-center text-xs font-medium text-amber-700">You have unsaved changes.</p>
        )}

        {saved.subscribed && (
          <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={sendTest}
              disabled={Boolean(busy) || dirty}
              title={dirty ? "Save your changes first" : undefined}
              className="min-h-11 w-full rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "test" ? "Sending..." : "Send me a test alert now"}
            </button>
            <button
              type="button"
              onClick={turnOff}
              disabled={Boolean(busy)}
              className="min-h-11 w-full text-center text-sm font-semibold text-red-700 underline transition hover:text-red-800 disabled:opacity-50"
            >
              {busy === "off" ? "Turning off..." : "Turn off alerts"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
