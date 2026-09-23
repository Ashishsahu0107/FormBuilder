import "dotenv/config";
import jwt from "jsonwebtoken";
import { config } from "@/config";

const start = async () => {
  const token = jwt.sign(
    { id: "aa25a39a-bf6a-4782-96e6-7acd0a370381", email: "ashishsahu01072005@gmail.com", role: "FORM_BUILDER", name: "Ashish Sahu" },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );

  try {
    const res = await fetch("http://localhost:5000/api/forms/273fa937-db4b-4ced-88f5-26fef0b7df26/submissions/analytics", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (error: any) {
    console.error("Failed:", error.message);
  }
};
start();