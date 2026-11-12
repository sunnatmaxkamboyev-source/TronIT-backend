import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`
=================================
      TRONIT BACKEND
=================================
  Status: Running
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || "development"}
  URL: http://localhost:${PORT}
=================================
      `);
    });
  } catch (error) {
    console.error("Serverni ishga tushirishda xatolik:", error);
    process.exit(1);
  }
};

startServer();
