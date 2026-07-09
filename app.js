let recettes = [];
let livres = [];

const recherche = document.getElementById("search");
const resultats = document.getElementById("results");

async function chargerDonnees() {
  const livresResponse = await fetch("data/livres.json");
  livres = await livresResponse.json();

  const recettesResponse = await fetch("data/recettes.json");
  recettes = await recettesResponse.json();

  afficher(recettes);
}

function trouverLivre(livreId) {
  return livres.find(livre => livre.id === livreId);
}

function afficher(liste) {
  resultats.innerHTML = "";

  liste.forEach(recette => {
    const livre = trouverLivre(recette.livreId);

    resultats.innerHTML += `
      <p>
        <strong>${recette.titre}</strong><br>
        📚 ${livre ? livre.titre : "Livre inconnu"}<br>
        📄 Page ${recette.page}
      </p>
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

  afficher(filtre);
});

chargerDonnees();
