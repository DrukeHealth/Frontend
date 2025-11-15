import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import image1 from "../../assets/image1.svg";

export default function CTGScan() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const BASE_URL = "https://druk-ehealth-backend.onrender.com/api"; // Node backend

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#FFFFFF";
    document.body.style.color = darkMode ? "#EAEAEA" : "#0d52bd";
  }, [darkMode]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCapture = async () => {
    try {
      setCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error("Unable to access the camera. Please allow permission.");
      console.error(err);
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "capture.png", { type: "image/png" });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
      },
      "image/png"
    );
  };

  const stopCamera = () => {
    setCapturing(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const handleProceed = async () => {
    if (!imageFile) {
      toast.warn("Please upload or capture an image first.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("ctgImage", imageFile);

      await axios.post(`${BASE_URL}/scans/postCTG`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Image uploaded successfully!");

      setTimeout(() => {
        navigate("/result", {
          state: { imageFile, imagePreview },
        });
      }, 1200);
    } catch (err) {
      console.error("❌ Error uploading CTG image:", err);
      toast.error("Unable to connect to the backend. Please check server logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    setImageFile(null);
    setImagePreview(null);
    stopCamera();
  };

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#121212" : "#FFFFFF",
        color: darkMode ? "#EAEAEA" : "#0d52bd",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Altos Sans, sans-serif", // ✅ added font family
      }}
    >
      <ToastContainer
        position="top-center"
        autoClose={2000}
        theme={darkMode ? "dark" : "light"}
      />

       {/* Navigation Bar */}
      <nav
        className="navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px", // Keep original padding for dark mode
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
            marginLeft: "-30px", // Negative margin to counteract navbar padding
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
            CTG Scan          </span>
        </div>

        {/* Right: Dark Mode Toggle - Keep previous spacing */}
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

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          paddingTop: "2rem",
          paddingBottom: "4rem",
          overflowY: "auto",
        }}
      >
        {capturing && (
          <div>
            <video ref={videoRef} />
            <div style={{ marginTop: "1rem" }}>
              <button onClick={takePhoto} style={buttonStyle("#4CAF50")}>
                Capture Photo
              </button>
              <button onClick={stopCamera} style={buttonStyle("#E74C3C")}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {imagePreview && (
          <div>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "90%",
                maxWidth: "420px",
                height: "auto",
                borderRadius: "10px",
                boxShadow: darkMode
                  ? "0 0 10px rgba(255,255,255,0.2)"
                  : "0 0 10px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        )}

        {!imagePreview && !capturing && (
          <div style={emptyStateContainer}>
            <img
              src={image1}
              alt="Scan Icon"
              style={{ width: "300px", height: "300px" }}
            />
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* <button
                onClick={handleCapture}
                style={primaryButtonStyle(darkMode)}
              >
                Scan CTG Record 
              </button> */}
              <label htmlFor="fileUpload" style={primaryButtonStyle(darkMode)}>
                Upload CTG Record
              </label>
              <input
                type="file"
                id="fileUpload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleUpload}
              />
            </div>
          </div>
        )}

        {imagePreview && (
          <div style={actionButtonsContainer}>
            <button
              onClick={handleProceed}
              disabled={loading}
              style={{
                ...buttonStyle(loading ? "#888" : "#4CAF50"),
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Diagnosing..." : "Diagnose"}
            </button>
            <button onClick={handleReturn} style={buttonStyle("#E74C3C")}>
              Return
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className={`footer ${darkMode ? "dark" : ""}`}
        style={{
          backgroundColor: darkMode ? "#222" : "#e2edfb",
          color: darkMode ? "#EAEAEA" : "#0d52bd",
          textAlign: "center",
          padding: "18px 10px",
          fontSize: "0.95rem",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <p>
          © {new Date().getFullYear()} Druk{" "}
          <span className="e-letter">e</span>Health. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontFamily: "Altos Sans, sans-serif", // ✅ consistent typography
});

const primaryButtonStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#4C8BE8" : "#679ADC",
  color: "white",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  border: "none",
  fontFamily: "Altos Sans, sans-serif",
  transition: "background 0.3s",
});

const emptyStateContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "1rem",
  marginTop: "2rem",
};

const actionButtonsContainer = {
  marginTop: "2rem",
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  justifyContent: "center",
};

