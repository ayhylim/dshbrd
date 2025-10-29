import {Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography} from "@mui/material";

import {useContext} from "react";
import ProductContext from "./context/ProductContext";

export default function Overview() {
    const {product} = useContext(ProductContext);
    let total = 0;
    const totalProduct = product.map(stocks => {
        const {stock} = stocks;
        total += stock;
    });
    return (
        <Box>
            <TableContainer>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total Product</TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {product.length}
                                </Typography>
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell>Total Stock</TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {total}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
