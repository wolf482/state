const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests and enable CORS
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Serve JSON file content based on filename parameter
app.get('/json/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // Security: Only allow alphanumeric filenames
    if (!/^[a-zA-Z0-9_-]+$/.test(filename)) {
        return res.status(400).json({
            error: 'Invalid filename. Only alphanumeric characters, hyphens, and underscores are allowed.'
        });
    }
    
    const filePath = path.join(__dirname, `${filename}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: `File '${filename}.json' not found.`,
            availableFiles: getAvailableJsonFiles()
        });
    }
    
    try {
        // Read and parse JSON file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Send JSON response
        res.json({
            success: true,
            filename: `${filename}.json`,
            data: jsonData,
            recordCount: Array.isArray(jsonData) ? jsonData.length : 1,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Error reading or parsing JSON file',
            message: error.message
        });
    }
});

// Helper function to get available JSON files
function getAvailableJsonFiles() {
    try {
        const files = fs.readdirSync(__dirname);
        return files.filter(file => file.endsWith('.json'));
    } catch (error) {
        return [];
    }
}

// Get network interfaces
function getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    Object.keys(interfaces).forEach(iface => {
        interfaces[iface].forEach(details => {
            if (details.family === 'IPv4' && !details.internal) {
                addresses.push({
                    interface: iface,
                    address: details.address,
                    mac: details.mac
                });
            }
        });
    });
    
    return addresses;
}

// Root endpoint with instructions
app.get('/', (req, res) => {
    const availableFiles = getAvailableJsonFiles();
    const networkInfo = getNetworkInfo();
    
    res.json({
        message: 'JSON File Server is running!',
        server: {
            port: PORT,
            hostname: os.hostname(),
            networkInterfaces: networkInfo
        },
        usage: 'GET /json/:filename (without .json extension)',
        example: `http://[server-ip]:${PORT}/json/file`,
        availableFiles: availableFiles,
        endpoints: {
            '/json/:filename': 'Get content of specific JSON file',
            '/files': 'List all available JSON files',
            '/network': 'Get server network information'
        }
    });
});

// Endpoint to list all available JSON files
app.get('/files', (req, res) => {
    const availableFiles = getAvailableJsonFiles();
    
    res.json({
        availableFiles: availableFiles,
        count: availableFiles.length
    });
});

// Endpoint to get network information
app.get('/network', (req, res) => {
    res.json({
        hostname: os.hostname(),
        networkInterfaces: getNetworkInfo(),
        serverTime: new Date().toISOString()
    });
});

// Handle preflight requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Start server on all available IPs
const server = app.listen(PORT, '0.0.0.0', () => {
    const networkInfo = getNetworkInfo();
    
    console.log(`🚀 JSON Server running on port ${PORT}`);
    console.log(`🌐 Accessible from any IP address on the network`);
    console.log(`📡 Network Interfaces:`);
    
    networkInfo.forEach(net => {
        console.log(`   - ${net.interface}: http://${net.address}:${PORT}`);
    });
    
    console.log(`\n📁 Available JSON files: ${getAvailableJsonFiles().join(', ')}`);
    console.log(`💡 Usage: GET http://[server-ip]:${PORT}/json/filename`);
    console.log(`🔧 Example: curl http://${networkInfo[0]?.address || 'localhost'}:${PORT}/json/file`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
