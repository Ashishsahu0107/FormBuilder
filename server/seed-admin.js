const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

async function seed() {
  await mongoose.connect(
    "mongodb+srv://Ashishsahu:Ashishsahu@formbuilder.t8s04.mongodb.net/?retryWrites=true&w=majority&appName=FormBuilder",
  );
  console.log("Connected to DB");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = {
    _id: uuidv4(),
    name: "Super Admin",
    email: "admin@formbuilder.com",
    password: hashedPassword,
    role: "ADMIN",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = mongoose.connection.db;
  await db
    .collection("users")
    .updateOne({ email: user.email }, { $set: user }, { upsert: true });

  console.log("Admin user seeded: admin@formbuilder.com / admin123");
  process.exit(0);
}

seed();
