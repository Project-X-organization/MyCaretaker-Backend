const express = require("express")
const app = express()
const port = 3000

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, World!" })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
