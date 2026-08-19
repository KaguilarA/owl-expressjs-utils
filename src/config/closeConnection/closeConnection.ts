import mongoose from "mongoose";

export default async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB desconectado correctamente.");
    process.exit(0);
  } catch (err) {
    console.error("Error al cerrar MongoDB:", err);
    process.exit(1);
  }
}