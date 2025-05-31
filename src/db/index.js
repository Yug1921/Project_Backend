import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async function name() {
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOSt :${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB error occured",error);
        process.exit(1)
    }
}

export default connectDB