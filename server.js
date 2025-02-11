require("dotenv").config();
const http = require("http");
const  dbConnect  = require("./configs/db");

const app = require("./app");
const config = require('./configs/config')


const server = http.createServer(app);



const PORT = config.port;
const local = "http://localhost"


dbConnect().then(() => {
  server.listen(PORT, () => {
    console.log(`POS Server is running on ${local}:${PORT}`);
  });
});


