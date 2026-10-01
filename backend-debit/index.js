const express = require("express");
require("dotenv").config({ quiet: true });
const { getpool } = require("./utils/db");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend SPA
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//  import Routes
const authRoutes = require("./route/AuthRoute");
const walletRoutes = require("./route/WalletRoute");

//Routes//
app.use("/api", authRoutes);
app.use("/api", walletRoutes);

getpool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`masuk API Running at PORT: ${PORT}!`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
