import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { loadCSV } from '../data/csvToJson';
import { Typography, Box } from '@mui/material';

const EVDataTable = () => {
  const [jsonData, setJsonData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const csvFilePath = '/assets/Electric_Vehicle_Population_Data.csv'; // Update with your file path

    loadCSV(csvFilePath)
      .then((data) => {
        setJsonData(data);
      })
      .catch((err) => {
        setError(err);
        console.error('Error loading CSV:', err);
      });
  }, []);

  console.log("CSV",jsonData, error)

  const columnDefs = useMemo(() => [
    { headerName: 'VIN (1-10)', field: 'VIN (1-10)', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'Vehicle ID', field: 'DOL Vehicle ID', sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
    { headerName: 'Census Tract', field: '2020 Census Tract', sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
    { headerName: 'Base MSRP', field: 'Base MSRP', sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
    { headerName: 'City', field: 'City', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'CAFV Eligibility', field: 'Clean Alternative Fuel Vehicle (CAFV) Eligibility', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'County', field: 'County', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'Electric Range', field: 'Electric Range', sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
    { headerName: 'Electric Utility', field: 'Electric Utility', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'EV Type', field: 'Electric Vehicle Type', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'Legislative District', field: 'Legislative District', sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
    { headerName: 'Make', field: 'Make', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'Model', field: 'Model', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'Model Year', field: 'Model Year', sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
    { headerName: 'Postal Code', field: 'Postal Code', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'State', field: 'State', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'Location', field: 'Vehicle Location', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
  ], []);

  return (
    <Box sx={{ backgroundColor: '#ede7f6', width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
        Electric Vehicle Data
      </Typography>
      <div className="ag-theme-alpine" style={{ width: '100%', height: '80vh' }}>
        <AgGridReact
          rowData={jsonData}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            floatingFilter: true, // Adds search functionality to each column
            resizable: true,
          }}
          pagination={true}
          paginationPageSize={15}
        />
      </div>
    </Box>
  );
};

export default EVDataTable;
