import crypto from "crypto";
import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.KUCOIN_API_KEY;
    const apiSecret = process.env.KUCOIN_API_SECRET;
    const passphrase = process.env.KUCOIN_PASSPHRASE;

    const endpoint = "https://api.kucoin.com/api/v1/orders";
    const method = "POST";
    const requestPath = "/api/v1/orders";
    const body = req.body || {};
    const timestamp = Date.now();

    try {
        const message = `${timestamp}${method}${requestPath}${JSON.stringify(body)}`;
        const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("base64");
        const passphraseSignature = crypto.createHmac("sha256", apiSecret).update(passphrase).digest("base64");

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

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data from KuCoin:", error.message);
        res.status(500).json({ error: error.message });
    }
}

   