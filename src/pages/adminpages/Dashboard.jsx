const BASE_URL = import.meta.env.VITE_API_URL;
import React, { useEffect, useState } from "react";
import {
  Home,
  FileText,
  Settings,
  User,
  LogOutIcon,
  Menu,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Records from "./Records";
import Management from "./Management";
import "./css/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [scanStats, setScanStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    nspStats: { Normal: 0, Suspect: 0, Pathologic: 0 },
  });
  const [analysisData, setAnalysisData] = useState({
    predictions: [],
    nspStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const COLORS = ["#4d79ff", "#ffcc00", "#ff4d4d"]; // Normal, Suspect, Pathologic

  // Fetch analysis (from FastAPI)
  useEffect(() => {
    fetch(`${BASE_URL}/api/analysis`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setAnalysisData(data);
        setScanStats((prev) => ({
          ...prev,
          nspStats: {
            Normal: data.nspStats?.Normal || 0,
            Suspect: data.nspStats?.Suspect || 0,
            Pathologic: data.nspStats?.Pathologic || 0,
          },
        }));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fetch scan stats (from Node backend)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/scans/stats`);
        setScanStats((prev) => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const pieData = [
    { name: "Normal", value: scanStats.nspStats.Normal || 0 },
    { name: "Suspect", value: scanStats.nspStats.Suspect || 0 },
    { name: "Pathologic", value: scanStats.nspStats.Pathologic || 0 },
  ];

  const handleLogout = () => setShowLogoutDialog(true);
  const confirmLogout = () => {
    setShowLogoutDialog(false);
    navigate("/login");
  };
  const cancelLogout = () => setShowLogoutDialog(false);
  const openAdminDialog = () => setShowAdminDialog(true);
  const closeAdminDialog = () => setShowAdminDialog(false);
  const handleChangePassword = () => {
    setShowAdminDialog(false);
    navigate("/change-password");
  };
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (loading) return <p>Loading analysis...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="dashboard-container">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div
          className="logo-section"
          onClick={() => {
            setActiveNav("Dashboard");
            setSidebarOpen(false);
          }}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.png" alt="Logo" className="logo-img" />
          <span className="logo-text">
            Druk <span className="logo-e">e</span>Health
          </span>
        </div>

        <nav className="nav-menu">
          {["Dashboard", "Records", "Management"].map((item) => (
            <div
              key={item}
              className={`nav-item ${activeNav === item ? "active" : ""}`}
              onClick={() => {
                setActiveNav(item);
                setSidebarOpen(false);
              }}
            >
              {item === "Dashboard" && <Home size={25} />}
              {item === "Records" && <FileText size={25} />}
              {item === "Management" && <Settings size={25} />}
              <span>{item}</span>
            </div>
          ))}
        </nav>

        <div className="nav-item" onClick={handleLogout} id="Logout">
          <LogOutIcon size={25} /> <span>Log Out</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <div className="admin-profile" onClick={openAdminDialog}>
            <span>Admin</span>
            <User size={20} />
          </div>
        </header>

        <div className="page-content fade-in" key={activeNav}>
          {activeNav === "Dashboard" && (
            <>
              <h2 className="section-title">Fetal Health Data Analysis</h2>

              <section className="stats-section">
                <div className="stats-grid">
                  <div className="stat-card">
                    <h4>Today’s Scans</h4>
                    <p>{scanStats.daily}</p>
                  </div>
                  <div className="stat-card">
                    <h4>This Week</h4>
                    <p>{scanStats.weekly}</p>
                  </div>
                  <div className="stat-card">
                    <h4>This Month</h4>
                    <p>{scanStats.monthly}</p>
                  </div>
                  <div className="stat-card">
                    <h4>This Year</h4>
                    <p>{scanStats.yearly}</p>
                  </div>
                </div>
              </section>

              <section className="charts-container">
                <div className="chart-section">
                  <h4>Predictions Over Time</h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={analysisData.predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="N"
                        stroke="#4d79ff"
                        name="Normal (N)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="S"
                        stroke="#ffcc00"
                        name="Suspect (S)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="P"
                        stroke="#ff4d4d"
                        name="Pathologic (P)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-section">
                  <h4>Overall Case Distribution</h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(1)}%`
                        }
                        labelLine
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value}`, name]}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="top"
                        align="right"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </>
          )}

          {activeNav === "Records" && <Records />}
          {activeNav === "Management" && <Management />}
        </div>

        {showAdminDialog && (
          <div className="admin-dialog-overlay">
            <div className="admin-dialog">
              <button className="close-btn" onClick={closeAdminDialog}>
                ×
              </button>
              <User size={60} className="profile-icon" />
              <h2>Admin</h2>
              <p>admin@example.com</p>

              <div className="admin-dialog-buttons">
                <button
                  className="reset-password-btn"
                  onClick={handleChangePassword}
                >
                  Re-set Password
                </button>
              </div>
            </div>
          </div>
        )}

        {showLogoutDialog && (
          <div className="logout-dialog-overlay">
            <div className="logout-dialog">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="dialog-buttons">
                <button className="confirm-btn" onClick={confirmLogout}>
                  Yes
                </button>
                <button className="cancel-btn" onClick={cancelLogout}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
