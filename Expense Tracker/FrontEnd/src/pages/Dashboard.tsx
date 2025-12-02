import { useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/Layout";
import AddExpenseForm from "../components/AddExpenseForm";
import AddIncomeForm from "../components/AddIncomeForm";
import CategoriesManager from "../components/CategoriesManager";
import "../App.css";

interface Expense {
  tid: number;
  item: string;
  cost: number;
  date: string;
  category: string | null;
}

interface Summary {
  total_income: number;
  total_expenses: number;
  net: number;
  days: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'addExpense' | 'addIncome' | 'categories'>('summary');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const s = await api("/me/summary");
      setSummary(s);

      const e = await api("/me/expenses?page=1&limit=10");
      setExpenses(e.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="card text-center"><div className="spinner"></div><p>Loading...</p></div></Layout>;

  return (
    <Layout title="Dashboard">
      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="text-lg">💰</div>
          <h3 className="font-semibold text-gray-600">Total Income</h3>
          <div className="stat-value text-green-600">
            ${summary?.total_income?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="stat-card expense">
          <div className="text-lg">💸</div>
          <h3 className="font-semibold text-gray-600">Total Expenses</h3>
          <div className="stat-value text-red-600">
            ${summary?.total_expenses?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="stat-card net">
          <div className="text-lg">📈</div>
          <h3 className="font-semibold text-gray-600">Net Balance</h3>
          <div className={`stat-value ${(summary?.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summary?.net?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="stat-card period">
          <div className="text-lg">📅</div>
          <h3 className="font-semibold text-gray-600">Time Period</h3>
          <div className="stat-value">
            {summary?.days || 30} days
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setActiveTab('addExpense')}
          className="btn btn-danger"
        >
          <span>➕</span> Add Expense
        </button>

        <button
          onClick={() => setActiveTab('addIncome')}
          className="btn btn-success"
        >
          <span>💰</span> Add Income
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className="btn btn-primary"
        >
          <span>🏷️</span> Manage Categories
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className="btn btn-secondary"
        >
          <span>📊</span> View Summary
        </button>
      </div>

      {/* Content Area */}
      <div className="card">
        {activeTab === 'summary' && (
          <div>
            <h2 className="card-header">
              <span style={{ marginRight: '8px' }}>📋</span> Recent Expenses
            </h2>

            {expenses.length === 0 ? (
              <div className="text-center p-6 text-gray-600">
                <p className="text-lg mb-2">No expenses recorded yet</p>
                <p>Add your first expense using the "Add Expense" button above!</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Cost</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.tid}>
                        <td>{exp.item}</td>
                        <td>
                          <span className="tag">
                            {exp.category || "Uncategorized"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>${exp.cost.toFixed(2)}</td>
                        <td style={{ color: '#6b7280' }}>
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addExpense' && (
          <AddExpenseForm onSuccess={() => {
            fetchData();
            setActiveTab('summary');
          }} />
        )}

        {activeTab === 'addIncome' && (
          <AddIncomeForm onSuccess={() => {
            fetchData();
            setActiveTab('summary');
          }} />
        )}

        {activeTab === 'categories' && <CategoriesManager />}
      </div>
    </Layout>
  );
}