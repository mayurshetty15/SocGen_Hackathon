// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentVerifier {
    struct Document {
        string documentHash;
        uint256 timestamp;
        address owner;
        string fileName;
        bool exists;
    }
    
    mapping(bytes32 => Document) public documents;
    mapping(address => bytes32[]) public userDocuments;
    mapping(string => bytes32) public hashToDocumentId;
    
    event DocumentRegistered(
        bytes32 indexed documentId,
        string documentHash,
        address indexed owner,
        uint256 timestamp,
        string fileName
    );
    
    event DocumentVerified(
        bytes32 indexed documentId,
        string documentHash,
        bool isValid
    );
    
    function registerDocument(
        string memory _documentHash,
        string memory _fileName
    ) public returns (bytes32) {
        require(bytes(_documentHash).length > 0, "Document hash cannot be empty");
        require(bytes(_fileName).length > 0, "File name cannot be empty");

        bytes32 documentId = keccak256(abi.encodePacked(_documentHash, msg.sender, block.timestamp));

        require(!documents[documentId].exists, "Document already registered");

        Document memory newDocument = Document({
            documentHash: _documentHash,
            timestamp: block.timestamp,
            owner: msg.sender,
            fileName: _fileName,
            exists: true
        });

        documents[documentId] = newDocument;
        userDocuments[msg.sender].push(documentId);
        hashToDocumentId[_documentHash] = documentId;

        emit DocumentRegistered(
            documentId,
            _documentHash,
            msg.sender,
            block.timestamp,
            _fileName
        );

        return documentId;
    }
    
    function verifyDocument(string memory _documentHash) public view returns (bool, uint256, address, string memory) {
        // Search through all documents to find a match
        // In a production environment, you might want to use a more efficient data structure
        for (uint i = 0; i < userDocuments[msg.sender].length; i++) {
            bytes32 documentId = userDocuments[msg.sender][i];
            Document memory doc = documents[documentId];
            
            if (keccak256(abi.encodePacked(doc.documentHash)) == keccak256(abi.encodePacked(_documentHash))) {
                return (true, doc.timestamp, doc.owner, doc.fileName);
            }
        }
        
        return (false, 0, address(0), "");
    }
    
    function verifyDocumentByHash(string memory _documentHash) public view returns (bool, uint256, address, string memory) {
        // Check if the document hash exists
        bytes32 documentId = hashToDocumentId[_documentHash];
        
        if (documentId == bytes32(0)) {
            return (false, 0, address(0), "");
        }
        
        Document memory doc = documents[documentId];
        return (true, doc.timestamp, doc.owner, doc.fileName);
    }
    
    function getUserDocuments(address _user) public view returns (bytes32[] memory) {
        return userDocuments[_user];
    }
    
    function getDocument(bytes32 _documentId) public view returns (Document memory) {
        require(documents[_documentId].exists, "Document does not exist");
        return documents[_documentId];
    }
    
    function getDocumentCount(address _user) public view returns (uint256) {
        return userDocuments[_user].length;
    }
} 