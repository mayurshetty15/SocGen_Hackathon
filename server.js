const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Blockchain setup
let provider, contract, contractAddress, signer;

async function initializeBlockchain() {
    try {
        // Load contract address
        const contractInfo = JSON.parse(fs.readFileSync('./contract-address.json', 'utf8'));
        contractAddress = contractInfo.address;

        // Connect to local Hardhat network
        provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

        // Use the first Hardhat account's private key
        // This is safe for local development only!
        const localPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        signer = new ethers.Wallet(localPrivateKey, provider);

        // Load contract ABI
        const contractArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json', 'utf8'));
        const abi = contractArtifact.abi;

        // Create contract instance with signer
        contract = new ethers.Contract(contractAddress, abi, signer);

        console.log('Blockchain initialized successfully');
        console.log('Contract address:', contractAddress);
        console.log('Signer address:', await signer.getAddress());
    } catch (error) {
        console.error('Failed to initialize blockchain:', error);
    }
}

// Generate SHA-256 hash of file
function generateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload document and register on blockchain
app.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        console.log('Registering document:', fileName);

        // Generate hash
        const documentHash = generateFileHash(filePath);
        console.log('Hash:', documentHash);

        // Register document on blockchain
        const tx = await contract.registerDocument(documentHash, fileName);
        const receipt = await tx.wait();

        // Check transaction status
        if (receipt.status !== 1) {
            console.error('Transaction failed:', receipt);
            return res.status(500).json({ error: 'Blockchain transaction failed' });
        }

        // For ethers v5 and v6: get the event topic hash robustly
        const eventTopic = require('ethers').utils
            ? require('ethers').utils.id("DocumentRegistered(bytes32,string,address,uint256,string)")
            : require('ethers').id("DocumentRegistered(bytes32,string,address,uint256,string)");

        // Find the log for the DocumentRegistered event
        const log = receipt.logs.find(l => l.topics[0] === eventTopic);

        if (!log) {
            console.error("No DocumentRegistered event found in transaction logs. All logs:", receipt.logs);
            throw new Error("DocumentRegistered event not found in transaction logs");
        }

        const event = contract.interface.parseLog(log);
        const documentId = event.args[0];

        res.json({
            success: true,
            documentId: documentId,
            documentHash: documentHash,
            fileName: fileName,
            transactionHash: tx.hash,
            message: 'Document uploaded and registered on blockchain successfully!'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload document: ' + error.message });
    }
});

// Verify document
app.post('/verify', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        // Generate hash
        const documentHash = generateFileHash(filePath);
        // Verify on blockchain
        const [isValid, timestamp, owner, originalFileName] = await contract.verifyDocumentByHash(documentHash);
        if (isValid) {
            res.json({
                success: true,
                isValid: true,
                documentHash: documentHash,
                fileName: fileName,
                originalFileName: originalFileName,
                timestamp: timestamp.toString(),
                owner: owner,
                message: 'Document is authentic and verified on blockchain!'
            });
        } else {
            res.json({
                success: true,
                isValid: false,
                documentHash: documentHash,
                fileName: fileName,
                message: 'Document not found on blockchain. It may not be authentic.'
            });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify document: ' + error.message });
    }
});

// Get user documents
app.get('/documents/:address', async (req, res) => {
    try {
        const userAddress = req.params.address;
        const documentIds = await contract.getUserDocuments(userAddress);
        const documents = [];
        for (const docId of documentIds) {
            const doc = await contract.getDocument(docId);
            documents.push({
                documentId: docId,
                documentHash: doc.documentHash,
                fileName: doc.fileName,
                timestamp: doc.timestamp.toString(),
                owner: doc.owner
            });
        }
        res.json({ documents });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Failed to get documents: ' + error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', contractAddress: contractAddress });
});

// Start server only after blockchain is initialized
initializeBlockchain().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
