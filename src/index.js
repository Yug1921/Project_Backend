import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

// Load environment variables FIRST
dotenv.config({
  path: "./.env", // Fixed: removed space and added dot
})

// Connect to database and start server
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})




/*
const app = express;
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_DB_URI}${DB_NAME}`);

    app.on('error', (error) => {
      console.log('Erorr occured in express', error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Error', error);
    throw err;
  }
})();
*/