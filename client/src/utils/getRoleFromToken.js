import {jwtDecode} from "jwt-decode";

export const getRoleFromToken = () => {
    try {
        const token = localStorage.getItem("auth"); // Sesuai Login.jsx
        // console.log("🔍 Token from storage:", token);

        if (!token) {
            console.log("❌ No token found");
            return null;
        }

        const decoded = jwtDecode(token);
        // console.log("📦 Decoded token:", decoded); // DEBUG
        // console.log("👤 Role from token:", decoded.role); // DEBUG
        return decoded.role; // Backend harus return role di JWT
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const getUserFromToken = () => {
    try {
        const token = localStorage.getItem("auth");
        if (!token) return null;

        const decoded = jwtDecode(token);
        // console.log("📦 Full decoded user:", decoded);

        return {
            id: decoded.id,
            name: decoded.name,
            role: decoded.role
        };
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};
