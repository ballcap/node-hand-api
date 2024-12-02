const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");  // Import CORS

const app = express();
const upload = multer({ dest: "uploads/" });

// Enable CORS for all routes
app.use(cors());
app.use(express.static("public"));  // Serve static files from 'public' directory

// Route to handle image upload and API request
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    const imagePath = req.file.path;

    // Read image as raw binary data
    const image = fs.readFileSync(imagePath);

    axios({
        method: "POST",
        url: "https://outline.roboflow.com/palm-reading-b3tep/1",
        params: {
            api_key: "4UvlBs9S1ryZ057JVPnR",
        },
        data: image,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })
        .then((response) => {
            console.log("API Response:", response.data);

            res.json({
                image: `data:image/jpeg;base64,${fs.readFileSync(imagePath, {
                    encoding: "base64",
                })}`,
                coordinates: response.data.predictions || [],
            });
        })
        .catch((error) => {
            console.error("Error in API call:", error.message);
            res.status(500).json({ error: "Error processing image." });
        })
        .finally(() => {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting temporary file:", err);
            });
        });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
