import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import session from "express-session"

const app = express()
const PORT = process.env.PORT || 3000;

dotenv.config();
// app.set("view engine", "ejs");
// app.set("views", "views");  // folder path

// all static files such as css js or png will be inside this folder and public will become the root directory for those files. 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

app.get("/", (req, res) => {
    const feedback = req.session.feedback;
    delete req.session.feedback;
    res.render("index.ejs", { feedback });
})

app.post("/submit", async (req, res) => {
    console.log(req.body)
    const {name, email, message} = req.body

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // EMAIL details
    const mailOptions = 
    {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `Portfolio message from ${name}`,
        text: message
    }

    try {
        await transporter.sendMail(mailOptions);
        req.session.feedback = "✅ Message sent successfully."
        res.redirect("/")
    } catch (error) {
        console.error(error);
        req.session.feedback = "❌ Failed to send message. Try again later."
        res.redirect("/")
    }
});

app.listen(PORT, ()=> {
    console.log(`Server is listening on port ${PORT}`)
})

