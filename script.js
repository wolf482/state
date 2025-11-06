const XLSX = require('xlsx');
const fs = require('fs');

// Hardcoded filters for three columns (adjust these as needed)
const HARDCODED_FILTERS = {
    'Priority': ['High', 'Critical'],  // Your 2nd column filter
    'VA State': 'Open'                 // Your 3rd column filter
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
        console.error('Example: node filter-script.js "Red Hat Developer Hub"');
        process.exit(1);
    }
    
    // Create filename by removing blank spaces
    const fileName = userValue.replace(/\s+/g, '');
    
    console.log('🚀 Starting XLSB Filter...\n');
    console.log(`📝 User provided filter value: "${userValue}"`);
    console.log(`📁 Base filename: "${fileName}"`);
    
    // Combine hardcoded filters with user-provided filter
    const allFilters = {
        'Column1': userValue,  // User value for Column1
        ...HARDCODED_FILTERS   // Spread the hardcoded filters
    };
    
    console.log('🎯 All filters being applied:', allFilters);
    
    const results = filterXLSBWithSelectedColumns(
        'your_file.xlsb',  // Your file path
        allFilters,
        OUTPUT_COLUMNS,
        fileName
    );
    
    if (results.length > 0) {
        console.log(`\n🎉 Success! Found ${results.length} matching records.`);
        console.log(`📁 Results saved to: ${fileName}.xlsx and ${fileName}.json`);
        console.log('📊 Output columns:', OUTPUT_COLUMNS.length, 'columns');
    } else {
        console.log('\n❌ No matching records found with the specified filters.');
    }
}

function filterXLSBWithSelectedColumns(filePath, filters, outputColumns, fileName) {
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
        
        // Save to both XLSX and JSON files
        if (outputData.length > 0) {
            // Save as XLSX
            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(outputData);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Filtered_Data');
            XLSX.writeFile(newWorkbook, `${fileName}.xlsx`);
            console.log(`✅ Excel file saved to: ${fileName}.xlsx`);
            
            // Save as JSON
            fs.writeFileSync(`${fileName}.json`, JSON.stringify(outputData, null, 2));
            console.log(`✅ JSON file saved to: ${fileName}.json`);
        }
        
        return outputData;
        
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

// Run the script
main();
