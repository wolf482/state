const XLSX = require('xlsx');
const readline = require('readline');

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

async function interactiveXLSBFilter() {
    const rl = createInterface();
    
    try {
        const filePath = 'your_file.xlsb'; // Change to your file path
        
        console.log('Loading .xlsb file...');
        const workbook = XLSX.readFile(filePath);
        
        if (workbook.SheetNames.length === 0) {
            console.log('No sheets found in the workbook');
            return;
        }
        
        // Let user choose sheet if multiple exist
        let sheetName;
        if (workbook.SheetNames.length > 1) {
            console.log('\nAvailable sheets:');
            workbook.SheetNames.forEach((name, index) => {
                console.log(`${index + 1}. ${name}`);
            });
            
            const sheetChoice = await askQuestion(rl, '\nSelect sheet (number): ');
            sheetName = workbook.SheetNames[parseInt(sheetChoice) - 1];
        } else {
            sheetName = workbook.SheetNames[0];
        }
        
        console.log(`Using sheet: ${sheetName}`);
        
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length === 0) {
            console.log('No data found in the selected sheet');
            return;
        }
        
        console.log(`\nLoaded ${data.length} rows`);
        console.log('Available columns:', Object.keys(data[0]));
        
        // Get filter criteria
        const columnName = await askQuestion(rl, '\nEnter column name to filter by: ');
        const filterValue = await askQuestion(rl, 'Enter value to filter for: ');
        
        // Check if column exists
        if (!data[0].hasOwnProperty(columnName)) {
            console.log(`Column '${columnName}' not found in the data`);
            return;
        }
        
        // Filter data
        const filteredData = data.filter(row => {
            return String(row[columnName]) === String(filterValue);
        });
        
        console.log(`\nFound ${filteredData.length} matching records`);
        
        if (filteredData.length > 0) {
            console.log('\nFirst few results:');
            console.table(filteredData.slice(0, 5));
            
            // Option to save
            const save = await askQuestion(rl, '\nSave results to new file? (y/n): ');
            if (save.toLowerCase() === 'y') {
                const newWorkbook = XLSX.utils.book_new();
                const newWorksheet = XLSX.utils.json_to_sheet(filteredData);
                XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Filtered_Data');
                XLSX.writeFile(newWorkbook, 'filtered_results.xlsx');
                console.log('Results saved to filtered_results.xlsx');
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
    }
}

function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Run the function
interactiveXLSBFilter();
