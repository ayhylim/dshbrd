// #OrderList.jsx (REVISI)

// Mewakili Inventory.jsx
import {Box, Button, Modal, Typography, Grid} from "@mui/material";
import {Component} from "react";
import AddOrderModal from "./AddOrderModal";
import Orders from "./Orders";
import OrderDetails from "./OrderDetails";
import EditOrderModal from "./EditOrderModal"; // 💡 Import komponen Edit Order Modal

export default class OrderList extends Component {
    
    // Handler untuk Detail (dipicu oleh tombol di kolom Actions)
    handleOrderDetail = order => {
        console.log("the order is : ", order);
        this.setState({order: order, open: true}); // 'open' untuk Detail
    };
    
    // Handler untuk Edit (dipicu oleh klik tombol Edit di Orders.jsx)
    // Akan menerima ID order dari Orders.jsx
    handleEditOrder = (orderToEdit) => {
        if (orderToEdit.status === "Accepted") {
            alert("Order yang sudah di-Accept tidak dapat diedit.");
            return;
        }
        this.setState({
            orderToEdit: orderToEdit, 
            openEditModal: true // Buka modal Edit
        });
    };
    
    // Menutup Modal Detail
    handleClose = () => {
        this.setState({order: {}, open: false});
    };
    
    // Menutup Modal Add
    handleModalOpen = () => {
        this.setState({openModal: true});
    };
    handleModalClose = () => {
        this.setState({openModal: false});
    };
    
    // 💡 Handler untuk menutup Modal Edit
    handleEditModalClose = () => {
        this.setState({orderToEdit: null, openEditModal: false});
    };

    constructor(props) {
        super(props);
        this.state = {
            order: {}, // Data untuk Detail Modal
            open: false, // Status Modal Detail
            openModal: false, // Status Modal Add
            
            // 💡 STATE BARU untuk Edit Modal
            orderToEdit: null, // Data order yang akan diedit
            openEditModal: false // Status Modal Edit
        };
    }

    render() {
        return (
            <>
                <Box
                    sx={{
                        margin: 3,
                        bgcolor: "white",
                        borderRadius: 2,
                        padding: 3,
                        height: "100%"
                    }}
                >
                    {/* 💡 Pass handleEditOrder sebagai prop onEdit */}
                    <Orders 
                        onOrderDetailClick={this.handleOrderDetail} 
                        onEdit={this.handleEditOrder} // 💡 BARU: Pass handler ke Orders
                    />
                    
                    {/* MODAL DETAIL */}
                    <Modal open={this.state.open} onClose={this.handleClose}>
                        <Box>
                            <OrderDetails order={this.state.order} onClose={this.handleClose} />
                        </Box>
                    </Modal>
                    
                    {/* MODAL TAMBAH ORDER */}
                    <Modal open={this.state.openModal} onClose={this.handleModalClose}>
                        <Box>
                            {/* Tambahkan onClose jika AddOrderModal menggunakannya */}
                            <AddOrderModal onClose={this.handleModalClose} /> 
                        </Box>
                    </Modal>
                    
                    {/* 💡 MODAL EDIT ORDER (BARU) */}
                    <Modal open={this.state.openEditModal} onClose={this.handleEditModalClose}>
                        <Box>
                            {/* Pastikan Anda sudah membuat EditOrderModal.jsx sesuai instruksi sebelumnya */}
                            <EditOrderModal 
                                orderToEdit={this.state.orderToEdit} 
                                onClose={this.handleEditModalClose} 
                            />
                        </Box>
                    </Modal>
                </Box>
                
                <Button variant="contained" sx={{bgcolor: "#504099"}} onClick={this.handleModalOpen}>
                    Add Order
                </Button>
            </>
        );
    }
}