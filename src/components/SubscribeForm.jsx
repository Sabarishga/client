export default function SubscribeForm({
  email,
  setEmail,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="email"
        className="text-[13px] font-semibold text-gray-700"
      >
        Email Address
      </label>
      <div className="relative">
        <input
          type="email"
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-h-[44px] w-full rounded-[10px] border border-gray-300 bg-white px-3.5 text-[15px] text-slate-900 transition placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>
    </div>
  );
}
