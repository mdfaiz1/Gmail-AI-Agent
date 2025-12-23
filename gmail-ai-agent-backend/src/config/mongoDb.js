import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}`
    );
    console.log(
      "Mongo DB Connection Successfull",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
