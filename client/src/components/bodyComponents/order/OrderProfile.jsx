import {Typography} from "@mui/material";

export default function OrderProfile({custName}) {
    return (
        <>
            <Typography sx={{mx: 3}} variant="subtitle2">
                {custName}
            </Typography>
        </>
    );
}

// Mewakili Product.jsx