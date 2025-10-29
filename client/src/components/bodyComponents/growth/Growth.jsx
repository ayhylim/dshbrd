import {useContext, useEffect} from "react"; 
import {Box, Grid} from "@mui/material";
import RevenueCard from "../revenue/RevenueCard";
import ProductsGrowthCharts from "./ProductsGrowthCharts";
import CustomersGrowthCharts from "./CustomersGrowthCharts";
import SalesGrowthCharts from "./SalesGrowthCharts";
import ProductContext from "../inventory/context/ProductContext";

export default function Growth() {
    // 💡 Ambil fungsi dan data dari ProductContext
    const {fetchDataAPI, fetchDataOrderAPI, getRevenueCardData, product, order} = useContext(ProductContext);

    // Ambil data kartu dari fungsi di context
    const revenuCards = getRevenueCardData();

    // 💡 Ambil data saat komponen pertama kali dimuat
    useEffect(() => {
        // Ambil data produk dan order jika belum ada
        if (product.length === 0) fetchDataAPI();
        if (order.length === 0) fetchDataOrderAPI();
    }, [product.length, order.length, fetchDataAPI, fetchDataOrderAPI]);

    return (
        <Box sx={{p: 3, mx: 3}}>
            <Grid container sx={{mx: 4}}>
                {revenuCards.map(
                    (
                        card,
                        index // 💡 Gunakan index sebagai key
                    ) => (
                        <Grid item md={3} key={index}>
                            <Box m={4}>
                                <RevenueCard card={card} />
                            </Box>
                        </Grid>
                    )
                )}
            </Grid>
            <Grid container sx={{mx: 4}}>
                <Grid item md={6}>
                    <SalesGrowthCharts />
                </Grid>
                <Grid item md={6}>
                    <ProductsGrowthCharts />
                </Grid>
            </Grid>
            <Grid container sx={{mx: 4}}>
                <Grid item md={6}>
                    <CustomersGrowthCharts />
                </Grid>
            </Grid>
        </Box>
    );
}
