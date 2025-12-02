import { useState } from "react";
import { api } from "../api/client";
import "../App.css";

export default function AddExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    item: "",
    cost: "",
    category: "",
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
      await api("/expenses", {
        method: "POST",
        body: {
          item: form.item,
          cost: parseFloat(form.cost),
          category: form.category,
          date: form.date ? new Date(form.date).toISOString() : undefined,
        },
      });

      setForm({
        item: "",
        cost: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="card-header">
        <span style={{ marginRight: '8px' }}>➕</span> Add New Expense
      </h2>

      <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label className="form-label">Item Name *</label>
          <input
            type="text"
            name="item"
            value={form.item}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Groceries, Movie Tickets"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amount ($) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="cost"
            value={form.cost}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="25.99"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Food, Transportation"
          />
          <p className="text-gray-600" style={{ marginTop: '4px', fontSize: '0.875rem' }}>
            Create a new category or use existing one
          </p>
        </div>

        {error && (
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          </div>
        )}

        <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-danger"
            style={{ flex: 1 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                Adding...
              </span>
            ) : (
              "Add Expense"
            )}
          </button>

          <button
            type="button"
            onClick={() => onSuccess && onSuccess()}
            className="btn btn-outline"
            style={{ width: '100px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}