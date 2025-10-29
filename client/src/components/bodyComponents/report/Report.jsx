import React, {useState} from "react";

function Report() {
    const [products, setProducts] = useState([]);

    // const options = [
    //     {value: "chocolate", label: "Chocolate#@"},
    //     {value: "strawberry", label: "Strawberry%"},
    //     {value: "vanilla", label: "Vanilla23"},
    //     {value: "mint", label: "Mint"}
    // ];

    const handleAddProduct = () => {
        setProducts(prevProducts => [...prevProducts, {id: Date.now(), name: "", quantity: 0}]);
    };

    const handleRemoveProduct = id => {
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    };

    const handleChange = (id, event) => {
        const {name, value} = event.target;
        setProducts(prevProducts =>
            prevProducts.map(product => (product.id === id ? {...product, [name]: value} : product))
        );
    };

    return (
        <div>
            <h2>Formulir Pembuatan Order</h2>

            {products.map(product => (
                <div key={product.id} style={{display: "flex", gap: "10px", marginBottom: "10px"}}>
                    {/* Contoh Dropdown dan Input Quantity */}
                    <select
                        name="name"
                        value={product.name}
                        onChange={e => handleChange(product.id, e)}
                        style={{padding: "8px"}}
                    >
                        <option value="">Pilih Produk</option>
                        <option value="Product A">Product A</option>
                        <option value="Product B">Product B</option>
                    </select>

                    <input
                        type="number"
                        name="quantity"
                        placeholder="Kuantitas"
                        value={product.quantity}
                        onChange={e => handleChange(product.id, e)}
                        style={{padding: "8px", width: "100px"}}
                    />

                    {/* Tombol Hapus */}
                    <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        style={{background: "red", color: "white"}}
                    >
                        X
                    </button>
                </div>
            ))}

            {/* 4. Tombol untuk menambah komponen */}
            <button
                type="button"
                onClick={handleAddProduct}
                style={{background: "green", color: "white", padding: "10px 15px", marginTop: "15px"}}
            >
                ➕ Tambah Produk Lain
            </button>
        </div>
    );
}

export default Report;
