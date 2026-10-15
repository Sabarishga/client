export default function SubscribeForm({
  email,
  setEmail,
}) {
  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Manage Your News Alerts
      </h2>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
