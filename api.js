const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:8080"
        : "https://speakflow-ai-2.onrender.com";

export default API_BASE_URL;