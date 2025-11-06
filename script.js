.blue-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 8px rgba(0, 100, 200, 0.1);
    table-layout: auto; /* This allows columns to adjust to content */
}

.blue-table th,
.blue-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e3f2fd;
    white-space: nowrap; /* Prevent text wrapping */
}

.blue-table th {
    background: linear-gradient(135deg, #1e88e5, #1565c0);
    color: white;
    font-weight: bold;
    border: none;
    position: sticky;
    top: 0;
}

.blue-table td {
    background: white;
}

.blue-table tr:hover td {
    background: #e3f2fd;
    transition: background 0.2s ease;
}

.blue-table tr:nth-child(even) td {
    background: #f8fdff;
}

/* Specific column adjustments based on typical content length */
.blue-table th:nth-child(1), /* VSR State */
.blue-table td:nth-child(1) {
    width: auto; /* Let content determine width */
    min-width: 180px; /* Minimum width for readability */
}

.blue-table th:nth-child(2), /* VA State */
.blue-table td:nth-child(2) {
    width: auto;
    min-width: 100px;
}

.blue-table th:nth-child(3), /* CVE */
.blue-table td:nth-child(3) {
    width: auto;
    min-width: 140px;
}

.blue-table th:nth-child(4), /* Priority */
.blue-table td:nth-child(4) {
    width: auto;
    min-width: 100px;
}

.blue-table th:nth-child(5), /* DPL ID */
.blue-table td:nth-child(5) {
    width: auto;
    min-width: 120px;
}

.blue-table th:nth-child(6), /* PRODUCT NAME */
.blue-table td:nth-child(6) {
    width: auto;
    min-width: 200px;
}

.blue-table th:nth-child(7), /* Due Date */
.blue-table td:nth-child(7) {
    width: auto;
    min-width: 120px;
}

.blue-table th:nth-child(8), /* Created Time */
.blue-table td:nth-child(8) {
    width: auto;
    min-width: 120px;
}

.blue-table th:nth-child(9), /* ModifiedDate */
.blue-table td:nth-child(9) {
    width: auto;
    min-width: 120px;
}
