import {Avatar, Typography} from "@mui/material";

export default function Product({productName}) {
    return (
        <>
            <Typography sx={{mx: 3}} variant="subtitle2">
                {productName}
            </Typography>
        </>
    );
}
