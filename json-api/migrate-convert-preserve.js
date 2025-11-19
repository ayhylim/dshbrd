// json-api/migrate-convert-preserve.js
// ✅ SAFE: Convert String ID ke Number, TIDAK DELETE

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./db/connect");
const Product = require("./models/productList");

const convertIds = async () => {
    try {
        console.log("🔄 Starting ID conversion (PRESERVE DATA)\n");
        await connectDB(process.env.MONGO_URI);

        // 1️⃣ Fetch semua products
        const allProducts = await Product.find({});
        console.log(`📊 Total products: ${allProducts.length}\n`);

        // 2️⃣ Kategorisasi
        const toConvert = [];
        const alreadyValid = [];

        allProducts.forEach(p => {
            if (typeof p.id === "number") {
                alreadyValid.push(p);
            } else if (typeof p.id === "string") {
                // Coba convert string ke number
                const numId = parseInt(p.id, 10);
                if (!isNaN(numId)) {
                    toConvert.push({original: p, newId: numId});
                }
            }
        });

        console.log(`✅ Already Valid (Number ID): ${alreadyValid.length}`);
        console.log(`🔄 Need Conversion (String ID): ${toConvert.length}\n`);

        // 3️⃣ Show preview
        if (toConvert.length > 0) {
            console.log("Preview of conversion:");
            toConvert.slice(0, 5).forEach(item => {
                console.log(`   "${item.original.id}" → ${item.newId} (${item.original.productName})`);
            });
            if (toConvert.length > 5) {
                console.log(`   ... and ${toConvert.length - 5} more`);
            }
        }

        console.log("\n" + "=".repeat(60));
        console.log("⚠️  IMPORTANT: This will convert String IDs to Number IDs");
        console.log('   Example: "1" → 1, "506c" → NaN (will be skipped)');
        console.log("=".repeat(60) + "\n");

        // 4️⃣ Perform conversion
        let converted = 0;
        let skipped = 0;

        for (const item of toConvert) {
            try {
                await Product.updateOne({_id: item.original._id}, {$set: {id: item.newId}});
                converted++;
            } catch (err) {
                console.error(`❌ Failed to convert ${item.original.id}:`, err.message);
                skipped++;
            }
        }

        // 5️⃣ Report final
        const finalProducts = await Product.find({});
        const finalValid = finalProducts.filter(p => typeof p.id === "number");
        const finalInvalid = finalProducts.filter(p => typeof p.id !== "number");

        console.log("\n" + "=".repeat(60));
        console.log("✅ CONVERSION COMPLETE");
        console.log("=".repeat(60));
        console.log(`Total Converted: ${converted}`);
        console.log(`Total Skipped: ${skipped}`);
        console.log(`\nFinal Status:`);
        console.log(`  Valid (Number ID): ${finalValid.length}`);
        console.log(`  Invalid: ${finalInvalid.length}`);

        if (finalValid.length > 0) {
            const maxId = Math.max(...finalValid.map(p => p.id));
            console.log(`\n📊 Next new product will get ID: ${maxId + 1}`);
        }

        console.log("\n✅ ✅ ✅ Conversion completed! ✅ ✅ ✅\n");
        process.exit(0);
    } catch (err) {
        console.error("❌ Conversion failed:", err);
        process.exit(1);
    }
};

convertIds();
