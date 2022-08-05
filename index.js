import express from "express";
import { verifyAdmin } from "./middlewares/auth.middleware.js";
import { apiLimiter } from "./middlewares/apiLimit.middleware.js";
import { router } from "./routes/users.routes.js";
import cors from "cors";

const app = express();
const port = process.env.PORT;

// Middlewares
app.use(cors());
app.use(express.json()); // parses request body to json.
app.use(verifyAdmin);
app.use(apiLimiter);

// Routes
app.use("/users", router);
app.get("/isadmin", (req, res) => {
    res.send({ isAdmin: req.isAdmin });
});

// Error handlers
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
