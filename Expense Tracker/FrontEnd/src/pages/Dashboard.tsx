import { useEffect, useState } from "react";
import { api } from "../api/client";

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

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-100 rounded shadow">
            <h2 className="font-semibold">Total Income</h2>
            <p className="text-xl">${summary.total_income.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-red-100 rounded shadow">
            <h2 className="font-semibold">Total Expenses</h2>
            <p className="text-xl">${summary.total_expenses.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-blue-100 rounded shadow">
            <h2 className="font-semibold">Net</h2>
            <p className="text-xl">${summary.net.toFixed(2)}</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Item</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Cost</th>
            <th className="border p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.tid}>
              <td className="border p-2">{exp.item}</td>
              <td className="border p-2">{exp.category || "-"}</td>
              <td className="border p-2">${exp.cost.toFixed(2)}</td>
              <td className="border p-2">{new Date(exp.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
