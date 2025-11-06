const XLSX = require('xlsx');

function loadAndFilterXLSB() {
    try {
        console.log('Loading .xlsb file...');
        
        // Load the binary workbook
        const workbook = XLSX.readFile('your_file.xlsb');
        
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
        console.log('Available columns:', Object.keys(data[0]));
        
        // Filter example - adjust these values
        const columnToFilter = 'Column1'; // Change to your column name
        const valueToFilter = 'specific_value'; // Change to your filter value
        
        const filteredData = data.filter(row => row[columnToFilter] === valueToFilter);
        
        console.log(`Filtered data (${columnToFilter} = ${valueToFilter}):`, filteredData.length, 'rows');
        console.log(filteredData);
        
        return filteredData;
        
    } catch (error) {
        console.error('Error reading .xlsb file:', error.message);
        return [];
    }
}

// Run the function
loadAndFilterXLSB();
