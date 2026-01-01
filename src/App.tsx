import { useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

/* ================= CONFIG ================= */

const API_BASE =
  "https://todo-api-sathya-aqdke9fycteqegdh.centralindia-01.azurewebsites.net";

/* ================= AXIOS ================= */

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(`${API_BASE}/api/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("accessToken", res.data.accessToken);
        err.config.headers.Authorization =
          `Bearer ${res.data.accessToken}`;
        return axios(err.config);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

/* ================= AUTH ================= */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to your account">
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") submit();
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "15px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") submit();
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              paddingRight: "48px",
              fontSize: "15px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.2s",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>
      <button
        onClick={submit}
        disabled={loading || !email || !password}
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "15px",
          fontWeight: "600",
          color: "white",
          backgroundColor: loading || !email || !password ? "#d1d5db" : "#3b82f6",
          border: "none",
          borderRadius: "8px",
          cursor: loading || !email || !password ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          if (!loading && email && password) {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && email && password) {
            e.currentTarget.style.backgroundColor = "#3b82f6";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <span style={{ color: "#6b7280", fontSize: "14px" }}>
          Don't have an account?{" "}
        </span>
        <Link
          to="/register"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "14px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#2563eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#3b82f6";
          }}
        >
          Register
        </Link>
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </AuthLayout>
  );
}

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/register", { email, password });
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to get started">
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "15px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              paddingRight: "48px",
              fontSize: "15px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.2s",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {password && (
          <div style={{ marginTop: "8px" }}>
            <div
              style={{
                height: "4px",
                backgroundColor: "#e5e7eb",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor:
                    password.length < 6
                      ? "#ef4444"
                      : password.length < 10
                      ? "#f59e0b"
                      : "#10b981",
                  width: `${Math.min((password.length / 12) * 100, 100)}%`,
                  transition: "all 0.3s",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "4px",
                marginBottom: 0,
              }}
            >
              {password.length < 6
                ? "Weak password"
                : password.length < 10
                ? "Medium password"
                : "Strong password"}
            </p>
          </div>
        )}
      </div>
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Confirm Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") submit();
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "15px",
            border: `1px solid ${
              confirmPassword && password !== confirmPassword
                ? "#fca5a5"
                : "#e5e7eb"
            }`,
            borderRadius: "8px",
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor =
              confirmPassword && password !== confirmPassword
                ? "#fca5a5"
                : "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
        {confirmPassword && password !== confirmPassword && (
          <p
            style={{
              fontSize: "12px",
              color: "#dc2626",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            Passwords don't match
          </p>
        )}
      </div>
      <button
        onClick={submit}
        disabled={loading || !email || !password || !confirmPassword}
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "15px",
          fontWeight: "600",
          color: "white",
          backgroundColor:
            loading || !email || !password || !confirmPassword
              ? "#d1d5db"
              : "#3b82f6",
          border: "none",
          borderRadius: "8px",
          cursor:
            loading || !email || !password || !confirmPassword
              ? "not-allowed"
              : "pointer",
          transition: "all 0.2s",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          if (!loading && email && password && confirmPassword) {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && email && password && confirmPassword) {
            e.currentTarget.style.backgroundColor = "#3b82f6";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <span style={{ color: "#6b7280", fontSize: "14px" }}>
          Already have an account?{" "}
        </span>
        <Link
          to="/login"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "14px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#2563eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#3b82f6";
          }}
        >
          Login
        </Link>
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </AuthLayout>
  );
}

/* ================= TODOS ================= */

type Todo = {
  id: number;
  title: string;
  isCompleted: boolean;
};

function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadTodos = async () => {
    const res = await api.get("/api/todos");
    setTodos(res.data);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async () => {
    if (!title.trim()) return;
    await api.post("/api/todos", { title });
    setTitle("");
    loadTodos();
  };

  const toggle = async (t: Todo) => {
    await api.put(`/api/todos/${t.id}`, {
      ...t,
      isCompleted: !t.isCompleted,
    });
    loadTodos();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/todos/${id}`);
    loadTodos();
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (todo: Todo) => {
    if (!editTitle.trim()) return;
    await api.put(`/api/todos/${todo.id}`, {
      ...todo,
      title: editTitle,
    });
    setEditingId(null);
    setEditTitle("");
    loadTodos();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.isCompleted);
    await Promise.all(completedTodos.map((t) => api.delete(`/api/todos/${t.id}`)));
    loadTodos();
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.isCompleted;
    if (filter === "completed") return t.isCompleted;
    return true;
  });

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const activeCount = todos.length - completedCount;
  const totalCount = todos.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "white",
                margin: "0 0 8px 0",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              ✓ My Tasks
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.9)",
                margin: 0,
              }}
            >
              {activeCount} active · {completedCount} completed
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#3b82f6",
                marginBottom: "4px",
              }}
            >
              {totalCount}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>Total</div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#f59e0b",
                marginBottom: "4px",
              }}
            >
              {activeCount}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>Active</div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#10b981",
                marginBottom: "4px",
              }}
            >
              {completedCount}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>Done</div>
          </div>
        </div>

        {/* Add Todo Card */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && title.trim()) addTodo();
              }}
              style={{
                flex: 1,
                padding: "14px 18px",
                fontSize: "15px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                outline: "none",
                transition: "all 0.2s",
                backgroundColor: "white",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={addTodo}
              disabled={!title.trim()}
              style={{
                padding: "14px 28px",
                fontSize: "15px",
                fontWeight: "600",
                color: "white",
                background: title.trim()
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#d1d5db",
                border: "none",
                borderRadius: "10px",
                cursor: title.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (title.trim()) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (title.trim()) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "12px",
            padding: "8px",
            marginBottom: "16px",
            display: "flex",
            gap: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: "600",
                color: filter === f ? "white" : "#6b7280",
                background:
                  filter === f
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
              onMouseEnter={(e) => {
                if (filter !== f) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== f) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todos List */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
            marginBottom: "16px",
          }}
        >
          {filteredTodos.length === 0 ? (
            <div
              style={{
                padding: "64px 20px",
                textAlign: "center",
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                {filter === "all"
                  ? "📝"
                  : filter === "active"
                  ? "🎯"
                  : "🎉"}
              </div>
              <p style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 8px 0" }}>
                {filter === "all"
                  ? "No tasks yet"
                  : filter === "active"
                  ? "No active tasks"
                  : "No completed tasks"}
              </p>
              <p style={{ fontSize: "14px", margin: 0 }}>
                {filter === "all"
                  ? "Add a task to get started!"
                  : filter === "active"
                  ? "All tasks are complete!"
                  : "Complete some tasks to see them here"}
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {filteredTodos.map((t, index) => (
                <li
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "18px 20px",
                    borderBottom:
                      index < filteredTodos.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                    transition: "background-color 0.2s",
                    gap: "12px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={t.isCompleted}
                    onChange={() => toggle(t)}
                    style={{
                      width: "22px",
                      height: "22px",
                      cursor: "pointer",
                      accentColor: "#667eea",
                      flexShrink: 0,
                    }}
                  />
                  {editingId === t.id ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") saveEdit(t);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          fontSize: "15px",
                          border: "2px solid #3b82f6",
                          borderRadius: "6px",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => saveEdit(t)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "white",
                          backgroundColor: "#10b981",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#6b7280",
                          backgroundColor: "#f3f4f6",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        onClick={() => !t.isCompleted && startEdit(t)}
                        style={{
                          flex: 1,
                          fontSize: "15px",
                          color: t.isCompleted ? "#9ca3af" : "#111827",
                          textDecoration: t.isCompleted
                            ? "line-through"
                            : "none",
                          transition: "all 0.2s",
                          cursor: t.isCompleted ? "default" : "pointer",
                        }}
                      >
                        {t.title}
                      </span>
                      <button
                        onClick={() => remove(t.id)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#ef4444",
                          backgroundColor: "transparent",
                          border: "1px solid transparent",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#fef2f2";
                          e.currentTarget.style.borderColor = "#fecaca";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Actions */}
        {completedCount > 0 && (
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {completedCount} completed task{completedCount !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearCompleted}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#ef4444",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fee2e2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
              }}
            >
              Clear Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Protected({ children }: { children: JSX.Element }) {
  return localStorage.getItem("accessToken") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: any;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "48px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 8px 0",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}