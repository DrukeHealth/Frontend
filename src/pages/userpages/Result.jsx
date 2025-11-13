import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./css/Result.css";

const BASE_URL = import.meta.env.VITE_API_URL; // e.g., https://druk-ehealth-backend.onrender.com

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
  const [error, setError] = useState(null);

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

        // Check for non-JSON response
        const contentType = res.headers.get("content-type");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server did not return JSON. Check backend endpoint!");
        }

        const data = await res.json();
        setLabel(data.label || "Unknown");
        setFeatures(data.features || {});
        setIsNonCTG(data.label?.toLowerCase().includes("non ctg"));
      } catch (err) {
        console.error("Prediction failed:", err);
        setError(err.message || "Prediction failed! Please try again.");
      } finally {
        setLoading(false);
      }
    };

    sendForPrediction();
  }, [imageFile]);

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

  return (
    <div
      className="result-container"
      style={{
        backgroundColor: darkMode ? "#121212" : "#FFFFFF",
        color: darkMode ? "#EAEAEA" : "#0d52bd",
        minHeight: "100vh",
      }}
    >
      {error && (
        <div style={{ color: "red", textAlign: "center", margin: "20px" }}>
          Error: {error}
        </div>
      )}

      {loading ? (
        <p className="analyzing-text">🔍 Analyzing image...</p>
      ) : (
        <>
          {imagePreview && (
            <div className="preview">
              <img src={imagePreview} alt="CTG Preview" className="preview-img" />
            </div>
          )}

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

          {!isNonCTG && Object.keys(features).length > 0 && (
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

          <button onClick={() => navigate("/ctg-scan")} className="return-btn">
            Return to CTG Scan
          </button>
        </>
      )}
    </div>
  );
}
