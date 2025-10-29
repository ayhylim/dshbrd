import {useEffect, useState} from "react";
import {Stack, TextField} from "@mui/material";
import Select from "react-select";
import DeleteProductOrderBtn from "./DeleteProductOrderBtn";
import {fetchOrderProduct} from "../../../api/api";

const options = [
    {value: "chocolate", label: "Chocolate#@"},
    {value: "strawberry", label: "Strawberry%"},
    {value: "vanilla", label: "Vanilla23"},
    {value: "mint", label: "Mint"}
];

function OrderProductDropdown() {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleChange = option => {
        setSelectedOption(option);
    };

    const fetchDataOrder = async () => {
        const res = await fetchOrderProduct();
        console.log(res);
    };

    useEffect(() => {
        fetchDataOrder();
    }, []);

    return (
        <>
            <div className="container-add-product" style={{display: "flex", justifyContent: "end"}}>
                <div className="btn-add-product">
                    <button className="btn btn-primary">
                        <span className="btn-txt">Add Product</span>
                    </button>
                </div>
            </div>
            <Stack direction="row" spacing={2}>
                <Select
                    options={options}
                    value={selectedOption}
                    onChange={handleChange}
                    isSearchable={true}
                    placeholder="Select Product"
                    // 👇 Set width to 65%
                    styles={{container: base => ({...base, width: "65%"})}}
                />
                <TextField
                    required
                    // Remove fullWidth since we're setting a specific width
                    id="stock"
                    name="stock"
                    label="Stock Quantity"
                    variant="outlined"
                    type="number"
                    onChange={handleChange}
                    inputProps={{inputMode: "numeric", pattern: "[0-9]*"}}
                    // 👇 Set width to 35%
                    sx={{width: "15%"}}
                />
                {/* {selectedOption && <p>You selected: {selectedOption.label}</p>} */}
                <DeleteProductOrderBtn></DeleteProductOrderBtn>
            </Stack>
        </>
    );
}

export default OrderProductDropdown;
