import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";

interface Expense {
  tid: number;
  item: string;
  cost: number;
  date: string;
  category: string | null;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchExpenses();
  }, [page]);

  const fetchExpenses = async () => {
    try {
      const data = await api(`/me/expenses?page=${page}&limit=20`);
      setExpenses(data.data);
      setTotalPages(data.metadata.total_pages);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await api(`/expenses/${id}`, { method: "DELETE" });
      fetchExpenses();
      alert("Expense deleted successfully!");
    } catch (err) {
      alert("Failed to delete expense");
    }
  };

  return (
    <Layout title="Expenses">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">All Expenses</h2>
        <p className="text-gray-600">View and manage all your expenses</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-lg text-gray-500">No expenses recorded yet</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-gray-600 font-semibold">Date</th>
                    <th className="p-4 text-left text-gray-600 font-semibold">Item</th>
                    <th className="p-4 text-left text-gray-600 font-semibold">Category</th>
                    <th className="p-4 text-left text-gray-600 font-semibold">Amount</th>
                    <th className="p-4 text-left text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.tid} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium">{exp.item}</td>
                      <td className="p-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {exp.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-red-600">
                        ${exp.cost.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(exp.tid)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}