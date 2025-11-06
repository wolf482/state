.container {
    max-width: 1200px;
    margin: 10px auto; /* Reduced top margin */
    background: white;
    padding: 15px; /* Reduced padding */
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow-x: hidden; /* Prevent horizontal scroll */
}

/* Remove excessive top margins from elements inside container */
.container h1 {
    margin-top: 0; /* Remove top margin from heading */
    margin-bottom: 15px;
}

.container p {
    margin-top: 5px;
    margin-bottom: 15px;
}

/* Ensure all child elements don't cause horizontal overflow */
.container > * {
    max-width: 100%;
    box-sizing: border-box;
}

/* File list container adjustments */
.file-list-container {
    display: block; /* Changed to block since it's visible */
    max-width: 400px;
    margin: 10px 0;
}

.file-list {
    background: #f8f9fa;
    border: 1px solid #dfe1e6;
    border-radius: 4px;
    padding: 10px;
    max-height: 200px;
    overflow-y: auto;
    width: fit-content;
    min-width: 200px;
}

.file-item {
    padding: 8px 12px;
    margin: 3px 0;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    border: 1px solid #dfe1e6;
    width: fit-content;
    min-width: 150px;
    max-width: 350px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-item:hover {
    background: #deebff;
    border-color: #4c9aff;
}
