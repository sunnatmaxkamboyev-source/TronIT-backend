import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
=================================
       TRONIT BACKEND
=================================
  Status: Running
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV}
  URL: http://localhost:${PORT}
=================================
      `);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();
