const api = require("./app.js")

const port = process.env.PORT || 3000

api.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
