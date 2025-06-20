import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/ping", (req, res) => {
  res.json({ message: "API is working!" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

