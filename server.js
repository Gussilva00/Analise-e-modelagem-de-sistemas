const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

function loadData() {
  try {
    return JSON.parse(fs.readFileSync("data.json", "utf8"));
  } catch {
    return { pontos: [], nextId: 1 };
  }
}

function saveData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

// CREATE
app.post("/pontos", (req, res) => {
  const data = loadData();

  if (!req.body.nome || !req.body.tipo || !req.body.lat || !req.body.lng) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

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

// UPDATE
app.put("/pontos/:id", (req, res) => {
  const data = loadData();
  const ponto = data.pontos.find(p => p.id == req.params.id);

  if (!ponto) return res.status(404).send({ error: "Ponto não encontrado" });

  ponto.nome = req.body.nome;
  ponto.tipo = req.body.tipo;

  saveData(data);
  res.json(ponto);
});

// DELETE
app.delete("/pontos/:id", (req, res) => {
  const data = loadData();
  data.pontos = data.pontos.filter(p => p.id != req.params.id);

  saveData(data);
  res.json({ message: "Removido" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
