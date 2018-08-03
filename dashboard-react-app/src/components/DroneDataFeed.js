import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import SockJS from 'sockjs-client';

const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    progress: {
        ...theme.mixins.gutters(),
        margin: theme.spacing.unit * 20,
        justify: 'center',
    },
    paper: {
        ...theme.mixins.gutters(),
        marginTop: theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
        width: '100%',
    },
});

const timeThreshold = 10000;

class DroneDataFeed extends Component {
    state = {
        drones: [],
        spacing: '20',
    };
    
    constructor(props) {
        super(props);
        this.state.url = window.location.protocol + '//' + window.location.hostname + ':8081/websockets';
        this.state.sockjs = new SockJS(this.state.url);

        this.state.sockjs.onmessage = (msg) => {
            this.setState({drones: JSON.parse(msg.data.toString())});
        };
        this.state.sockjs.onclose = () => {
            this.setState({drones: []});
        };
    }
    onMessage = (msg) => {
        console.log(msg);
    }
    render() {
        const { classes } = this.props;
        const { spacing } = this.state;

        return (
            <div>
                {this.state.drones.length === 0 ? (
                    <Grid container className={classes.root} justify='center' spacing={Number(spacing)}>
                        <Grid item>
                            <CircularProgress className={classes.progress} />
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container className={classes.root} justify='flex-start' spacing={Number(spacing)}>
                        <Grid item>
                            <Paper className={classes.paper}>
                                <Table className={classes.table}>
                                    <TableHead >
                                        <TableRow >
                                            <TableCell>Drone ID</TableCell>
                                            <TableCell numeric>Speed</TableCell>
                                            <TableCell numeric>Latitude</TableCell>
                                            <TableCell numeric>Longitude</TableCell>
                                            <TableCell numeric>State</TableCell>
                                            <TableCell>Last Movement</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody >
                                    {this.state.drones.map(drone => {
                                        return (
                                        <TableRow key={drone.id} style={{
                                                backgroundColor: drone.time - drone.lastMovement > timeThreshold ? '#ffccbc':'',
                                                }}>
                                            <TableCell component="th" scope="row">
                                                {drone.id.substring(0,16)}
                                            </TableCell>
                                            <TableCell numeric>{drone.speed}</TableCell>
                                            <TableCell numeric>{drone.latitude}</TableCell>
                                            <TableCell numeric>{drone.longitude}</TableCell>
                                            <TableCell numeric>{drone.time - drone.lastMovement > timeThreshold ? 'resting':'moving'}</TableCell>
                                            <TableCell numeric>{Math.floor((drone.time - drone.lastMovement) / 1000)} sec ago</TableCell>
                                        </TableRow>
                                        );
                                    })}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </div>
        );
    }
}

DroneDataFeed.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DroneDataFeed);