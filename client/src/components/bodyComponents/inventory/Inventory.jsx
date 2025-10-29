import {Grid, Box, Typography, Button, Modal} from "@mui/material";
import {Component} from "react";
import Products from "./Products";
import Overview from "./Overview";
import AddProduct from "./AddProduct";

export default class Inventory extends Component {
    handleOpen = () => {
        this.setState({open: true});
    };
    handleClose = () => {
        this.setState({open: false});
    };
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        // const {selectionModels} = this.state;
        return (
            <Box>
                <Grid container sx={{mx: 3, p: 3}}>
                    <Grid item md={9}>
                        <Box
                            sx={{
                                margin: 3,
                                bgcolor: "white",
                                borderRadius: 2,
                                padding: 3,
                                height: "100%"
                            }}
                        >
                            <Typography variant="h5" sx={{m: 3, fontWeight: "bold"}}>
                                Inventory
                            </Typography>
                            <Box></Box>
                            <Products />
                            <Button variant="contained" sx={{bgcolor: "#504099"}} onClick={this.handleOpen}>
                                Add Product
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item md={3}>
                        <Box
                            sx={{
                                margin: 3,
                                bgcolor: "white",
                                borderRadius: 2,
                                padding: 3,
                                height: "100%"
                            }}
                        >
                            <Typography variant="h5" sx={{m: 3, fontWeight: "bold"}}>
                                Overview
                            </Typography>
                            <Overview />
                            <Modal open={this.state.open} onClose={this.handleClose}>
                                {/*  */}
                                <Box>
                                    <AddProduct />
                                </Box>
                            </Modal>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}
