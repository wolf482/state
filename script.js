.file-list-container {
    display: none;
    max-width: 400px; /* Limit maximum width */
    margin: 10px 0;
}

.file-list {
    background: #f8f9fa;
    border: 1px solid #dfe1e6;
    border-radius: 4px;
    padding: 10px;
    max-height: 200px;
    overflow-y: auto;
    width: fit-content; /* Adjust width to content */
    min-width: 200px; /* Minimum width */
}

.file-item {
    padding: 8px 12px;
    margin: 3px 0;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    border: 1px solid #dfe1e6;
    width: fit-content; /* Adjust to content width */
    min-width: 150px; /* Ensure readable width */
    max-width: 350px; /* Prevent too wide */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-item:hover {
    background: #deebff;
    border-color: #4c9aff;
}

/* Label styling */
.file-list-container label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #172b4d;
    width: fit-content;
}
