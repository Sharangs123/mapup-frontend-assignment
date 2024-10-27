// csvToJson.js
import Papa from 'papaparse';

// Function to load and convert CSV to JSON
export const loadCSV = (csvFilePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFilePath, {
      download: true, // Use download to fetch the CSV file
      header: true, // First row as headers
      skipEmptyLines: true, // Skip empty lines
      complete: (results) => {
        if (results.errors.length) {
          reject(results.errors);
        } else {
          resolve(results.data); // Resolve with the parsed data
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
