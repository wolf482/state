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
    let filename = req.params.filename;
    
    console.log(`📥 Request for filename: "${filename}"`);
    
    // Remove .json extension if user accidentally included it
    filename = filename.replace(/\.json$/i, '');
    
    // More permissive filename validation - allow dots, spaces, and common characters
    if (!/^[a-zA-Z0-9_\-\.\s]+$/.test(filename)) {
        return res.status(400).json({
            error: 'Invalid filename. Only alphanumeric characters, spaces, hyphens, underscores, and dots are allowed.',
            received: req.params.filename,
            suggestion: 'Use only letters, numbers, spaces, hyphens, underscores, and dots'
        });
    }
    
    // Try multiple filename variations
    const possibleFilenames = [
        `${filename}.json`,
        `${filename.replace(/\s+/g, '')}.json`, // Remove spaces
        `${filename.replace(/[^a-zA-Z0-9]/g, '')}.json` // Remove all non-alphanumeric
    ];
    
    let filePath = null;
    let foundFilename = null;
    
    // Check which filename variation exists
    for (const possibleFilename of possibleFilenames) {
        const testPath = path.join(__dirname, possibleFilename);
        if (fs.existsSync(testPath)) {
            filePath = testPath;
            foundFilename = possibleFilename;
            break;
        }
    }
    
    if (!filePath) {
        const availableFiles = getAvailableJsonFiles();
        return res.status(404).json({
            error: `File '${filename}.json' not found.`,
            tried: possibleFilenames,
            availableFiles: availableFiles,
            suggestion: availableFiles.length > 0 ? 
                `Try one of: ${availableFiles.map(f => f.replace('.json', '')).join(', ')}` :
                'No JSON files available'
        });
    }
    
    try {
        // Read and parse JSON file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        console.log(`✅ Serving file: ${foundFilename} (${Array.isArray(jsonData) ? jsonData.length : 1} records)`);
        
        // Send JSON response
        res.json({
            success: true,
            filename: foundFilename,
            data: jsonData,
            recordCount: Array.isArray(jsonData) ? jsonData.length : 1,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error reading file:', error.message);
        res.status(500).json({
            error: 'Error reading or parsing JSON file',
            message: error.message,
            filename: foundFilename
        });
    }
});

// New endpoint that lists files in a more accessible way
app.get('/files/list', (req, res) => {
    const availableFiles = getAvailableJsonFiles();
    const fileList = availableFiles.map(file => ({
        name: file,
        nameWithoutExtension: file.replace('.json', ''),
        apiUrl: `/json/${file.replace('.json', '')}`
    }));
    
    res.json({
        availableFiles: fileList,
        count: availableFiles.length,
        usage: 'Use /json/[filename] without .json extension'
    });
});

// Helper function to get available JSON files
function getAvailableJsonFiles() {
    try {
        const files = fs.readdirSync(__dirname);
        return files.filter(file => 
            file.toLowerCase().endsWith('.json') && 
            !file.includes('package') // Exclude package.json files
        );
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
    const fileExamples = availableFiles.slice(0, 5).map(f => f.replace('.json', ''));
    
    res.json({
        message: 'JSON File Server is running!',
        server: {
            port: PORT,
            hostname: os.hostname(),
            networkInterfaces: networkInfo
        },
        usage: {
            basic: 'GET /json/:filename (without .json extension)',
            examples: fileExamples.map(f => `http://[server-ip]:${PORT}/json/${f}`),
            listFiles: `GET http://[server-ip]:${PORT}/files/list`
        },
        availableFiles: availableFiles,
        endpoints: {
            '/json/:filename': 'Get content of specific JSON file',
            '/files/list': 'List all available JSON files with API URLs',
            '/network': 'Get server network information'
        }
    });
});

// Endpoint to list all available JSON files
app.get('/files', (req, res) => {
    const availableFiles = getAvailableJsonFiles();
    
    res.json({
        availableFiles: availableFiles,
        count: availableFiles.length,
        fileNames: availableFiles.map(f => f.replace('.json', ''))
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
    const availableFiles = getAvailableJsonFiles();
    
    console.log(`🚀 JSON Server running on port ${PORT}`);
    console.log(`🌐 Accessible from any IP address on the network`);
    console.log(`📡 Network Interfaces:`);
    
    networkInfo.forEach(net => {
        console.log(`   - ${net.interface}: http://${net.address}:${PORT}`);
    });
    
    console.log(`\n📁 Available JSON files: ${availableFiles.length}`);
    availableFiles.forEach(file => {
        console.log(`   📄 ${file} -> /json/${file.replace('.json', '')}`);
    });
    
    console.log(`\n💡 Usage Examples:`);
    if (availableFiles.length > 0) {
        availableFiles.slice(0, 3).forEach(file => {
            const name = file.replace('.json', '');
            console.log(`   curl http://${networkInfo[0]?.address || 'localhost'}:${PORT}/json/${name}`);
        });
    }
    console.log(`   curl http://${networkInfo[0]?.address || 'localhost'}:${PORT}/files/list`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
