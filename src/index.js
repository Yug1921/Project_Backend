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
    // Use the imported app, don't create a new one
    const PORT = process.env.PORT || 8000

    app.listen(PORT, () => {
      console.log(`⚙️  Server is running at port: ${PORT}`)
    })

    // Add error handling for the app
    app.on("error", (error) => {
      console.log("ERROR: ", error)
      throw error
    })
  })
  .catch((error) => {
    console.log("MONGO DB connection failed !!! ", error)
    process.exit(1) // Exit the process if DB connection fails
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