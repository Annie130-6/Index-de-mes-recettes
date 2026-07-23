let livres = [];
let recettes = [];

const pageLivres = document.getElementById("pageLivres");
const pageRecettes = document.getElementById("pageRecettes");
const pageFavoris = document.getElementById("pageFavoris");
const pageIngredients = document.getElementById("pageIngredients");
const search = document.getElementById("search");
const results = document.getElementById("results");

async function chargerDonnees() {
     const version = Date.now();

  document.body.insertAdjacentHTML('afterbegin', '<p style="background:yellow">Début du chargement...</p>');

  try {
    const rL = await fetch(`data/livres.json?v=${version}`);
    document.body.insertAdjacentHTML('afterbegin', `<p style="background:yellow">livres.json statut: ${rL.status}</p>`);
    const texteLivres = await rL.text();
document.body.insertAdjacentHTML('afterbegin', `<p style="background:orange">TEXTE BRUT: ${texteLivres.substring(0,300)}</p>`);
livres = JSON.parse(texteLivres);

    document.body.insertAdjacentHTML('afterbegin', `<p style="background:yellow">Livres chargés: ${livres.length}</p>`);

    const rR = await fetch(`data/recettes.json?v=${version}`);
    document.body.insertAdjacentHTML('afterbegin', `<p style="background:yellow">recettes.json statut: ${rR.status}</p>`);
    const texteRecettes = await rR.text();
try {
  recettes = JSON.parse(texteRecettes);
} catch (e) {
  document.body.insertAdjacentHTML('afterbegin', `<p style="background:orange">ERREUR À LA POSITION: ${e.message}</p>`);
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || 0);
  document.body.insertAdjacentHTML('afterbegin', `<p style="background:cyan">CONTEXTE: ...${texteRecettes.substring(Math.max(0,pos-100), pos+100)}...</p>`);
  throw e;
}

    document.body.insertAdjacentHTML('afterbegin', `<p style="background:yellow">Recettes chargées: ${recettes.length}</p>`);
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin', `<p style="background:red;color:white">ERREUR: ${err.message}</p>`);
  }

  afficherLivres();
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
