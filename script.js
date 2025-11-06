const XLSX = require('xlsx');

function filterXLSBWithSelectedColumns(filePath, filters, outputColumns) {
    try {
        console.log('Loading .xlsb file...');
        
        // Load the binary workbook
        const workbook = XLSX.readFile(filePath);
        
        // Check available sheets
        console.log('Available sheets:', workbook.SheetNames);
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
            throw new Error('Worksheet is undefined - file may be empty or corrupted');
        }
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Total rows loaded:', data.length);
        
        if (data.length === 0) {
            console.log('No data found in the file');
            return [];
        }
        
        // Show all column names
        const allColumns = Object.keys(data[0]);
        console.log('All available columns:', allColumns);
        console.log('Selected output columns:', outputColumns);
        
        // Validate that filter columns exist in the data
        const filterColumns = Object.keys(filters);
        for (const column of filterColumns) {
            if (!allColumns.includes(column)) {
                console.warn(`Warning: Filter column '${column}' not found in the dataset.`);
                delete filters[column];
            }
        }
        
        // Validate that output columns exist
        const validOutputColumns = outputColumns.filter(col => allColumns.includes(col));
        const invalidOutputColumns = outputColumns.filter(col => !allColumns.includes(col));
        
        if (invalidOutputColumns.length > 0) {
            console.warn(`Warning: These output columns not found: ${invalidOutputColumns.join(', ')}`);
        }
        
        console.log('Applying filters:', filters);
        
        // Filter the data based on all specified columns
        const filteredData = data.filter(row => {
            // Check all filter conditions
            for (const [column, value] of Object.entries(filters)) {
                // Skip if filter value is empty or null (meaning no filter for this column)
                if (value === null || value === '' || value === undefined) {
                    continue;
                }
                
                // Handle array values (OR condition - match any of the values)
                if (Array.isArray(value)) {
                    let matchFound = false;
                    for (const val of value) {
                        if (String(row[column]).toLowerCase() === String(val).toLowerCase()) {
                            matchFound = true;
                            break;
                        }
                    }
                    if (!matchFound) {
                        return false; // Row doesn't match any of the values in the array
                    }
                } 
                // Handle single value
                else {
                    if (String(row[column]).toLowerCase() !== String(value).toLowerCase()) {
                        return false; // Row doesn't match this filter condition
                    }
                }
            }
            return true; // Row matches all filter conditions
        });
        
        console.log(`Filtered data: ${filteredData.length} rows found`);
        
        // Extract only the selected columns for output
        const outputData = filteredData.map(row => {
            const selectedRow = {};
            validOutputColumns.forEach(col => {
                selectedRow[col] = row[col];
            });
            return selectedRow;
        });
        
        // Save filtered results to filter.xlsx with only selected columns
        if (outputData.length > 0) {
            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(outputData);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Filtered_Data');
            XLSX.writeFile(newWorkbook, 'filter.xlsx');
            console.log('✅ Filtered results saved to filter.xlsx');
            console.log(`📊 Output includes ${validOutputColumns.length} columns:`, validOutputColumns);
        } else {
            console.log('❌ No data matching the filters found. File not saved.');
        }
        
        return outputData;
        
    } catch (error) {
        console.error('Error reading .xlsb file:', error.message);
        return [];
    }
}

// USAGE EXAMPLES:

// Example 1: Specify which 9 columns to include in output
const results1 = filterXLSBWithSelectedColumns('your_file.xlsb', 
    {
        'Column1': ['Value1', 'Value2'],  // Column1 can be Value1 OR Value2
        'Column2': 'Value3',              // Column2 must be Value3
        'Column3': 'Value4',              // Column3 must be Value4
        'Column4': 'Value5'               // Column4 must be Value5
    },
    [ // Specify exactly which 9 columns to include in output
        'Column1', 'Column2', 'Column3', 'Column4',
        'Column5', 'Column6', 'Column7', 'Column8', 'Column9'
    ]
);

// Example 2: Real-world example
const results2 = filterXLSBWithSelectedColumns('your_file.xlsb',
    {
        'Department': ['IT', 'Engineering'],
        'Status': 'Active',
        'Priority': ['High', 'Critical'],
        'Region': 'North'
    },
    [ // Only these 9 columns will be in the output file
        'EmployeeID', 'Name', 'Department', 'Position', 
        'Salary', 'StartDate', 'Status', 'Region', 'Email'
    ]
);
