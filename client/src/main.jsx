import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {Provider} from "./components/bodyComponents/inventory/context/ProductContext.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider>
        <App />
    </Provider>
);
