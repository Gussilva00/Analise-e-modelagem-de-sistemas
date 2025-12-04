let mapa = L.map("map").setView([-8.05, -34.9], 12);

// Fundo do mapa (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(mapa);

let latSelecionada = null;
let lngSelecionada = null;

const lista = document.getElementById("lista");
const coordsLabel = document.getElementById("coords");

// Carregar pontos já existentes
async function carregarPontos() {
  const res = await fetch("/pontos");
  const pontos = await res.json();

  lista.innerHTML = "";

  pontos.forEach(p => {
    // Adicionar marcador no mapa
    L.marker([p.lat, p.lng])
      .addTo(mapa)
      .bindPopup(`<b>${p.nome}</b><br>${p.tipo}`);

    // Adicionar na lista
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.nome}</strong> (${p.tipo})
      <button onclick="remover(${p.id})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

// Detectar clique no mapa
mapa.on("click", function (e) {
  latSelecionada = e.latlng.lat;
  lngSelecionada = e.latlng.lng;

  coordsLabel.innerText = `${latSelecionada.toFixed(6)}, ${lngSelecionada.toFixed(6)}`;
});

// Salvar ponto
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
      lng: lngSelecionada
    })
  });

  location.reload();
};

async function remover(id) {
  await fetch(`/pontos/${id}`, { method: "DELETE" });
  location.reload();
}

carregarPontos();
