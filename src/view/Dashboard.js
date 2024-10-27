import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Overview from './Overview';
import backgroundImage from '../assets/innovation.jpg';
import EVDataTable from './ElectricVehicleData';

function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState('Dashboard');

  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);
  };

  const renderContent = () => {
    switch (activeComponent) {
      case 'Overview':
        return <Overview />;
      case 'EVAnalysis':
        return <EVDataTable />;
      default:
        return (
          <Box
            sx={{
              flex: 1, // Fill remaining height
              width: '100%',
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ mt: 4, color: 'white', paddingLeft: '2rem'}}>
              About Us
            </Typography>
            <Box sx={{ flex: 1, maxWidth: '40%', mt: 2 }}>
              <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'white', paddingLeft: '2rem'}}>
                An automatic toll system is a technology-driven solution designed to streamline toll collection on roads and highways without the need for manual intervention. By using sensors, RFID (Radio Frequency Identification) tags, cameras, or other tracking technologies, these systems identify vehicles as they pass through toll points and automatically deduct the toll fees from a pre-registered account. This not only reduces congestion and wait times at toll booths but also improves accuracy, reduces operational costs, and enhances the overall travel experience. Additionally, such systems contribute to efficient traffic management and environmental sustainability by minimizing fuel consumption associated with idling vehicles.
              </Typography>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx = {{ background : "#311b92" }} >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ mr: 'auto', fontWeight: 'bold' }}>
            Mapup.ai
          </Typography>

          <Box>
            <IconButton color="inherit" aria-label="notifications">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="profile">
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            <ListItem button onClick={() => setActiveComponent('Overview')}>
              <ListItemText primary="Overview" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => setActiveComponent('EVAnalysis')}>
              <ListItemText primary="Electric Vehicle Analysis" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Content Section */}
      {renderContent()}
    </Box>
  );
}

export default Dashboard;
