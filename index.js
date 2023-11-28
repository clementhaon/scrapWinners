const express = require('express');
const app = express();
const port = 3000;
const Router = require("./src/router/index");
app.use(express.json());
app.use("/api", Router)
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
