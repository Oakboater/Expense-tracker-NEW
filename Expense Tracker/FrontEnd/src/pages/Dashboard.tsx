import { useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/Layout";
import AddExpenseForm from "../components/AddExpenseForm";
import AddIncomeForm from "../components/AddIncomeForm";
import CategoriesManager from "../components/CategoriesManager";

interface Expense {
  id: number;
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout title="Dashboard">
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    </Layout>
  );

  return (
    <Layout title="Dashboard">
      <div className="dashboard-header">
        <h2>Financial Overview</h2>
        <p>Track your income, expenses, and net balance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">${summary?.total_income?.toFixed(2) || "0.00"}</div>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value">${summary?.total_expenses?.toFixed(2) || "0.00"}</div>
          </div>
        </div>

        <div className="stat-card net">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Net Balance</div>
            <div className={`stat-value ${(summary?.net || 0) >= 0 ? 'positive' : 'negative'}`}>
              ${summary?.net?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        <div className="stat-card period">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Time Period</div>
            <div className="stat-value">{summary?.days || 30} days</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
        >
          📋 Recent Expenses
        </button>
        <button
          onClick={() => setActiveTab('addExpense')}
          className={`tab-button ${activeTab === 'addExpense' ? 'active' : ''}`}
        >
          ➕ Add Expense
        </button>
        <button
          onClick={() => setActiveTab('addIncome')}
          className={`tab-button ${activeTab === 'addIncome' ? 'active' : ''}`}
        >
          💰 Add Income
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
        >
          🏷️ Manage Categories
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <div className="expenses-table">
            <h3>Recent Expenses</h3>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <p>No expenses recorded yet. Add your first expense!</p>
              </div>
            ) : (
              <table className="data-table">
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
                    <tr key={exp.id}>
                      <td>{exp.item}</td>
                      <td>
                        <span className="category-tag">{exp.category || "Uncategorized"}</span>
                      </td>
                      <td className="amount-cell">${exp.cost.toFixed(2)}</td>
                      <td>{new Date(exp.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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