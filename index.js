const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 8070;

// Serve static files from specific directories
app.use("/", express.static(path.join(__dirname, "Landing Page")));
app.use("/practice", express.static(path.join(__dirname, "Dashboard")));
app.use("/profile", express.static(path.join(__dirname, "UserProfile")));
app.use(express.static(path.join(__dirname))); // For files in the root directory

// Define routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "UserProfile", "profile.html"));
});
app.get("/practice", (req, res) => {
    res.sendFile(path.join(__dirname, "Dashboard", "dashboard.html"));
  });

app.get("/contribute", (req, res) => {
  res.sendFile(path.join(__dirname, "newQuestion.html"));
});
app.get("/dsa-roadmap", (req, res) => {
    res.sendFile(path.join(__dirname, "roadMap.html"));
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "Landing Page", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});