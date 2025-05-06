const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB-tilkobling
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB koblet til");
});

// Eksempel på Firma Schema (Mongoose)
const CompanySchema = new mongoose.Schema({
  navn: String,
  jobbvareuttak: String,
}, { timestamps: true });

const Company = mongoose.model("Company", CompanySchema);

// Opprett nytt firma
app.post("/api/company", async (req, res) => {
  const { navn, jobbvareuttak } = req.body;
  const company = await Company.create({ navn, jobbvareuttak });
  res.status(201).json(company);
});

// Hent alle firmaer
app.get("/api/company", async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

// Start serveren
app.listen(4000, () => {
  console.log("Backend kjører på port 4000");
});
