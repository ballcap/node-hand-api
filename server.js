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
    const imagePath = req.file.path;

    // Read image and convert to base64
    const image = fs.readFileSync(imagePath, { encoding: "base64" });

    axios({
        method: "POST",
        url: "https://outline.roboflow.com/palm-reading-b3tep/1",  // URL of your Roboflow API
        params: {
            api_key: "4UvlBs9S1ryZ057JVPnR"  // Replace with your actual API key
        },
        data: image,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
        .then(function (response) {
            // Log the full response to check its structure
            console.log("API Response:", response.data);

            // Send both the original image (as base64) and the API response data
            res.json({
                image: `data:image/jpeg;base64,${image}`,  // Base64 image
                coordinates: response.data.predictions || []  // Send the predictions array (or empty array if not found)
            });
        })
        .catch(function (error) {
            res.status(500).json({ error: error.message });
        });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});