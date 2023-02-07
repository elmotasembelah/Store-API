require("dotenv").config();
const connectDB = require("./db/connect");
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
require("express-async-errors");
const productsRouter = require("./routes/products");

app.use(
    rateLimiter({
        windowMs: (15 * 60) ^ 1000,
        max: 100,
    })
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.use(express.json());

app.get("/", (rea, res) => {
    res.status(200).send(
        '<h1>Store api</h1><a href="/api/v1/products">products page</a>'
    );
});

app.use("/api/v1/products", productsRouter);

app.use(require("./middleware/not-found"));
app.use(require("./middleware/error-handler"));

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(
            port,
            console.log(`the server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
