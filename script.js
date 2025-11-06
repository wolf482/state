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
                
                // Compare values (case-insensitive string comparison)
                if (String(row[column]).toLowerCase() !== String(value).toLowerCase()) {
                    return false; // Row doesn't match this filter condition
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

// Example 1: Filter with specific values for all 4 columns
const results1 = filterXLSBWithMultipleColumns('your_file.xlsb', {
    'Column1': 'Value1',      // Filter for Column1
    'Column2': 'Value2',      // Filter for Column2  
    'Column3': 'Value3',      // Filter for Column3
    'Column4': 'Value4'       // Filter for Column4
});

// Example 2: Filter with only some columns (leave others empty for no filter)
const results2 = filterXLSBWithMultipleColumns('your_file.xlsb', {
    'Column1': 'SpecificValue',
    'Column2': '',           // No filter for Column2
    'Column3': 'AnotherValue',
    'Column4': null          // No filter for Column4
});

// Example 3: Your actual usage - REPLACE WITH YOUR REAL COLUMN NAMES AND VALUES
const yourResults = filterXLSBWithMultipleColumns('your_file.xlsb', {
    'Department': 'IT',           // Replace with your 1st column name and value
    'Status': 'Active',           // Replace with your 2nd column name and value
    'Region': 'North',            // Replace with your 3rd column name and value
    'Priority': 'High'            // Replace with your 4th column name and value
});
