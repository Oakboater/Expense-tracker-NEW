import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api, authApi } from "../api/client";

interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  gender: string;
  age: number;
  profile_emoji: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    gender: "",
    age: "",
    profile_emoji: "👤",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emojiOptions = ["👤", "🍌", "🍎", "💻", "🐱", "🐶", "🌟", "🎮", "🏀", "🎨", "🚀", "🎸", "🍕", "☕"];

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await authApi.getCurrentUser();
      setUser(data);
      setForm({
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        gender: data.gender,
        age: data.age.toString(),
        profile_emoji: data.profile_emoji,
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const ageNum = parseInt(form.age);
    if (ageNum < 1 || ageNum > 100) {
      setError("Age must be between 1 and 100");
      return;
    }

    const updateData: any = {
      username: form.username,
      firstname: form.firstname,
      lastname: form.lastname,
      gender: form.gender,
      age: ageNum,
      profile_emoji: form.profile_emoji,
    };

    if (form.password) {
      updateData.password = form.password;
    }

    try {
      await api("/profile", {
        method: "PATCH",
        body: updateData,
      });

      setSuccess("Profile updated successfully!");
      setEditing(false);
      fetchUser();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      await api("/account", { method: "DELETE" });
      authApi.logout();
      window.location.href = "/login";
    } catch (err) {
      alert("Failed to delete account");
    }
  };

  if (loading) {
    return (
      <Layout title="Profile">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Profile">
        <div className="error-state">
          <p>Failed to load user profile</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="profile-container">
        <div className="profile-header">
          <h2>Your Profile</h2>
          <p>Manage your account settings and preferences</p>
        </div>

        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar-large">
              {user.profile_emoji}
            </div>
            <div className="profile-details">
              <h3>{user.firstname} {user.lastname}</h3>
              <p className="username">@{user.username}</p>
              <div className="profile-stats">
                <div className="stat">
                  <div className="stat-label">Member Since</div>
                  <div className="stat-value">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-label">Gender</div>
                  <div className="stat-value">{user.gender}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Age</div>
                  <div className="stat-value">{user.age}</div>
                </div>
              </div>
            </div>
          </div>

          {!editing ? (
            <div className="profile-actions">
              <button
                onClick={() => setEditing(true)}
                className="edit-button"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={form.firstname}
                      onChange={(e) => setForm({...form, firstname: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={form.lastname}
                      onChange={(e) => setForm({...form, lastname: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({...form, username: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({...form, age: e.target.value})}
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <input
                    type="text"
                    value={form.gender}
                    onChange={(e) => setForm({...form, gender: e.target.value})}
                    required
                    placeholder="How do you identify?"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Profile Emoji</h4>
                <div className="emoji-selector-large">
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

              <div className="form-section">
                <h4>Change Password (Optional)</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                      placeholder="Leave blank to keep current"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setSuccess("");
                    fetchUser();
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p>Permanently delete your account and all associated data</p>
          <button
            onClick={handleDeleteAccount}
            className="delete-account-button"
          >
            Delete Account
          </button>
        </div>
      </div>
    </Layout>
  );
}