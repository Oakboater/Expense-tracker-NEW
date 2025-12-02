import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/client"; //

export default function Login() {
  const [ssn, setSsn] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(ssn, password);

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h1 className="text-2xl font-bold mb-4">Login to Expense Tracker</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">SSN (Username):</label>
          <input
            type="text"
            value={ssn}
            onChange={(e) => setSsn(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="Enter your SSN"
          />
        </div>
        <div>
          <label className="block mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">Don't have an account?</p>
        <button
          onClick={() => navigate("/register")}
          className="text-blue-500 hover:underline"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}