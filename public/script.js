// Global variables
let selectedUploadFile = null;
let selectedVerifyFile = null;

// Tab switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');
}

// File upload handling
document.getElementById('upload-file').addEventListener('change', function (e) {
    selectedUploadFile = e.target.files[0];
    if (selectedUploadFile) {
        document.getElementById('upload-btn').disabled = false;
        showFileInfo('upload', selectedUploadFile);
    }
});

document.getElementById('verify-file').addEventListener('change', function (e) {
    selectedVerifyFile = e.target.files[0];
    if (selectedVerifyFile) {
        document.getElementById('verify-btn').disabled = false;
        showFileInfo('verify', selectedVerifyFile);
    }
});

// Drag and drop functionality
function setupDragAndDrop() {
    const uploadAreas = document.querySelectorAll('.upload-area');

    uploadAreas.forEach(area => {
        area.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        area.addEventListener('dragleave', function (e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });

        area.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const fileInput = this.parentElement.querySelector('.file-input');
                fileInput.files = files;

                if (this.parentElement.id === 'upload-tab') {
                    selectedUploadFile = file;
                    document.getElementById('upload-btn').disabled = false;
                    showFileInfo('upload', file);
                } else if (this.parentElement.id === 'verify-tab') {
                    selectedVerifyFile = file;
                    document.getElementById('verify-btn').disabled = false;
                    showFileInfo('verify', file);
                }
            }
        });
    });
}

function showFileInfo(type, file) {
    const area = document.querySelector(`#${type}-tab .upload-area`);
    area.innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-file"></i>
        </div>
        <div class="upload-text">${file.name}</div>
        <div class="upload-hint">Size: ${formatFileSize(file.size)}</div>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload document
async function uploadDocument() {
    if (!selectedUploadFile) {
        showResult('upload', 'Please select a file first.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('document', selectedUploadFile);

    showLoading('upload', true);
    hideResult('upload');

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        showLoading('upload', false);

        if (result.success) {
            showResult('upload', `
                <div class="status-indicator status-success"></div>
                <strong>Success!</strong> ${result.message}<br><br>
                <strong>Document ID:</strong> ${result.documentId}<br>
                <strong>File Name:</strong> ${result.fileName}<br>
                <strong>Document Hash:</strong><br>
                <div class="hash-display">${result.documentHash}</div>
                <strong>Transaction Hash:</strong><br>
                <div class="hash-display">${result.transactionHash}</div>
            `, 'success');
        } else {
            showResult('upload', `
                <div class="status-indicator status-error"></div>
                <strong>Error:</strong> ${result.error}
            `, 'error');
        }
    } catch (error) {
        showLoading('upload', false);
        showResult('upload', `
            <div class="status-indicator status-error"></div>
            <strong>Error:</strong> Failed to upload document. Please try again.
        `, 'error');
    }
}

// Verify document
async function verifyDocument() {
    if (!selectedVerifyFile) {
        showResult('verify', 'Please select a file first.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('document', selectedVerifyFile);

    showLoading('verify', true);
    hideResult('verify');

    try {
        const response = await fetch('/verify', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        showLoading('verify', false);

        if (result.success) {
            if (result.isValid) {
                showResult('verify', `
                    <div class="status-indicator status-success"></div>
                    <strong>Document Verified!</strong> ${result.message}<br><br>
                    <strong>File Name:</strong> ${result.fileName}<br>
                    <strong>Original File Name:</strong> ${result.originalFileName}<br>
                    <strong>Document Hash:</strong><br>
                    <div class="hash-display">${result.documentHash}</div>
                    <strong>Owner:</strong> ${result.owner}<br>
                    <strong>Registered:</strong> ${new Date(parseInt(result.timestamp) * 1000).toLocaleString()}
                `, 'success');
            } else {
                showResult('verify', `
                    <div class="status-indicator status-error"></div>
                    <strong>Document Not Found!</strong> ${result.message}<br><br>
                    <strong>File Name:</strong> ${result.fileName}<br>
                    <strong>Document Hash:</strong><br>
                    <div class="hash-display">${result.documentHash}</div>
                `, 'error');
            }
        } else {
            showResult('verify', `
                <div class="status-indicator status-error"></div>
                <strong>Error:</strong> ${result.error}
            `, 'error');
        }
    } catch (error) {
        showLoading('verify', false);
        showResult('verify', `
            <div class="status-indicator status-error"></div>
            <strong>Error:</strong> Failed to verify document. Please try again.
        `, 'error');
    }
}

// Load user documents
async function loadUserDocuments() {
    const address = document.getElementById('user-address').value.trim();

    if (!address) {
        alert('Please enter an Ethereum address');
        return;
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        alert('Please enter a valid Ethereum address');
        return;
    }

    showLoading('documents', true);
    document.getElementById('documents-list').innerHTML = '';

    try {
        const response = await fetch(`/documents/${address}`);
        const result = await response.json();

        showLoading('documents', false);

        if (result.documents && result.documents.length > 0) {
            const documentsHtml = result.documents.map(doc => `
                <div class="document-item">
                    <div class="document-name">${doc.fileName}</div>
                    <div class="document-hash">${doc.documentHash}</div>
                    <div class="document-timestamp">
                        Registered: ${new Date(parseInt(doc.timestamp) * 1000).toLocaleString()}
                    </div>
                </div>
            `).join('');

            document.getElementById('documents-list').innerHTML = documentsHtml;
        } else {
            document.getElementById('documents-list').innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p>No documents found for this address</p>
                </div>
            `;
        }
    } catch (error) {
        showLoading('documents', false);
        document.getElementById('documents-list').innerHTML = `
            <div style="text-align: center; color: #dc3545; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>Failed to load documents. Please try again.</p>
            </div>
        `;
    }
}

// Utility functions
function showLoading(type, show) {
    const loadingElement = document.getElementById(`${type}-loading`);
    if (show) {
        loadingElement.style.display = 'block';
    } else {
        loadingElement.style.display = 'none';
    }
}

function showResult(type, message, resultType) {
    const resultElement = document.getElementById(`${type}-result`);
    resultElement.innerHTML = message;
    resultElement.className = `result-area result-${resultType}`;
    resultElement.style.display = 'block';
}

function hideResult(type) {
    const resultElement = document.getElementById(`${type}-result`);
    resultElement.style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    setupDragAndDrop();

    // Check server health
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            console.log('Server health:', data);
        })
        .catch(error => {
            console.error('Server health check failed:', error);
        });
}); 