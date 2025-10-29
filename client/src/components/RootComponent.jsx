import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import axios from "axios";
import NavBarComponent from "./NavBarComponent";
import {Box, Grid} from "@mui/material";
import SideBarComponent from "./SideBarComponent";
import {Outlet} from "react-router-dom";

export default function RootComponent() {
    // const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");
    // const [data, setData] = useState({});
    // const navigate = useNavigate();

    // const fetchLuckyNumber = async () => {
    //     let axiosConfig = {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     };

    //     try {
    //         const response = await axios.get("https://tyotechinven.web.app/home", axiosConfig);
    //         setData({msg: response.data.msg, luckyNumber: response.data.secret});
    //         localStorage.removeItem("auth");
    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // };

    // useEffect(() => {
    //     fetchLuckyNumber();
    //     if (token === "") {
    //         navigate("/login");
    //         toast.warn("Please login first to access dashboard");
    //     }
    // }, [token]);
    return (
        <>
            <NavBarComponent />
            <Box
                sx={
                    {
                        // bgcolor: "#DEE3E9",
                        // height: 899,
                    }
                }
            >
                <Grid container spacing={0}>
                    <Grid item md={2} sm={0}>
                        <SideBarComponent />
                    </Grid>
                    <Grid item md={10}>
                        <Outlet />
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
