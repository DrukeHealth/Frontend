

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./css/Result.css";
const BASE_URL = import.meta.env.VITE_API_URL;

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const imageFile = location.state?.imageFile;

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [features, setFeatures] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [isNonCTG, setIsNonCTG] = useState(false);

  // -----------------------------
  // Send image to backend for prediction
  // -----------------------------
  useEffect(() => {
    if (!imageFile) return;

    setImagePreview(URL.createObjectURL(imageFile));

    const sendForPrediction = async () => {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await fetch(`${BASE_URL}/predict/`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setLabel(data.label || "Unknown");
        setFeatures(data.features || {});
        setIsNonCTG(data.label?.toLowerCase().includes("non ctg"));
      } catch (err) {
        console.error("Prediction failed:", err);
        alert("Prediction failed! Please try again.");
      } finally {
        setLoading(false);
      }
    };

    sendForPrediction();
  }, [imageFile]);

  // -----------------------------
  // If user lands here without uploading image
  // -----------------------------
  if (!imageFile) {
    return (
      <div
        className={`no-image ${darkMode ? "dark-mode" : ""}`}
        style={{
          backgroundColor: darkMode ? "#121212" : "#FFFFFF",
          color: darkMode ? "#EAEAEA" : "#0d52bd",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>No image provided. Please go back to the scan page.</p>
        <button onClick={() => navigate("/ctg-scan")} className="return-btn">
          Return to CTG Scan
        </button>
      </div>
    );
  }

  // -----------------------------
  // Main UI
  // -----------------------------
  return (
    <div
      className="result-container"
      style={{
        backgroundColor: darkMode ? "#121212" : "#FFFFFF",
        color: darkMode ? "#EAEAEA" : "#0d52bd",
        minHeight: "100vh",
      }}
    >
      {/* Navigation Bar */}
      <nav
        className="navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: darkMode ? "#222" : "#e2edfb",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          height: "90px",
        }}
      >
        {/* Left: Logo - Extreme left with no spacing */}
        <div
          onClick={() => navigate("/home")}
          style={{ 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center",
            marginLeft: "-30px",
          }}
        >
          <img 
            src="/Latestlogo.png" 
            alt="Druk eHealth Logo" 
            style={{ height: "115px" }} 
          />
        </div>

        {/* Center: Title */}
        <div
          style={{
            fontWeight: "bold",
            textAlign: "center",
            color: darkMode ? "#EAEAEA" : "#0d52bd",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <span className="title" style={{fontSize: "1.8rem",color: darkMode ? "#EAEAEA" : "#0d52bd" }}>
            CTG Result
          </span>
        </div>

        {/* Right: Dark Mode Toggle */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <label
            style={{
              position: "relative",
              display: "inline-block",
              width: "50px",
              height: "26px",
            }}
          >
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: darkMode ? "#444" : "#ccc",
                transition: "0.4s",
                borderRadius: "34px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  height: "18px",
                  width: "18px",
                  left: darkMode ? "26px" : "4px",
                  bottom: "4px",
                  backgroundColor: "white",
                  transition: "0.4s",
                  borderRadius: "50%",
                }}
              ></span>
            </span>
          </label>
        </div>
      </nav>

      {/* Main Body */}
      <div className="result-body fade-in">
        {imagePreview && (
          <div className="preview">
            <img src={imagePreview} alt="CTG Preview" className="preview-img" />
          </div>
        )}

        {loading ? (
          <p className="analyzing-text">🔍 Analyzing image...</p>
        ) : (
          <div
            className={`prediction-result ${
              label === "Normal"
                ? "normal"
                : label === "Suspect"
                ? "suspect"
                : label === "Pathologic"
                ? "pathologic"
                : "non-ctg"
            }`}
          >
            <h3>Prediction Result</h3>
            <p>{label}</p>
          </div>
        )}

        {/* Feature Table */}
        {!loading && !isNonCTG && Object.keys(features).length > 0 && (
          <div className="feature-section">
            <h3>Extracted Features</h3>
            <div className="table-wrapper">
              <table className="feature-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(features).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && (
          <button onClick={() => navigate("/ctg-scan")} className="return-btn">
            Return to CTG Scan
          </button>
        )}
      </div>

      {/* Footer */}
      <footer
        className="footer"
        style={{
          backgroundColor: darkMode ? "#222" : "#e2edfb",
          color: darkMode ? "#EAEAEA" : "#0d52bd",
        }}
      >
        <p>
          © {new Date().getFullYear()} Druk <span className="e-letter">e</span>Health. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

