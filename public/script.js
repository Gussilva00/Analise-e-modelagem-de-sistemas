let mapa = L.map("map").setView([-8.05, -34.9], 12);

// Fundo do mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(mapa);

let marcadorTemp = null;
let latSelecionada = null;
let lngSelecionada = null;

const lista = document.getElementById("lista");
const coordsLabel = document.getElementById("coords");


// =======================
// ÍCONES COLORIDOS
// =======================
const icones = {
  "Plástico": "red",
  "Papel": "blue",
  "Vidro": "green",
  "Metal": "orange",
  "Orgânico": "brown"
};

function criarIcone(tipo) {
  return L.icon({
    iconUrl:
      `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${icones[tipo]}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}


// =======================
// Carregar pontos já existentes
// =======================
async function carregarPontos() {
  const res = await fetch("/pontos");
  const pontos = await res.json();

  lista.innerHTML = "";

  pontos.forEach((p) => {
    // Adicionar marcador com cor
    const marcador = L.marker([p.lat, p.lng], {
      icon: criarIcone(p.tipo),
    }).addTo(mapa);

    // Popup com editar/excluir
    marcador.bindPopup(`
      <b>${p.nome}</b><br>
      Tipo: ${p.tipo}<br><br>
      <button onclick="editarPonto(${p.id})">Editar</button>
      <button onclick="remover(${p.id})" style="background:#d62828;margin-top:6px">Excluir</button>
    `);

    // Adicionar na lista
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="info-ponto">
        <strong>${p.nome}</strong> (${p.tipo})
      </span>
      <button onclick="remover(${p.id})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}


// =======================
// Clique no mapa → marcador temporário
// =======================
mapa.on("click", function (e) {
  latSelecionada = e.latlng.lat;
  lngSelecionada = e.latlng.lng;

  coordsLabel.innerText = `${latSelecionada.toFixed(6)}, ${lngSelecionada.toFixed(6)}`;

  if (marcadorTemp) {
    mapa.removeLayer(marcadorTemp);
  }

  marcadorTemp = L.marker([latSelecionada, lngSelecionada]).addTo(mapa);
});


// =======================
// Salvar ponto novo
// =======================
document.getElementById("btnSalvar").onclick = async () => {
  if (!latSelecionada || !lngSelecionada) {
    alert("Clique no mapa primeiro!");
    return;
  }

  const nome = document.getElementById("nome").value;
  const tipo = document.getElementById("tipo").value;

  await fetch("/pontos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      tipo,
      lat: latSelecionada,
      lng: lngSelecionada,
    }),
  });

  location.reload();
};


// =======================
// EXCLUIR PONTO
// =======================
async function remover(id) {
  await fetch(`/pontos/${id}`, { method: "DELETE" });
  location.reload();
}


// =======================
// EDITAR PONTO
// =======================
async function editarPonto(id) {
  const novoNome = prompt("Novo nome:");
  if (!novoNome) return;

  const novoTipo = prompt("Novo tipo (Plástico, Papel, Vidro, Metal, Orgânico):");
  if (!novoTipo) return;

  await fetch(`/pontos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: novoNome,
      tipo: novoTipo,
    }),
  });

  location.reload();
}

carregarPontos();
