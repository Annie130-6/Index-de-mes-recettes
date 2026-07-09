const recettes = [
  {
    titre: "Lasagne à la viande",
    livre: "Livre test",
    page: 42
  },
  {
    titre: "Soupe à l'oignon",
    livre: "Livre test",
    page: 15
  },
  {
    titre: "Pain maison",
    livre: "Livre test",
    page: 88
  }
];

const recherche = document.getElementById("search");
const resultats = document.getElementById("results");

function afficher(liste) {
  resultats.innerHTML = "";

  liste.forEach(recette => {
    resultats.innerHTML += `
      <p><strong>${recette.titre}</strong><br>
      ${recette.livre} - page ${recette.page}</p>
      <hr>
    `;
  });
}

afficher(recettes);

recherche.addEventListener("input", () => {
  const texte = recherche.value.toLowerCase();

  const filtre = recettes.filter(r =>
    r.titre.toLowerCase().includes(texte)
  );

  afficher(filtre);
});
