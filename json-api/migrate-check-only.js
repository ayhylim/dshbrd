// json-api/migrate-check-only.js
// ⚠️ SAFE: Hanya CHECK data, TIDAK DELETE

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./db/connect");
const Product = require("./models/productList");

const checkDatabase = async () => {
    try {
        console.log("🔍 SCANNING DATABASE (CHECK ONLY - NO DELETE)\n");
        await connectDB(process.env.MONGO_URI);

        // Fetch ALL products
        const allProducts = await Product.find({});

        console.log(`📊 Total Products in Database: ${allProducts.length}\n`);

        // Kategorisasi products
        const categories = {
            validNumber: [],
            invalidString: [],
            invalidNull: [],
            invalidUndefined: []
        };

        allProducts.forEach(p => {
            if (typeof p.id === "number") {
                categories.validNumber.push(p);
            } else if (typeof p.id === "string") {
                categories.invalidString.push(p);
            } else if (p.id === null) {
                categories.invalidNull.push(p);
            } else if (p.id === undefined) {
                categories.invalidUndefined.push(p);
            }
        });

        // Report
        console.log("✅ VALID (ID is Number):");
        console.log(`   Count: ${categories.validNumber.length}`);
        if (categories.validNumber.length > 0 && categories.validNumber.length <= 10) {
            categories.validNumber.forEach(p => {
                console.log(`   - ID: ${p.id} | Name: ${p.productName}`);
            });
        } else if (categories.validNumber.length > 10) {
            console.log(`   (Showing first 5 of ${categories.validNumber.length})`);
            categories.validNumber.slice(0, 5).forEach(p => {
                console.log(`   - ID: ${p.id} | Name: ${p.productName}`);
            });
        }

        console.log("\n❌ INVALID (ID is String):");
        console.log(`   Count: ${categories.invalidString.length}`);
        if (categories.invalidString.length > 0 && categories.invalidString.length <= 10) {
            categories.invalidString.forEach(p => {
                console.log(`   - ID: "${p.id}" | Name: ${p.productName}`);
            });
        } else if (categories.invalidString.length > 10) {
            console.log(`   (Showing first 5 of ${categories.invalidString.length})`);
            categories.invalidString.slice(0, 5).forEach(p => {
                console.log(`   - ID: "${p.id}" | Name: ${p.productName}`);
            });
        }

        console.log("\n❌ INVALID (ID is Null):");
        console.log(`   Count: ${categories.invalidNull.length}`);

        console.log("\n❌ INVALID (ID is Undefined):");
        console.log(`   Count: ${categories.invalidUndefined.length}`);

        // Summary
        console.log("\n" + "=".repeat(60));
        console.log("📋 SUMMARY:");
        console.log("=".repeat(60));
        console.log(`Total Valid (Number):   ${categories.validNumber.length}`);
        console.log(
            `Total Invalid:          ${
                categories.invalidString.length + categories.invalidNull.length + categories.invalidUndefined.length
            }`
        );
        console.log(`  - String IDs:         ${categories.invalidString.length}`);
        console.log(`  - Null IDs:           ${categories.invalidNull.length}`);
        console.log(`  - Undefined IDs:      ${categories.invalidUndefined.length}`);

        console.log("\n" + "=".repeat(60));
        console.log("⚠️  WARNING:");
        console.log("=".repeat(60));

        if (
            categories.invalidString.length > 0 ||
            categories.invalidNull.length > 0 ||
            categories.invalidUndefined.length > 0
        ) {
            console.log(
                `\n🚨 IF YOU RUN migrate-ids.js, ${
                    categories.invalidString.length + categories.invalidNull.length + categories.invalidUndefined.length
                } PRODUCT(S) WILL BE DELETED!\n`
            );
            console.log("Options:");
            console.log("  1. Keep old data: DON'T run migrate-ids.js");
            console.log("  2. Delete old data: Run migrate-ids.js");
            console.log("  3. Backup & restore: Backup data lalu restore after migration\n");
        } else {
            console.log("\n✅ Database is CLEAN! All products have valid Number IDs.\n");
            console.log("Safe to run migrate-ids.js if needed.\n");
        }

        console.log("=".repeat(60));
        process.exit(0);
    } catch (err) {
        console.error("❌ Check failed:", err);
        process.exit(1);
    }
};

checkDatabase();
