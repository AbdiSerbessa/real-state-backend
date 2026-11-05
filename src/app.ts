import express from "express";
import cors from "cors";
import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/properties", propertyRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Real Estate API" });
});

export default app;