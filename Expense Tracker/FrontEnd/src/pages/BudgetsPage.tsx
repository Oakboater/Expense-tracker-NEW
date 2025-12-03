import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";

interface Budget {
  id: number;
  category: string;
  limit: number;
  period: string;
  start_date: string | null;
  end_date: string | null;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "",
    limit: "",
    period: "monthly",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const data = await api("/me/budgets");
      setBudgets(data);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api("/budgets", {
        method: "POST",
        body: {
          category: form.category,
          limit: parseFloat(form.limit),
          period: form.period,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
        },
      });

      setForm({
        category: "",
        limit: "",
        period: "monthly",
        start_date: "",
        end_date: "",
      });
      setShowForm(false);
      fetchBudgets();
      alert("Budget created successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create budget");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

    try {
      await api(`/budgets/${id}`, { method: "DELETE" });
      fetchBudgets();
      alert("Budget deleted successfully!");
    } catch (err) {
      alert("Failed to delete budget");
    }
  };

  return (
    <Layout title="Budgets">
      <div className="page-header">
        <div className="header-content">
          <h2>Budget Management</h2>
          <p>Set and track spending limits by category</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-button"
        >
          {showForm ? "Cancel" : "🎯 Set Budget"}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Create New Budget</h3>
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  required
                  placeholder="Food, Transportation, etc."
                />
              </div>

              <div className="form-group">
                <label>Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.limit}
                  onChange={(e) => setForm({...form, limit: e.target.value})}
                  required
                  placeholder="500.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Period</label>
                <select
                  value={form.period}
                  onChange={(e) => setForm({...form, period: e.target.value})}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date (Optional)</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({...form, start_date: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({...form, end_date: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Create Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <p>No budgets set yet. Create your first budget to start tracking!</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Limit</th>
                <th>Period</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td>
                    <span className="category-tag">{budget.category}</span>
                  </td>
                  <td className="amount-cell">${budget.limit.toFixed(2)}</td>
                  <td>{budget.period}</td>
                  <td>
                    {budget.start_date
                      ? new Date(budget.start_date).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td>
                    {budget.end_date
                      ? new Date(budget.end_date).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}