const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

app.use(cors());
app.use(bodyParser.json());

const user_name = process.env.EMAIL_USER;
const user_pass = process.env.EMAIL_PASS;
const port = process.env.PORT || "http://localhost:3000";
const RECAPTCHA_SECRET_KEY = process.env.SECRET_KEY;

let transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: user_name,
    pass: user_pass,
  },
});

app.get("/", (req, res) => {
  console.log("Welcome to backend!");
  res.status(200).json("Welcome to backend !");
});

app.post("/contact", async (req, res) => {
  const { name, email, subject, message, recaptchaToken } = req.body;

  console.log("Name:", name, "| Email:", email, "| Subject:", subject, "| Message:", message, "| reCAPTCHA Token:", recaptchaToken);

  try {
    if (!name || !email || !subject || !message || !recaptchaToken) {
    
      return res.status(400).json({ message: "All fields are required" });
      
    }
    const googleResponse = await axios.post( "https://www.google.com/recaptcha/api/siteverify",null,{
        params: {
            secret: RECAPTCHA_SECRET_KEY,
            response: recaptchaToken,
        }
    })
    console.log("✅ reCAPTCHA Response:", googleResponse?.data);
    if (googleResponse?.data?.score < 0.5) {
       
        return res.status(400).json({ message: "Invalid reCAPTCHA" });
    }

    const mailoptions = {
      from: email,
      to: "mayurrohokale1041@gmail.com",
      subject: subject,
      text: `Email: ${email} \n Name: ${name}\n Message: ${message}`,
    };
    await transporter.sendMail(mailoptions);
    return res.status(200).json({ message: "Email Sent Successfully!" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  } 
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
