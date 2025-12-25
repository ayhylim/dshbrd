import Inter from "../public/static/fonts/Inter.ttf";
import {ThemeProvider, CssBaseline, createTheme} from "@mui/material";
import RootComponent from "./components/RootComponent";
import "../app.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "./responsive.css";
import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate} from "react-router-dom";
import Home from "./components/bodyComponents/home/Home";
import Inventory from "./components/bodyComponents/inventory/Inventory";
import Customer from "./components/bodyComponents/customer/Customer";
import Revenue from "./components/bodyComponents/revenue/Revenue";
import Growth from "./components/bodyComponents/growth/Growth";
import Report from "./components/bodyComponents/report/Report";
import ProductHistory from "./components/bodyComponents/productHistory/ProductHistory";
import Setting from "./components/bodyComponents/Settings/Setting";
import Order from "./components/bodyComponents/order/Order";
import {Dashboard, HomeLayout, Landing, Login, Logout, Register} from "./pages";
import {ToastContainer} from "react-toastify";
import {getRoleFromToken} from "./utils/getRoleFromToken";
// import OrderModal from "./components/bodyComponents/order/OrderModal";
// import OrderDetails from "./components/bodyComponents/order/OrderDetails";

// Protected Route Component
const ProtectedRoute = ({element, allowedRoles}) => {
    const userRole = getRoleFromToken();

    if (!userRole) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return (
            <div style={{padding: "50px", textAlign: "center"}}>
                <h2>Access Denied</h2>
                <p>{"You don't have permission to access this page"}</p>
            </div>
        );
    }

    return element;
};

function App() {
    const theme = createTheme({
        spacing: 4,
        palette: {
            mode: "light"

            // primary: {
            //   main: "#573BFE",
            // },
            // text: {
            //   primary: "#202635",
            //   secondary: "#A0AEC0",
            // },
            // secondary: {
            //   main: "#01C0F6",
            // },
            // error: {
            //   main: "#E03137",
            // },
        },

        typography: {
            fontFamily: "Inter"
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: `
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
            src: local('Raleway'), local('Raleway-Regular'), url(${Inter}) format('woff2');
            unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
          }
        `
            }
        }
        //here we customize our typographi and in the variant prop we can use out myVar value
    });
    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                {/* PUBLIC ROUTES */}
                <Route element={<HomeLayout />}>
                    <Route index element={<Landing />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="logout" element={<Logout />} />
                </Route>

                {/* ADMIN DASHBOARD ROUTES - PROTECTED */}
                <Route
                    element={
                        <ProtectedRoute
                            element={<RootComponent />}
                            allowedRoles={["purchasing", "warehouse", "marketing", "developer"]}
                        />
                    }
                >
                    {/* HOME - ALL ROLES */}
                    <Route
                        path="home"
                        element={
                            <ProtectedRoute
                                element={<Home />}
                                allowedRoles={["purchasing", "warehouse", "marketing", "developer"]}
                            />
                        }
                    />

                    {/* INVENTORY - WAREHOUSE & PURCHASING */}
                    <Route
                        path="inventory"
                        element={
                            <ProtectedRoute
                                element={<Inventory />}
                                allowedRoles={["warehouse", "purchasing", "marketing", "developer"]}
                            />
                        }
                    />

                    {/* ORDERS - ALL ROLES */}
                    <Route
                        path="orders"
                        element={
                            <ProtectedRoute
                                element={<Order />}
                                allowedRoles={["warehouse", "marketing", "developer"]}
                            />
                        }
                    />

                    {/* CUSTOMERS - MARKETING & PURCHASING */}
                    <Route
                        path="customers"
                        element={
                            <ProtectedRoute
                                element={<Customer />}
                                allowedRoles={["marketing", "warehouse", "developer"]}
                            />
                        }
                    />

                    {/* GROWTH - ALL ROLES */}
                    <Route
                        path="growth"
                        element={
                            <ProtectedRoute
                                element={<Growth />}
                                allowedRoles={["purchasing", "warehouse", "marketing", "developer"]}
                            />
                        }
                    />

                    {/* PRODUCT HISTORY  */}
                    <Route
                        path="productHistory"
                        element={
                            <ProtectedRoute
                                element={<ProductHistory />}
                                allowedRoles={["purchasing", "warehouse", "marketing", "developer"]}
                            />
                        }
                    />

                    {/* SETTINGS - ADMIN ONLY (update sesuai kebutuhan) */}
                    <Route
                        path="settings"
                        element={
                            <ProtectedRoute
                                element={<Setting />}
                                allowedRoles={["purchasing", "warehouse", "marketing", "developer"]}
                            />
                        }
                    />
                </Route>
            </>
        )
    );

    return (
        <ThemeProvider theme={theme}>
            <RouterProvider router={router} />
            <CssBaseline />
            <ToastContainer position="top-center" />
        </ThemeProvider>
    );
}

export default App;
