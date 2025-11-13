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
  Cell
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
  const [analysisData, setAnalysisData] = useState({ predictions: [], nspStats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const COLORS = ["#4d79ff", "#ffcc00", "#ff4d4d"]; // Normal, Suspect, Pathologic

  // ✅ Use deployed backend URL from env
  const BASE_URL = import.meta.env.VITE_API_URL;  // <-- This will be your Render backend

  // Fetch line & pie chart data
  useEffect(() => {
    fetch(`${BASE_URL}/api/analysis`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setAnalysisData(data);

        // Merge nspStats into scanStats for PieChart
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
  }, [BASE_URL]);

  // Fetch scan statistics
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
  }, [BASE_URL]);
