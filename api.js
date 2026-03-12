const API_BASE_URL =
window.location.hostname === "localhost"
? "http://localhost:8080"
: "https://speakflow-ai.onrender.com";

export default API_BASE_URL;
