const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
dotenv.config();

let username = process.env.MONGODB_USERNAME;
let password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster1.3tvjh.mongodb.net/registrationsDB`)
   .then(() => {
       console.log("Connected to MongoDB successfully");
   })
   .catch(err => {
       console.log("MongoDB connection error:", err);
   });

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const Registration = mongoose.model("Registration", registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
});

app.post("/register", async (req, res) => {
    try {
        let { name, email, password } = req.body;

        const existingUser = await Registration.findOne({ email: email });
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(password, 10); 

            const registrationData = new Registration({
                name,
                email,
                password: hashedPassword, 
            });

            await registrationData.save();
            res.redirect("/success");
        } else {
            res.redirect("/error?message=Email%20already%20registered");
        }

    } catch (error) {
        console.log(error);
        res.redirect("/error?message=Server%20error");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/pages/success.html");
});

app.get("/error", (req, res) => {
    const message = req.query.message || "An unknown error occurred";
    res.send(`<h1>Error</h1><p>${message}</p>`);
});
