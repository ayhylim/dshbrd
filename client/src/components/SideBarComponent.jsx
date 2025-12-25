import React, {useState, useMemo} from "react";
import "../../public/styles/links.css";
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    IconButton,
    Box,
    Snackbar,
    Alert,
    Button
} from "@mui/material";
import {
    HomeOutlined,
    Inventory2Outlined,
    SettingsOutlined,
    DescriptionOutlined,
    MonetizationOnOutlined,
    CardTravelOutlined,
    TrendingUpOutlined,
    PeopleAltOutlined,
    HistoryOutlined
} from "@mui/icons-material";
import {useLocation, useNavigate} from "react-router-dom";
import {getRoleFromToken} from "../utils/getRoleFromToken";

export default function SideBarComponent() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPage = location.pathname;
    const userRole = getRoleFromToken();

    const [selected, setSelected] = useState(0);

    // DEFINE ALL MENU ITEMS WITH THEIR ROLES
    const allMenuItems = [
        {
            title: "Home",
            component: <HomeOutlined fontSize="medium" color="primary" />,
            path: "home",
            roles: ["purchasing", "warehouse", "marketing"]
        },
        {
            title: "Inventory",
            component: <Inventory2Outlined fontSize="medium" color="primary" />,
            path: "inventory",
            roles: ["warehouse", "purchasing", "marketing", "developer"]
        },
        {
            title: "Orders",
            component: <CardTravelOutlined fontSize="medium" color="primary" />,
            path: "orders",
            roles: ["warehouse", "marketing", "developer"]
        },
        {
            title: "Customers",
            component: <PeopleAltOutlined fontSize="medium" color="primary" />,
            path: "customers",
            roles: ["warehouse", "marketing", "developer"]
        },
        {
            title: "Growth",
            component: <TrendingUpOutlined fontSize="medium" color="primary" />,
            path: "growth",
            roles: ["purchasing", "warehouse", "marketing", "developer"]
        },
        {
            title: "Product History",
            component: <HistoryOutlined fontSize="medium" color="primary" />,
            path: "productHistory",
            roles: ["warehouse", "purchasing", "developer"]
        },
        {
            title: "Settings",
            component: <SettingsOutlined fontSize="medium" color="primary" />,
            path: "settings",
            roles: ["purchasing", "marketing", "warehouse", "developer"]
        }
    ];

    // FILTER MENU BASED ON USER ROLE
    const visibleMenus = useMemo(() => {
        if (!userRole) return [];
        return allMenuItems.filter(item => item.roles.includes(userRole));
    }, [userRole]);

    const handleNavigate = (index, path) => {
        setSelected(index);
        navigate(path);
    };
    return (
        <>
            <List>
                {visibleMenus.map((comp, index) => (
                    <ListItem disablePadding dense={true} key={index}>
                        <Box width="100%">
                            <ListItemButton
                                onClick={() => handleNavigate(index, comp.path)}
                                selected={index === selected && currentPage === "/" + comp.path}
                                sx={{
                                    mb: 3,
                                    borderLeft: 0,
                                    borderColor: "primary.main",
                                    ml: 1
                                }}
                            >
                                <ListItemIcon>
                                    <IconButton>{comp.component}</IconButton>
                                </ListItemIcon>
                                <ListItemText
                                    primary={comp.title}
                                    primaryTypographyProps={{
                                        fontSize: "medium",
                                        fontWeight: selected === index ? "bold" : "",
                                        color: selected === index ? "primary.main" : "inherit"
                                    }}
                                />
                            </ListItemButton>
                        </Box>
                    </ListItem>
                ))}
            </List>

            {/* DEBUG: Show Current Role (remove in production) */}
            <div style={{padding: "10px", marginTop: "20px", textAlign: "center", borderTop: "1px solid #ccc"}}>
                <small>
                    Role: <strong>{userRole?.toUpperCase() || "NONE"}</strong>
                </small>
            </div>
        </>
    );
}
