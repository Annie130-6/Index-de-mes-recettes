let recettes = [];
let livres = [];

const pages = {
  livres: document.getElementById("pageLivres"),
  recettes: document.getElementById("pageRecettes"),
  favoris: document.getElementById("pageFavoris"),
  ingredients: document.getElementById("pageIngredients")
};

const listeLivres = document.getElementById("listeLivres");
const recherche = document.getElementById("search");
const resultats = document.getElementById("results");

document.getElementById("btnLivres").addEventListener("click", () => afficherPage("livres"));
document.getElementById("btnRecettes").addEventListener("click", () => afficherPage("recettes"));
document.getElementById("btnFavoris").addEventListener("click", () => afficherPage("favoris"));
document.getElementById("btnIngredients").addEventListener("click", () => afficherPage("ingredients"));

async function chargerDonnees() {
  const livresResponse = await fetch("data/livres.json");
  livres = await livresResponse.json();

  const recettesResponse = await fetch("data/recettes.json");
  recettes = await recettesResponse.json();

  afficherLivres();
  afficherRecettes(recettes);
}

function afficherPage(nomPage) {
  Object.values(pages).forEach(page => page.style.display = "none");
  pages[nomPage].style.display = "block";
}

function trouverLivre(livreId) {
  return livres.find(livre => livre.id === livreId);
}

function afficherLivres() {
  listeLivres.innerHTML = "";

  livres.forEach(livre => {
    listeLivres.innerHTML += `
      <div>
        <h3>${livre.titre}</h3>
        <p>${livre.langue} · ${livre.nbRecettes} recettes · ${livre.statut}</p>
      </div>
      <hr>
    `;
  });
}

function afficherRecettes(liste) {
  resultats.innerHTML = "";

  liste.forEach(recette => {
    const livre = trouverLivre(recette.livreId);

    resultats.innerHTML += `
      <div>
        <h3>${recette.titre}</h3>
        <p>📚 ${livre ? livre.titre : "Livre inconnu"} · 📄 page ${recette.page}</p>
        <p>${recette.categorie} · ${recette.cuisine}</p>
      </div>
      <hr>
    `;
  });
}

recherche.addEventListener("input", () => {
  const texte = recherche.value.toLowerCase();

  const filtre = recettes.filter(recette =>
    recette.titre.toLowerCase().includes(texte) ||
    recette.categorie.toLowerCase().includes(texte) ||
    recette.cuisine.toLowerCase().includes(texte)
  );

  afficherRecettes(filtre);
});

chargerDonnees();
