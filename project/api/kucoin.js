const crypto = require("crypto");
const axios = require("axios");

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = "675f44a9421a720001d5c76d";    // Your API Key
    const apiSecret = "4da6d7ef-1e20-4d0b-b6a3-c2604190c6f5";    // Your API Secret
    const passphrase = "kubot@test1";  // Your API Passphrase

    if (!apiKey || !apiSecret || !passphrase) {
        return res.status(500).json({ error: "Missing API credentials" });
    }

    const endpoint = "https://api-futures.kucoin.com"; // The active contracts endpoint
    const method = "GET";
    const requestPath = "/api/v1/contracts/active"; // Path for the active contracts API
    const timestamp = Date.now();

    try {
        // Generate the signature for the GET request
        const message = `${timestamp}${method}${requestPath}`;
        const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("base64");
        const passphraseSignature = crypto.createHmac("sha256", apiSecret).update(passphrase).digest("base64");

        // Send the GET request to KuCoin API
        const response = await axios.get(endpoint, {
            headers: {
                "KC-API-KEY": apiKey,
                "KC-API-SIGN": signature,
                "KC-API-TIMESTAMP": timestamp,
                "KC-API-PASSPHRASE": passphraseSignature,
                "KC-API-KEY-VERSION": "2",
                "Content-Type": "application/json",
            },
        });

        // Send the response back to the client
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching active contracts from KuCoin:", error.message);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
}


   