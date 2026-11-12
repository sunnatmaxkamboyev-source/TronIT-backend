import mongoose from "mongoose";


const connectDB = async () => {
    try{
        const conection = await mongoose.connect(process.env.MONGODB_URI)

        console.log(`Mongo Connected: ${connection.connection.host}`)
    } catch (error){
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export default connectDB;