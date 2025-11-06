const XLSX = require('xlsx');

// Hardcoded filters for three columns (adjust these as needed)
const HARDCODED_FILTERS = {
    'Column2': 'HardcodedValue2',  // Your 2nd column filter
    'Column3': 'HardcodedValue3',  // Your 3rd column filter
    'Column4': 'HardcodedValue4'   // Your 4th column filter
};

// Hardcoded output columns (adjust these to your 9 desired columns)
const OUTPUT_COLUMNS = [
    'Column1', 'Column2', 'Column3', 'Column4', 'Column5',
    'Column6', 'Column7', 'Column8', 'Column9'
];

function main() {
    // Get command line argument for the dynamic filter
    const userValue = process.argv[2];
    
    if (!userValue) {
        console.error('❌ Usage: node filter-script.js <filter-value>');
        console.error('Example: node filter-script.js "IT"');
        process.exit(1);
    }
    
    console.log('🚀 Starting XLSB Filter...\n');
    console.log(`📝 User provided filter value: "${userValue}"`);
    
    // Combine hardcoded filters with user-provided filter
    const allFilters = {
        'Column1': userValue,  // User value for Column1
        ...HARDCODED_FILTERS   // Spread the hardcoded filters
    };
    
    console.log('🎯 All filters being applied:', allFilters);
    
    const results = filterXLSBWithSelectedColumns(
        'your_file.xlsb',  // Your file path
        allFilters,
        OUTPUT_COLUMNS
    );
    
    if (results.length > 0) {
        console.log(`\n🎉 Success! Found ${results.length} matching records.`);
        console.log('📁 Results saved to: filter.xlsx');
        console.log('📊 Output columns:', OUTPUT_COLUMNS.length, 'columns');
    } else {
        console.log('\n❌ No matching records found with the specified filters.');
    }
}

function filterXLSBWithSelectedColumns(filePath, filters, outputColumns) {
    try {
        console.log('\n📂 Loading .xlsb file...');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Total rows loaded:', data.length);
        
        if (data.length === 0) return [];
        
        const allColumns = Object.keys(data[0]);
        console.log('All available columns:', allColumns.length, 'columns');
        
        // Validate output columns
        const validOutputColumns = outputColumns.filter(col => allColumns.includes(col));
        const invalidOutputColumns = outputColumns.filter(col => !allColumns.includes(col));
        
        if (invalidOutputColumns.length > 0) {
            console.warn(`⚠️  These output columns not found: ${invalidOutputColumns.join(', ')}`);
        }
        
        if (validOutputColumns.length === 0) {
            console.error('❌ No valid output columns specified!');
            return [];
        }
        
        // Apply filters
        const filteredData = data.filter(row => {
            for (const [column, value] of Object.entries(filters)) {
                if (!value) continue;
                
                if (Array.isArray(value)) {
                    const matchFound = value.some(val => 
                        String(row[column]).toLowerCase() === String(val).toLowerCase()
                    );
                    if (!matchFound) return false;
                } else {
                    if (String(row[column]).toLowerCase() !== String(value).toLowerCase()) {
                        return false;
                    }
                }
            }
            return true;
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
        
        // Save to filter.xlsx with only selected columns
        if (outputData.length > 0) {
            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(outputData);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Filtered_Data');
            XLSX.writeFile(newWorkbook, 'filter.xlsx');
            console.log('✅ Filtered results saved to filter.xlsx');
        }
        
        return outputData;
        
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

// Run the script
main();
