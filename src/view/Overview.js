import React, { useState, useEffect } from 'react';
import { Card, CardContent, Box, Typography, Grid, LinearProgress} from '@mui/material';
import { loadCSV } from '../data/csvToJson';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Importing Leaflet components
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet library

const Overview = () => {
  const [jsonData, setJsonData] = useState([]);
  const [error, setError] = useState(null);
  const [waEVCount, setWaEVCount] = useState(0);
  const [mostSoldBrand, setMostSoldBrand] = useState("");
  const [evGrowthRate, setEvGrowthRate] = useState(0);
  const [yearRange, setYearRange] = useState("");
  const [cafvCount, setCafvCount] = useState(0);
  const [yearCountData, setYearCountData] = useState([]); 
  const [cityCountData, setCityCountData] = useState([]); 
  const [cafvData, setCafvData] = useState([]); 
  const [evTypeData, setEvTypeData] = useState([]);
  const [brandDistributionData, setBrandDistributionData] = useState([]);
  const [modelDistributionData, setModelDistributionData] = useState([]);
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    const csvFilePath = '/assets/Electric_Vehicle_Population_Data.csv';

    loadCSV(csvFilePath)
      .then((data) => {
        setJsonData(data);

        const count = data.filter(item => item['State']?.trim() === 'WA').length;
        setWaEVCount(count);

        const brandCount = data.reduce((acc, item) => {
          const brand = item['Make']?.trim();
          if (brand) {
            acc[brand] = (acc[brand] || 0) + 1;
          }
          return acc;
        }, {});

        const topBrand = Object.keys(brandCount).reduce((a, b) => 
          brandCount[a] > brandCount[b] ? a : b, 
        "");
        setMostSoldBrand(topBrand);

        const yearCount = data.reduce((acc, item) => {
          const year = item['Model Year'];
          if (year) {
            acc[year] = (acc[year] || 0) + 1;
          }
          return acc;
        }, {});

        const years = Object.keys(yearCount).map(Number).sort((a, b) => a - b);
        if (years.length > 1) {
          const startYear = years[0];
          const endYear = years[years.length - 1];
          const startCount = yearCount[startYear];
          const endCount = yearCount[endYear];
          setYearRange(`${startYear} - ${endYear}`);
          const numberOfYears = endYear - startYear;
          const growthRate = ((endCount / startCount) ** (1 / numberOfYears) - 1) * 100;
          setEvGrowthRate(growthRate.toFixed(2));
        } else {
          setEvGrowthRate(0);
        }

        const cafvCount = data.filter(item => item['Clean Alternative Fuel Vehicle (CAFV) Eligibility'] === 'Clean Alternative Fuel Vehicle Eligible').length;
        setCafvCount(cafvCount);

        const cafvCounts = {
          eligible: data.filter(item => item['Clean Alternative Fuel Vehicle (CAFV) Eligibility'] === 'Clean Alternative Fuel Vehicle Eligible').length,
          unknown: data.filter(item => item['Clean Alternative Fuel Vehicle (CAFV) Eligibility'] === 'Eligibility unknown as battery range has not been researched').length,
          notEligible: data.filter(item => item['Clean Alternative Fuel Vehicle (CAFV) Eligibility'] === 'Not eligible due to low battery range').length,
        };

        setCafvData([
          { name: 'Clean Alternative Fuel Vehicle Eligible', value: cafvCounts.eligible },
          { name: 'Eligibility Unknown', value: cafvCounts.unknown },
          { name: 'Not Eligible', value: cafvCounts.notEligible }
        ]);

        const chartData = Object.entries(yearCount).map(([year, count]) => ({ year, count }));
        setYearCountData(chartData);

        const cityCount = data.reduce((acc, item) => {
          const city = item['City']?.trim();
          if (city) {
            acc[city] = (acc[city] || 0) + 1;
          }
          return acc;
        }, {});
        
        const cityChartData = Object.entries(cityCount).map(([city, count]) => ({ city, count }));
        setCityCountData(cityChartData);

         // Calculate EV Type Distribution
         const evTypeCounts = {
          BEV: data.filter(item => item['Electric Vehicle Type'] === 'Battery Electric Vehicle (BEV)').length,
          PHEV: data.filter(item => item['Electric Vehicle Type'] === 'Plug-in Hybrid Electric Vehicle (PHEV)').length,
        };
        
        setEvTypeData([
          { name: 'Battery Electric Vehicle (BEV)', value: evTypeCounts.BEV },
          { name: 'Plug-in Hybrid Electric Vehicle (PHEV)', value: evTypeCounts.PHEV }
        ]);

        // Prepare brand distribution data for the line graph
        const brandDistribution = Object.entries(brandCount).map(([make, count]) => ({ make, count }));
        setBrandDistributionData(brandDistribution);


        // Prepare Model Distribution Data
        const modelCount = data.reduce((acc, item) => {
          const model = item['Model']?.trim();
          const brand = item['Make']?.trim(); // Get the brand name
          if (model && brand) {
            const key = `${brand} ${model}`; // Combine brand and model for unique key
            acc[key] = (acc[key] || 0) + 1; // Count occurrences
          }
          return acc;
        }, {});

        const totalCount = Object.values(modelCount).reduce((sum, count) => sum + count, 0);
        const modelDistribution = Object.entries(modelCount)
          .map(([key, count]) => ({
            brandModel: key,
            count,
            percentage: ((count / totalCount) * 100).toFixed(2) // Calculate percentage
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Get top 5 models

        setModelDistributionData(modelDistribution);


      // Prepare data for the map visualization
      const mapData = data.map(item => ({
        city: item['City'],
        location: item['Vehicle Location'], // Adjust based on your data
        lat: parseFloat(item['Latitude']), // Assuming latitude is a field
        lng: parseFloat(item['Longitude']), // Assuming longitude is a field
      })).filter(item => item.lat && item.lng); // Filter out entries without valid coordinates

      setMapData(mapData);

      })
      .catch((err) => {
        setError(err);
        console.error('Error loading CSV:', err);
      });
  }, []);

  return (
    <Box sx={{ backgroundColor: '#ede7f6', padding: 4, minHeight: '100vh', height: 'auto' }}>
      {error ? (
        <Typography color="error" variant="h6">
          Error loading CSV: {error.message}
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {/* Card for Total EV Count [WA] */}
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 1 }}>
                  Total EV Count [ WA ]
                </Typography>
                <Typography variant="h5" sx={{ color: '#311b92', fontWeight: 'bold' }}>
                  {waEVCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card for Most Sold EV Brand */}
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 1 }}>
                  Most Sold EV Brand
                </Typography>
                <Typography variant="h5" sx={{ color: '#311b92', fontWeight: 'bold' }}>
                  {mostSoldBrand || "No Data"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card for EV Growth Rate */}
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 1 }}>
                  EV Growth Rate [{yearRange}]
                </Typography>
                <Typography variant="h5" sx={{ color: '#311b92', fontWeight: 'bold' }}>
                  {evGrowthRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card for Clean Alternative Fuel Vehicle (CAFV) Eligibility Count */}
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 1 }}>
                  CAFV Eligibility Count
                </Typography>
                <Typography variant="h5" sx={{ color: '#311b92', fontWeight: 'bold' }}>
                  {cafvCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Bar Graphs for Year Count and City Distribution */}
      <Grid container spacing={4} justifyContent="center" sx={{ marginTop: 4 }}>
        {/* Bar Graph for Year Count */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 2 }}>
                Electric Vehicle Count by Year
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearCountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#673ab7" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Graph for City Distribution */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 2 }}>
                Electric Vehicle Distribution by City
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cityCountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#673ab7" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

 {/* Pie Charts for CAFV Eligibility and EV Type Distribution */}
<Grid container spacing={4} justifyContent="center" sx={{ marginTop: 4 }}>
  <Grid item xs={12} md={3}>
    <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 2 }}>
          Clean Alternative Fuel Vehicle (CAFV) Eligibility Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie 
              data={cafvData} 
              cx="50%" 
              cy="50%" 
              lineWidth={3} 
              outerRadius={80} 
              innerRadius={40} 
              fill="#82ca9d" 
              dataKey="value" 
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {cafvData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#5e35b1', '#311b92', '#b388ff'][index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ marginTop: 2 }}>
          {cafvData.map((entry, index) => (
            <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: ['#5e35b1', '#311b92', '#b388ff'][index], marginRight: 1 }} />
              <Typography sx={{ color: ['#5e35b1', '#311b92', '#b388ff'][index] }}>
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} md={3}>
    <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 2 }}>
          Electric Vehicle Type Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie 
              data={evTypeData} 
              cx="50%" 
              cy="50%" 
              lineWidth={3} 
              outerRadius={80} 
              innerRadius={40} 
              fill="#82ca9d" 
              dataKey="value" 
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {evTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#311b92" : "#5e35b1"} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ marginTop: 2 }}>
          {evTypeData.map((entry, index) => (
            <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: index === 0 ? "#311b92" : "#5e35b1", marginRight: 1 }} />
              <Typography sx={{ color: index === 0 ? "#311b92" : "#5e35b1" }}>
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  </Grid>

 {/* Line Graph for Brand Distribution */}
<Grid item xs={12} md={6}>
  <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 2 }}>
        Brand Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={brandDistributionData}>
          <YAxis />
          <XAxis type="category" dataKey="make" />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#673ab7" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</Grid>

  {/* Model Distribution Card */}
  <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ marginTop: 4, backgroundColor: '#d1c4e9', borderRadius: 2, padding: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 2 }}>
                 Top 5 Model Distribution
                </Typography>
                {modelDistributionData.map((modelData, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#311b92', fontWeight: 'bold', textAlign: 'left' }}>
                      {modelData.brandModel} ({modelData.percentage}%)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={modelData.percentage} 
                      sx={{
                        backgroundColor: '#b39ddb',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: modelData.percentage >= 50 ? '#7e57c2' : '#9575cd',
                        },
                      }} 
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ backgroundColor: '#d1c4e9', borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', marginBottom: 2 }}>
                EV Usage by City in Washington
              </Typography>
              <MapContainer center={[47.6062, -122.3321]} zoom={7} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapData.map((item, index) => (
                  <Marker key={index} position={[item.lat, item.lng]} icon={L.icon({ iconUrl: 'marker-icon.png' })}>
                    <Popup>
                      {item.city}: {item.location}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <Typography variant="h6" sx={{ fontSize: 14,  color: 'red', marginTop: 4 }}>
                * Red Lines show the zones and zoom to see the count per zone
              </Typography>
            </CardContent>
          </Card>
        </Grid>
</Grid>
    </Box>
  );
};

export default Overview;
