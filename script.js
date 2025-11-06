.container {
    width: fit-content; /* Container fits content */
    max-width: 95vw; /* But don't exceed viewport width */
    margin: 10px auto;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow-x: auto; /* Scroll if table is too wide */
}

.blue-table {
    width: 100%;
    min-width: 800px; /* Ensure table has minimum width */
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    table-layout: auto;
}

.blue-table th,
.blue-table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #e3f2fd;
    white-space: nowrap;
}

.blue-table th {
    background: #1976d2;
    color: white;
    font-weight: bold;
}

.blue-table tr:hover td {
    background: #e3f2fd;
}
