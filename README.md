# Document Verification Blockchain System

A complete blockchain-based document verification system that allows users to upload documents, generate cryptographic hashes, and register them on the Ethereum blockchain for secure verification.

## Features

✅ **Document Upload**: Upload various file types (PDF, DOC, TXT, images)  
✅ **Hash Generation**: Automatically generate SHA-256 hashes of documents  
✅ **Blockchain Registration**: Store document hashes on Ethereum smart contract  
✅ **Document Verification**: Verify document authenticity against blockchain records  
✅ **User Document Management**: View all documents registered by an address  
✅ **Modern Web Interface**: Beautiful, responsive UI with drag-and-drop support  

## Technology Stack

- **Smart Contract**: Solidity (Ethereum)
- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + JavaScript (Vanilla)
- **Blockchain**: Hardhat (Local Ethereum Network)
- **File Processing**: Multer + Crypto
- **Blockchain Integration**: Ethers.js

## Project Structure

```
blockchain/
├── contracts/
│   └── DocumentVerifier.sol      # Smart contract
├── scripts/
│   └── deploy.js                 # Deployment script
├── public/
│   ├── index.html               # Frontend interface
│   └── script.js                # Frontend JavaScript
├── server.js                    # Express backend server
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start local blockchain**:
   ```bash
   npx hardhat node
   ```
   Keep this terminal running - it provides your local Ethereum network.

3. **Deploy smart contract** (in a new terminal):
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network localhost
   ```

4. **Start the application** (in a new terminal):
   ```bash
   npm start
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Uploading Documents

1. Click on the "Upload & Register" tab
2. Drag and drop a file or click to select
3. Click "Upload & Register on Blockchain"
4. Wait for the transaction to complete
5. View the generated hash and transaction details

### Verifying Documents

1. Click on the "Verify Document" tab
2. Upload the document you want to verify
3. Click "Verify Document"
4. View the verification results

### Viewing Your Documents

1. Click on the "My Documents" tab
2. Enter an Ethereum address
3. Click "Load Documents"
4. View all documents registered by that address

## Smart Contract Details

The `DocumentVerifier` smart contract provides:

- **Document Registration**: Store document hashes with metadata
- **Document Verification**: Check if a document hash exists on-chain
- **User Document Management**: Retrieve all documents for a user
- **Event Logging**: Emit events for document registration

### Key Functions

- `registerDocument(string _documentHash, string _fileName)`: Register a new document
- `verifyDocument(string _documentHash)`: Verify a document by hash
- `getUserDocuments(address _user)`: Get all documents for a user
- `getDocument(bytes32 _documentId)`: Get specific document details

## API Endpoints

### Backend API

- `POST /upload` - Upload and register document
- `POST /verify` - Verify document authenticity
- `GET /documents/:address` - Get user documents
- `GET /health` - Server health check

### Request/Response Examples

**Upload Document**:
```javascript
// Request
const formData = new FormData();
formData.append('document', file);

// Response
{
  "success": true,
  "documentId": "0x...",
  "documentHash": "a1b2c3...",
  "fileName": "document.pdf",
  "transactionHash": "0x...",
  "message": "Document uploaded and registered on blockchain successfully!"
}
```

**Verify Document**:
```javascript
// Response
{
  "success": true,
  "isValid": true,
  "documentHash": "a1b2c3...",
  "fileName": "document.pdf",
  "originalFileName": "original.pdf",
  "timestamp": "1640995200",
  "owner": "0x...",
  "message": "Document is authentic and verified on blockchain!"
}
```

## Security Features

- **Cryptographic Hashing**: SHA-256 hashing ensures document integrity
- **Blockchain Immutability**: Once registered, document hashes cannot be altered
- **Address-based Ownership**: Documents are tied to specific Ethereum addresses
- **Transaction Transparency**: All operations are recorded on the blockchain

## Development

### Running Tests
```bash
npx hardhat test
```

### Compiling Contracts
```bash
npx hardhat compile
```

### Local Development
```bash
npm run dev  # Starts server with nodemon
```

## Deployment

### To Testnet (e.g., Sepolia)

1. Add your private key to `.env`:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

2. Update `hardhat.config.js` with network configuration

3. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

### To Mainnet

1. Ensure you have sufficient ETH for gas fees
2. Update network configuration in `hardhat.config.js`
3. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

## Troubleshooting

### Common Issues

1. **"No accounts available"**: Make sure Hardhat node is running
2. **"Failed to initialize blockchain"**: Check if contract is deployed
3. **"Transaction failed"**: Ensure account has sufficient ETH for gas

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
DEBUG=true npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the smart contract documentation

---

**Note**: This is a prototype system. For production use, consider:
- Implementing proper access controls
- Adding rate limiting
- Using IPFS for document storage
- Implementing multi-signature requirements
- Adding audit logging 

# IN case of any error try these command first 
npx hardhat compile 
npx hardhat run scripts/deploy.js --network localhost