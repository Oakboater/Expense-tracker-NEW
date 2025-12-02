import { useState, useEffect } from "react";
import { api } from "../api/client";

interface Category {
  id: number;
  name: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api("/me/categories");
      setCategories(data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Create a dummy expense to trigger category creation
      await api("/expenses", {
        method: "POST",
        body: {
          item: "Category Setup",
          cost: 0,
          category: newCategory.trim(),
        },
      });

      setNewCategory("");
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>🏷️</span> Manage Categories
      </h2>

      <div className="max-w-lg">
        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="mb-8">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow transition disabled:bg-gray-400"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </form>

        {/* Categories List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-700">Your Categories</h3>
          </div>

          <div className="p-6">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No categories yet</p>
                <p>Add your first category using the form above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">🏷️</span>
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ID: {cat.id}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {categories.length > 0 && (
              <div className="mt-6 pt-6 border-t text-center text-gray-500 text-sm">
                {categories.length} categories total
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}