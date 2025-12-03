import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    gender: "",
    age: "",
    password: "",
    confirmPassword: "",
    profile_emoji: "👤",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emojiOptions = ["👤", "🍌", "🍎", "💻", "🐱", "🐶", "🌟", "🎮", "🏀", "🎨"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.username || !form.firstname || !form.lastname || !form.gender || !form.age) {
      setError("Please fill in all required fields");
      return;
    }

    const ageNum = parseInt(form.age);
    if (ageNum < 1 || ageNum > 100) {
      setError("Age must be between 1 and 100");
      return;
    }

    setLoading(true);

    try {
      await api("/register", {
        method: "POST",
        body: {
          username: form.username,
          firstname: form.firstname,
          lastname: form.lastname,
          gender: form.gender,
          age: ageNum,
          password: form.password,
          profile_emoji: form.profile_emoji,
        },
      });

      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join Expense Tracker to manage your finances</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />
            </div>

            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="1"
                max="100"
                required
                placeholder="Your age"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                required
                placeholder="Your first name"
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                required
                placeholder="Your last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <input
              type="text"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              placeholder="e.g., Male, Female, Non-binary"
            />
          </div>

          <div className="form-group">
            <label>Profile Emoji</label>
            <div className="emoji-selector">
              {emojiOptions.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`emoji-option ${form.profile_emoji === emoji ? 'selected' : ''}`}
                  onClick={() => setForm({...form, profile_emoji: emoji})}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="register-footer">
          <button
            onClick={() => navigate("/login")}
            className="login-link"
          >
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
}