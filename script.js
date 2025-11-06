.blue-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 8px rgba(0, 100, 200, 0.1);
}

.blue-table th {
    background: linear-gradient(135deg, #1e88e5, #1565c0);
    color: white;
    padding: 12px 15px;
    text-align: left;
    font-weight: bold;
    border: none;
    position: sticky;
    top: 0;
}

.blue-table td {
    padding: 10px 15px;
    border-bottom: 1px solid #e3f2fd;
    background: white;
}

.blue-table tr:hover td {
    background: #e3f2fd;
    transition: background 0.2s ease;
}

.blue-table tr:nth-child(even) td {
    background: #f8fdff;
}
