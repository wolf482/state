const ExcelJS = require('exceljs');

async function loadAndFilterExcel() {
    try {
        // Load the workbook
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('your_file.xlsx');
        
        // Get the first worksheet
        const worksheet = workbook.getWorksheet(1);
        
        // Get column headers (assuming first row is headers)
        const headers = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value;
        });
        
        console.log('Columns:', headers.filter(Boolean));
        
        // Filter data - replace 'Column1' and 'specific_value' with your actual values
        const filteredData = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                const rowData = {};
                row.eachCell((cell, colNumber) => {
                    rowData[headers[colNumber]] = cell.value;
                });
                
                // Filter condition - adjust as needed
                if (rowData['Column1'] === 'specific_value') {
                    filteredData.push(rowData);
                }
            }
        });
        
        console.log('Filtered data:', filteredData);
        return filteredData;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
loadAndFilterExcel();
