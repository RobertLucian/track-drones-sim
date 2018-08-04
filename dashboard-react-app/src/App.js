import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import './components/DroneDataFeed';
import './App.css';
import DroneDataFeed from './components/DroneDataFeed';

class App extends Component {
  render() {
    return (
      <div className='root'>
        <AppBar position='static' color='primary'>
          <Toolbar>
            <Typography variant='title' color='inherit'>
              Drone Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <DroneDataFeed>
        </DroneDataFeed>
      </div>
    );
  }
}

export default App;
