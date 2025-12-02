import { useState } from "react";
import { api } from "../api/client";

export default function AddIncomeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    amount: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/income", {
        method: "POST",
        body: {
          amount: parseFloat(form.amount),
          source: form.source,
          date: form.date ? new Date(form.date).toISOString() : undefined,
        },
      });

      setForm({
        amount: "",
        source: "",
        date: new Date().toISOString().split("T")[0],
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>💰</span> Add Income
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="5000.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source *
          </label>
          <input
            type="text"
            name="source"
            value={form.source}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Salary, Freelance, Investment"
          />
          <p className="mt-2 text-sm text-gray-500">
            Where is this income from?
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg shadow transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Adding...
              </span>
            ) : (
              "Add Income"
            )}
          </button>

          <button
            type="button"
            onClick={() => onSuccess && onSuccess()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}