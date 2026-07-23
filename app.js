let livres = [];
let recettes = [];

const pageLivres = document.getElementById("pageLivres");
const pageRecettes = document.getElementById("pageRecettes");
const pageFavoris = document.getElementById("pageFavoris");
const pageIngredients = document.getElementById("pageIngredients");
const search = document.getElementById("search");
const results = document.getElementById("results");

async function chargerDonnees() {
  const v = Date.now();
  try {
    const rLivres = await fetch(`data/livres.json?v=${v}`);
    const rRecettes = await fetch(`data/recettes.json?v=${v}`);
    livres = await rLivres.json();
    recettes = await rRecettes.json();

    document.getElementById("btnLivres").onclick = afficherLivres;
    document.getElementById("btnRecettes").onclick = () => afficherRecettes(recettes);
    document.getElementById("btnFavoris").onclick = afficherFavoris;
    document.getElementById("btnIngredients").onclick = afficherIngredients;

    afficherLivres();
  } catch (err) {
    document.getElementById("pageLivres").innerHTML = `<p style="color:red">ERREUR: ${err.message}</p>`;
  }
}


function cacherPages() {
  pageLivres.style.display = "none";
  pageRecettes.style.display = "none";
  pageFavoris.style.display = "none";
  pageIngredients.style.display = "none";
}

function afficherLivres() {
  cacherPages();
  pageLivres.style.display = "block";

  pageLivres.innerHTML = `<h2>📚 Mes livres</h2>`;

  livres.forEach(livre => {
    pageLivres.innerHTML += `
      <div>
        <h3>${livre.titre}</h3>
        <p>${livre.langue} · ${livre.nbRecettes} recettes · ${livre.statut}</p>
        <button onclick="afficherRecettesDuLivre(${livre.id})">Ouvrir le livre</button>
      </div>
      <hr>
    `;
  });
}

function afficherRecettesDuLivre(livreId) {
  const recettesLivre = recettes.filter(r => r.livreId === livreId);
  afficherRecettes(recettesLivre);
}

function afficherRecettes(liste) {
  cacherPages();
  pageRecettes.style.display = "block";

  results.innerHTML = `<h2>🍽️ Recettes (${liste.length})</h2>`;

  liste.forEach(recette => {
    results.innerHTML += `
      <div>
        <h3>${recette.titre}</h3>
        <p>Page ${recette.page} · ${recette.categorie} · ${recette.ingredientPrincipal}</p>
      </div>
      <hr>
    `;
  });
}

function afficherFavoris() {
  cacherPages();
  pageFavoris.style.display = "block";
  pageFavoris.innerHTML = "<h2>⭐ Favoris</h2><p>Bientôt disponible.</p>";
}

function afficherIngredients() {
  cacherPages();
  pageIngredients.style.display = "block";
  pageIngredients.innerHTML = "<h2>🥕 Ingrédients</h2><p>Bientôt disponible.</p>";
}

search.addEventListener("input", () => {
  const texte = search.value.toLowerCase();

  const filtres = recettes.filter(r =>
    r.titre.toLowerCase().includes(texte) ||
    r.categorie.toLowerCase().includes(texte) ||
    r.ingredientPrincipal.toLowerCase().includes(texte)
  );

  afficherRecettes(filtres);
});

chargerDonnees();
