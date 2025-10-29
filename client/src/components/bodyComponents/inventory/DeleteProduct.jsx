import DeleteIcon from "@mui/icons-material/Delete";
const myStyles = {
    color: "#eb4034",
    "&:hover": {
        color: "#eb1d0e",
        cursor: "pointer"
    }
};

const DeleteProduct = ({handleDelete}) => {
    return (
        <button onClick={handleDelete} style={{zIndex: 10}}>
            <DeleteIcon sx={myStyles}></DeleteIcon>
        </button>
    );
};

export default DeleteProduct;
