import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";

interface Income {
  id: number;
  amount: number;
  source: string;
  date: string;
}

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const data = await api("/me/income");
      setIncome(data);
    } catch (err) {
      console.error("Failed to fetch income:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api("/income", {
        method: "POST",
        body: {
          amount: parseFloat(form.amount),
          source: form.source,
          date: form.date,
        },
      });

      setForm({
        amount: "",
        source: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      fetchIncome();
      alert("Income added successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to add income");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;

    try {
      await api(`/income/${id}`, { method: "DELETE" });
      fetchIncome();
      alert("Income deleted successfully!");
    } catch (err) {
      alert("Failed to delete income");
    }
  };

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Layout title="Income">
      <div className="page-header">
        <div className="header-content">
          <h2>Income Management</h2>
          <p>Track and manage your income sources</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-button"
        >
          {showForm ? "Cancel" : "➕ Add Income"}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add New Income</h3>
          <form onSubmit={handleSubmit} className="income-form">
            <div className="form-row">
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Source</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({...form, source: e.target.value})}
                required
                placeholder="Salary, Freelance, etc."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Add Income
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="stats-card">
        <div className="stat-item">
          <div className="stat-label">Total Income</div>
          <div className="stat-value">${totalIncome.toFixed(2)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Income Sources</div>
          <div className="stat-value">{income.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Average Income</div>
          <div className="stat-value">
            ${income.length > 0 ? (totalIncome / income.length).toFixed(2) : "0.00"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading income data...</p>
        </div>
      ) : income.length === 0 ? (
        <div className="empty-state">
          <p>No income recorded yet. Add your first income source!</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {income.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.source}</td>
                  <td className="amount-cell">${item.amount.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(item.id)}
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