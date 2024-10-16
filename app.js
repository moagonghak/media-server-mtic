const morgan = require("morgan");
const express = require("express");
const router = require("./routers/index");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const logger = require("./config/logger")

process.env.TZ = 'UTC';

const port = process.env.PORT || 3000;
const corsOption = {
  optionsSuccessStatus: 200,
};

app.use(cors(corsOption));
app.enable('trust proxy'); 

/* log setting with morgan + winston */
morgan.token('ip', function(req, res) {
  return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
});

app.use(morgan(":method :status :url :response-time ms - IP: :ip", 
    { 
        stream: { 
            write: (message) => logger.http(message.trim())
        }
    }
));
/* log setting with morgan + winston */

app.use(express.json());

app.use("/", router, (req, res, next) => {
  res.send("mtic server");
});


app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});