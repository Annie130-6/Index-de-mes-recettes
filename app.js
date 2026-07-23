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
    livres = await rL.json();
    document.body.insertAdjacentHTML('afterbegin', `<p style="background:yellow">Livres chargés: ${livres.length}</p>`);

    const rR = await fetch(`data/recettes.json?v=${version}`);
    document.body.insertAdjacentHTML('afterbegin', `<p style="background:yellow">recettes.json statut: ${rR.status}</p>`);
    recettes = await rR.json();
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
  pageAgenda.style.display = "none";
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
        <button onclick="ouvrirModalAgenda(${recette.id}, '${recette.titre.replace(/'/g, "\\'")}')">📅 Ajouter à l'agenda</button>
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


const pageAgenda = document.getElementById("pageAgenda");
const btnAgenda = document.getElementById("btnAgenda");
let anneeAffichee = new Date().getFullYear();
let moisAffiche = new Date().getMonth();
let recetteEnCoursId = null;
let recetteEnCoursTitre = null;

btnAgenda.addEventListener("click", () => {
  cacherPages();
  pageAgenda.style.display = "block";
  afficherAgenda();
});

function chargerAgenda() {
  const data = localStorage.getItem("agendaRecettes");
  return data ? JSON.parse(data) : {};
}

function sauvegarderAgenda(agenda) {
  localStorage.setItem("agendaRecettes", JSON.stringify(agenda));
}

function ouvrirModalAgenda(recetteId, titre) {
  recetteEnCoursId = recetteId;
  recetteEnCoursTitre = titre;
  document.getElementById("modalTitreRecette").textContent = titre;
  document.getElementById("modalDateInput").value = new Date().toISOString().split("T")[0];
  document.getElementById("modalAgenda").style.display = "flex";
}

document.getElementById("modalAnnuler").addEventListener("click", () => {
  document.getElementById("modalAgenda").style.display = "none";
});

document.getElementById("modalConfirmer").addEventListener("click", () => {
  const date = document.getElementById("modalDateInput").value;
  if (!date) { alert("Choisis une date."); return; }
  const agenda = chargerAgenda();
  if (!agenda[date]) agenda[date] = [];
  agenda[date].push({ id: recetteEnCoursId, titre: recetteEnCoursTitre });
  sauvegarderAgenda(agenda);
  document.getElementById("modalAgenda").style.display = "none";
  afficherAgenda();
});

function afficherAgenda() {
  cacherPages();
  pageAgenda.style.display = "block";

  const agenda = chargerAgenda();
  const premierJour = new Date(anneeAffichee, moisAffiche, 1);
  const nbJours = new Date(anneeAffichee, moisAffiche + 1, 0).getDate();
  let premierJourSemaine = premierJour.getDay();
  premierJourSemaine = premierJourSemaine === 0 ? 6 : premierJourSemaine - 1;

  const nomsMois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  let html = `
    <h2>📅 Agenda</h2>
    <div class="agenda-nav">
      <button onclick="moisPrecedent()">◀</button>
      <strong>${nomsMois[moisAffiche]} ${anneeAffichee}</strong>
      <button onclick="moisSuivant()">▶</button>
    </div>
    <div class="agenda-grille">
      <div class="agenda-entete">Lun</div>
      <div class="agenda-entete">Mar</div>
      <div class="agenda-entete">Mer</div>
      <div class="agenda-entete">Jeu</div>
      <div class="agenda-entete">Ven</div>
      <div class="agenda-entete">Sam</div>
      <div class="agenda-entete">Dim</div>
  `;

  for (let i = 0; i < premierJourSemaine; i++) {
    html += `<div class="agenda-case agenda-vide"></div>`;
  }

  for (let jour = 1; jour <= nbJours; jour++) {
    const dateStr = `${anneeAffichee}-${String(moisAffiche+1).padStart(2,"0")}-${String(jour).padStart(2,"0")}`;
    const recettesJour = agenda[dateStr] || [];

    html += `<div class="agenda-case"><div class="agenda-jour">${jour}</div>`;
    recettesJour.forEach((r, index) => {
      html += `<div class="agenda-recette" onclick="supprimerDuCalendrier('${dateStr}', ${index})">${r.titre} ✕</div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  pageAgenda.innerHTML = html;
}

function moisPrecedent() {
  moisAffiche--;
  if (moisAffiche < 0) { moisAffiche = 11; anneeAffichee--; }
  afficherAgenda();
}

function moisSuivant() {
  moisAffiche++;
  if (moisAffiche > 11) { moisAffiche = 0; anneeAffichee++; }
  afficherAgenda();
}

function supprimerDuCalendrier(dateStr, index) {
  const agenda = chargerAgenda();
  agenda[dateStr].splice(index, 1);
  if (agenda[dateStr].length === 0) delete agenda[dateStr];
  sauvegarderAgenda(agenda);
  afficherAgenda();
}

