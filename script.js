<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Data Viewer for Confluence</title>
    <style>
        /* ... (keep the same styles as before) ... */
        .file-list {
            background: #f8f9fa;
            border: 1px solid #dfe1e6;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
            max-height: 200px;
            overflow-y: auto;
        }
        .file-item {
            padding: 5px 10px;
            margin: 2px 0;
            background: white;
            border-radius: 3px;
            cursor: pointer;
            border: 1px solid #dfe1e6;
        }
        .file-item:hover {
            background: #deebff;
            border-color: #4c9aff;
        }
        .suggestion {
            color: #0052cc;
            font-weight: bold;
            cursor: pointer;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 JSON Data Viewer for Confluence</h1>
        
        <div class="controls">
            <div class="input-group">
                <label for="serverUrl">Server URL:</label>
                <input type="text" id="serverUrl" placeholder="http://your-server-ip:3000" value="http://10.226.202.16:3000">
                <button onclick="refreshFileList()">Refresh Files</button>
            </div>
            
            <div class="input-group">
                <label for="filename">JSON Filename (without .json extension):</label>
                <input type="text" id="filename" placeholder="RedHatBuildofkeycloak">
                <button onclick="loadData()">Load Data</button>
                <button class="copy-button" onclick="copyConfluenceMarkup()" id="copyButton">Copy Confluence Markup</button>
            </div>

            <div id="fileListContainer" style="display: none;">
                <label>Available Files (click to load):</label>
                <div id="fileList" class="file-list"></div>
            </div>
        </div>

        <div id="status" class="status"></div>

        <div id="loading" class="loading" style="display: none;">
            🔄 Loading data from server...
        </div>

        <div id="results">
            <div id="tableContainer" class="table-container" style="display: none;">
                <h3>Data Preview</h3>
                <table id="dataTable">
                    <thead id="tableHeader"></thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>
            
            <div id="noData" style="text-align: center; padding: 40px; color: #666;">
                No data loaded. Enter a filename and click "Load Data", or select from available files.
            </div>
        </div>
    </div>

    <script>
        let currentData = null;
        let availableFiles = [];

        function showStatus(message, type = 'info') {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => status.style.display = 'none', 5000);
            }
        }

        function hideStatus() {
            document.getElementById('status').style.display = 'none';
        }

        async function refreshFileList() {
            const serverUrl = document.getElementById('serverUrl').value.trim();
            
            if (!serverUrl) {
                showStatus('Please enter server URL first', 'error');
                return;
            }

            try {
                const response = await fetch(`${serverUrl}/files/list`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch file list');
                }

                availableFiles = result.availableFiles || [];
                displayFileList(availableFiles);
                showStatus(`📁 Found ${availableFiles.length} JSON files`, 'success');

            } catch (error) {
                showStatus(`❌ Error loading file list: ${error.message}`, 'error');
                document.getElementById('fileListContainer').style.display = 'none';
            }
        }

        function displayFileList(files) {
            const fileListContainer = document.getElementById('fileListContainer');
            const fileListElement = document.getElementById('fileList');
            
            if (files.length === 0) {
                fileListContainer.style.display = 'none';
                return;
            }

            fileListElement.innerHTML = files.map(file => 
                `<div class="file-item" onclick="loadFile('${file.nameWithoutExtension}')">
                    📄 ${file.nameWithoutExtension}
                </div>`
            ).join('');

            fileListContainer.style.display = 'block';
        }

        function loadFile(filename) {
            document.getElementById('filename').value = filename;
            loadData();
        }

        async function loadData() {
            const serverUrl = document.getElementById('serverUrl').value.trim();
            const filename = document.getElementById('filename').value.trim();
            
            if (!serverUrl || !filename) {
                showStatus('Please enter both server URL and filename', 'error');
                return;
            }

            // Show loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('tableContainer').style.display = 'none';
            document.getElementById('noData').style.display = 'none';
            hideStatus();

            try {
                const response = await fetch(`${serverUrl}/json/${encodeURIComponent(filename)}`);
                const result = await response.json();

                if (!response.ok) {
                    // Check if there are suggestions in the error response
                    if (result.availableFiles && result.availableFiles.length > 0) {
                        const suggestion = result.availableFiles[0].replace('.json', '');
                        throw new Error(`${result.error}. Did you mean "${suggestion}"?`);
                    }
                    throw new Error(result.error || 'Failed to fetch data');
                }

                if (result.success) {
                    currentData = result.data;
                    displayData(currentData);
                    showStatus(`✅ Loaded ${result.recordCount} records from ${result.filename}`, 'success');
                } else {
                    throw new Error(result.error || 'Unknown error');
                }

            } catch (error) {
                showStatus(`❌ Error: ${error.message}`, 'error');
                document.getElementById('tableContainer').style.display = 'none';
                document.getElementById('noData').style.display = 'block';
                
                // Auto-refresh file list on error
                refreshFileList();
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        }

        function displayData(data) {
            if (!data || (Array.isArray(data) && data.length === 0)) {
                document.getElementById('tableContainer').style.display = 'none';
                document.getElementById('noData').style.display = 'block';
                return;
            }

            const tableData = Array.isArray(data) ? data : [data];
            const headers = Object.keys(tableData[0]);

            // Build table header
            const tableHeader = document.getElementById('tableHeader');
            tableHeader.innerHTML = '<tr>' + headers.map(header => 
                `<th>${header}</th>`
            ).join('') + '</tr>';

            // Build table body
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = tableData.map(row => {
                return '<tr>' + headers.map(header => {
                    let value = row[header] || '';
                    let className = '';
                    
                    // Add styling based on content
                    if (header === 'Priority') {
                        if (value.toLowerCase().includes('high') || value.toLowerCase().includes('critical')) {
                            className = 'priority-high';
                        } else if (value.toLowerCase().includes('medium')) {
                            className = 'priority-medium';
                        } else if (value.toLowerCase().includes('low')) {
                            className = 'priority-low';
                        }
                    } else if (header === 'VA State') {
                        if (value.toLowerCase().includes('open')) {
                            className = 'va-open';
                        } else if (value.toLowerCase().includes('closed')) {
                            className = 'va-closed';
                        }
                    }
                    
                    return `<td class="${className}">${value}</td>`;
                }).join('') + '</tr>';
            }).join('');

            document.getElementById('tableContainer').style.display = 'block';
            document.getElementById('noData').style.display = 'none';
        }

        function generateConfluenceMarkup() {
            if (!currentData) return '';

            const data = Array.isArray(currentData) ? currentData : [currentData];
            const headers = Object.keys(data[0]);

            let markup = '{table}\n';
            
            // Header row
            markup += '| ' + headers.join(' | ') + ' |\n';
            
            // Data rows
            data.forEach(row => {
                const rowData = headers.map(header => {
                    let value = row[header] || '';
                    // Escape pipes for Confluence
                    value = String(value).replace(/\|/g, '\\|');
                    return value;
                });
                markup += '| ' + rowData.join(' | ') + ' |\n';
            });
            
            markup += '{table}';
            return markup;
        }

        function copyConfluenceMarkup() {
            if (!currentData) {
                showStatus('No data loaded to copy', 'error');
                return;
            }

            const markup = generateConfluenceMarkup();
            
            // Copy to clipboard
            navigator.clipboard.writeText(markup).then(() => {
                showStatus('✅ Confluence markup copied to clipboard!', 'success');
            }).catch(err => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = markup;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showStatus('✅ Confluence markup copied to clipboard!', 'success');
            });
        }

        // Allow Enter key to trigger load
        document.getElementById('filename').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadData();
            }
        });

        // Auto-refresh file list when server URL changes
        document.getElementById('serverUrl').addEventListener('change', refreshFileList);

        // Initial setup
        document.getElementById('noData').style.display = 'block';
        
        // Auto-refresh file list on page load if server URL is already set
        setTimeout(refreshFileList, 1000);
    </script>
</body>
</html>
