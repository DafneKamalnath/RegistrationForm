require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // Use Google and Cloudflare DNS servers

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/registration_db";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = new Set([FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"]);

const allowedBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const allowedGenders = ["Male", "Female", "Other"];

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    emailNormalized: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, match: /^\d{10}$/ },
    address: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, match: /^\d{6}$/ },
    bloodGroup: { type: String, required: true, enum: allowedBloodGroups },
    gender: { type: String, required: true, enum: allowedGenders },
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_request, response) => {
  response.redirect(FRONTEND_URL);
});

app.get("/api/health", async (_request, response) => {
  try {
    await mongoose.connection.db.command({ ping: 1 });
    response.json({ status: "ok", database: "connected" });
  } catch {
    response.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.post("/api/registrations", async (request, response) => {
  const data = request.body;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    response.status(400).json({ message: "Request body must be a JSON object." });
    return;
  }

  try {
    const registration = await Registration.create({
      ...data,
      emailNormalized:
        typeof data.email === "string"
          ? data.email.trim().toLowerCase()
          : data.email,
    });

    response.status(201).json({
      message: "Registration completed successfully!",
      registration: {
        id: registration._id.toString(),
        email: registration.email,
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      response.status(409).json({
        message: "A registration with this email already exists.",
      });
      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.fromEntries(
        Object.entries(error.errors).map(([field, fieldError]) => [
          field,
          fieldError.message,
        ])
      );
      response.status(400).json({
        message: "Please correct the highlighted fields.",
        errors,
      });
      return;
    }

    response.status(500).json({ message: "Unable to save registration." });
  }
});

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found." });
});

async function startServer() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  app.listen(PORT, () => {
    console.log(`Registration server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to connect to MongoDB:", error.message);
  process.exitCode = 1;
});

async function shutdown() {
  await mongoose.disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
