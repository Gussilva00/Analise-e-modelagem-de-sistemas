const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

function loadData() {
  return JSON.parse(fs.readFileSync("data.json", "utf8"));
}

function saveData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

// CREATE
app.post("/pontos", (req, res) => {
  const data = loadData();

  const novo = {
    id: data.nextId++,
    nome: req.body.nome,
    tipo: req.body.tipo,
    lat: req.body.lat,
    lng: req.body.lng
  };

  data.pontos.push(novo);
  saveData(data);

  res.json(novo);
});

// READ
app.get("/pontos", (req, res) => {
  const data = loadData();
  res.json(data.pontos);
});

// DELETE
app.delete("/pontos/:id", (req, res) => {
  const data = loadData();
  data.pontos = data.pontos.filter(p => p.id != req.params.id);

  saveData(data);
  res.json({ message: "Removido" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000 🚀");
});
