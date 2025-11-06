const XLSX = require('xlsx');

function filterXLSBWithMultipleColumns(filePath, filters) {
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
        
        // Show column names
        const columns = Object.keys(data[0]);
        console.log('Available columns:', columns);
        
        // Validate that filter columns exist in the data
        const filterColumns = Object.keys(filters);
        for (const column of filterColumns) {
            if (!columns.includes(column)) {
                console.warn(`Warning: Column '${column}' not found in the dataset. Available columns: ${columns.join(', ')}`);
                // Remove the invalid filter
                delete filters[column];
            }
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
        
        // Save filtered results to filter.xlsx
        if (filteredData.length > 0) {
            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(filteredData);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Filtered_Data');
            XLSX.writeFile(newWorkbook, 'filter.xlsx');
            console.log('✅ Filtered results saved to filter.xlsx');
        } else {
            console.log('❌ No data matching the filters found. File not saved.');
        }
        
        return filteredData;
        
    } catch (error) {
        console.error('Error reading .xlsb file:', error.message);
        return [];
    }
}

// USAGE EXAMPLES:

// Example 1: One column with two values (OR condition), others with single values
const results1 = filterXLSBWithMultipleColumns('your_file.xlsb', {
    'Column1': ['Value1', 'Value2'],  // Column1 can be Value1 OR Value2
    'Column2': 'Value3',              // Column2 must be Value3
    'Column3': 'Value4',              // Column3 must be Value4
    'Column4': 'Value5'               // Column4 must be Value5
});

// Example 2: Multiple columns with multiple values
const results2 = filterXLSBWithMultipleColumns('your_file.xlsb', {
    'Column1': ['ValueA', 'ValueB'],  // Column1 = ValueA OR ValueB
    'Column2': ['ValueX', 'ValueY'],  // Column2 = ValueX OR ValueY
    'Column3': 'SingleValue',         // Column3 must be SingleValue
    'Column4': ''                     // No filter for Column4
});

// Example 3: Mixed single and multiple values
const results3 = filterXLSBWithMultipleColumns('your_file.xlsb', {
    'Department': ['IT', 'Engineering'],  // Department = IT OR Engineering
    'Status': 'Active',                   // Status must be Active
    'Priority': ['High', 'Critical'],     // Priority = High OR Critical
    'Region': 'North'                     // Region must be North
});
