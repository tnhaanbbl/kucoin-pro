const crypto = require("crypto");
const axios = require("axios");

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = "675f44a9421a720001d5c76d"; // Store in environment variables
    const apiSecret = "4da6d7ef-1e20-4d0b-b6a3-c2604190c6f5";
    const passphrase = "kubot@test1";

    const endpoint = "https://api.kucoin.com/api/v1/orders";
    const method = "POST";
    const requestPath = "/api/v1/orders";
    const body = req.body || {}; // Forward frontend payload if needed
    const timestamp = Date.now();

    try {
        // Generate the signature
        const message = `${timestamp}${method}${requestPath}${JSON.stringify(body)}`;
        const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("base64");
        const passphraseSignature = crypto.createHmac("sha256", apiSecret).update(passphrase).digest("base64");

        // Send the request to KuCoin
        const response = await axios.post(endpoint, body, {
            headers: {
                "KC-API-KEY": apiKey,
                "KC-API-SIGN": signature,
                "KC-API-TIMESTAMP": timestamp,
                "KC-API-PASSPHRASE": passphraseSignature,
                "KC-API-KEY-VERSION": "2",
                "Content-Type": "application/json",
            },
        });

        // Relay the response to the frontend
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data from KuCoin:", error.message);
        res.status(500).json({ error: error.message });
    }
}
   