const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const PORT = process.env.PORT || 3000;

// Tumhara Private Backblaze Storage Config
const s3 = new S3Client({
    region: process.env.S3_REGION || "us-east-005", 
    endpoint: process.env.S3_ENDPOINT,             
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    }
});

// 10mb limit for high-quality phone camera selfies
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// UPLOAD ENDPOINT: Sirf save karne ke liye
app.post('/upload', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).send('No image data');

    try {
        // Base64 string ko clean karke Buffer me convert karna
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        const fileName = `smiles/mohtarma_${Date.now()}.png`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: 'image/png'
        });

        // Seedha private bucket me push
        await s3.send(command);
        
        console.log(`[+] Success! Unki photo tumhare private bucket me aagayi: ${fileName}`);
        res.json({ success: true });

    } catch (error) {
        console.error("[-] Upload Error:", error);
        res.status(500).send("Storage upload failed");
    }
});

app.listen(PORT, () => {
    console.log(`Server running perfectly on port ${PORT}`);
});