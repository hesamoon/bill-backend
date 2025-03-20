import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import {
  getUser,
  getBill,
  getBills,
  createBill,
  initializeDatabase,
} from "./database.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://hesamoon.ir", "http://94.182.14.8", "http://172.20.15.243"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

await initializeDatabase();

app.get("/", async (req, res) => {
  const bills = await getBills();
  res.send(bills);
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({
      message: "You need logged with real number and password",
    });
  } else {
    jwt.verify(token, "secure", (err, decoded) => {
      if (err) return res.json({ message: "Authentication Error" });
      next();
    });
  }
};

app.get("/current-user", verifyUser, (req, res) => {
  return res.json({ message: "Verified" });
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;
  const bill = await getBill(id);
  res.send(bill);
});

app.post("/login", async (req, res) => {
  const user = await getUser(req.body.number, req.body.password);
  if (user.length > 0) {
    const number = user[0].number;
    const token = jwt.sign({ number }, "secure", { expiresIn: "1d" });
    // res.cookie("token", token, {
    //   httpOnly: true, // Prevents client-side access
    //   secure: true, // Required if using HTTPS
    //   sameSite: "None", // Needed for cross-origin requests
    // });
    return res.json({ status: "Success", token });
  }
  return res.json({ status: "No Record" });
});

app.post("/logout", (req, res) => {
  console.log(req);
  res.cookie("token", "", {
    httpOnly: true, // Prevents client-side access
    secure: true, // Required if using HTTPS
    sameSite: "None", // Needed for cross-origin requests
  });
  return res.json({ message: "Logged Out" });
});

app.post("/", async (req, res) => {
  const {
    exporterName,
    payMethod,
    senderInfo,
    receiverInfo,
    productInfo,
    priceInfo,
  } = req.body;

  const bills = await getBills();

  const bill = await createBill(
    bills.length > 0 ? bills.pop().billNumber + 1 : process.env.BASEBILLNUMBER,
    exporterName,
    payMethod,
    senderInfo,
    receiverInfo,
    productInfo,
    priceInfo
  );
  res.status(201).send(bill);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
