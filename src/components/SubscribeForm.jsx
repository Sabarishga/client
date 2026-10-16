export default function SubscribeForm({
  email,
  setEmail,
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="email"
        className="text-xs font-semibold uppercase tracking-wide text-slate-700"
      >
        Email Address
      </label>
      <div className="relative max-w-xl">
        <input
          type="email"
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
