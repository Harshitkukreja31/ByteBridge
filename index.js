const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));


// Serve index.html for the root route
app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "index.html");
    
    fs.access(indexPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).send("Index file not found");
            return;
        }
        
        res.sendFile(indexPath, (err) => {
            if (err) {
                res.status(err.status || 500).end();
            }
        });
    });
});

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).send("Not found");
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});