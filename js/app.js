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

  let html = `<div class="filtres">
    <button class="btn-mode" onclick="basculerMode()">Mode : ${modeCategories}</button>
    <div class="chips">`;
  toutesLesCategories().forEach(c => {
    const actif = categoriesChoisies.includes(c) ? " chip-actif" : "";
    html += `<span class="chip${actif}" onclick="basculerCategorie('${c.replace(/'/g, "\\'")}')">${c}</span>`;
  });
  html += `</div></div>`;

  html += `<h2>🍽️ Recettes (${liste.length})</h2>`;

  liste.forEach(recette => {
    html += `
      <div>
        <h3>${recette.titre}</h3>
        <p>Page ${recette.page} · ${categoriesDeRecette(recette).join(" · ")}</p>
        <button onclick="ouvrirModalAgenda(${recette.id}, '${recette.titre.replace(/'/g, "\\'")}')">📅 Ajouter à l'agenda</button>
        <button onclick="ajouterCategorie(${recette.id})">🏷️ Ajouter une catégorie</button>
      </div>
      <hr>
    `;
  });

  results.innerHTML = html;
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

  function sansAccents(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

search.addEventListener("input", appliquerFiltres);


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

const btnLivres = document.getElementById("btnLivres");
const btnRecettes = document.getElementById("btnRecettes");
const btnFavoris = document.getElementById("btnFavoris");
const btnIngredients = document.getElementById("btnIngredients");

btnLivres.addEventListener("click", afficherLivres);
btnRecettes.addEventListener("click", () => afficherRecettes(recettes));
btnFavoris.addEventListener("click", afficherFavoris);
btnIngredients.addEventListener("click", afficherIngredients);

let categoriesChoisies = [];
let modeCategories = "ET";
let catsAjoutees = {};

function chargerCatsAjoutees() {
  const data = localStorage.getItem("categoriesRecettes");
  catsAjoutees = data ? JSON.parse(data) : {};
}
chargerCatsAjoutees();

function categoriesDeRecette(r) {
  const base = [];
  if (Array.isArray(r.categories)) base.push(...r.categories);
  if (r.categorie) base.push(r.categorie);
  if (r.ingredientPrincipal) base.push(r.ingredientPrincipal);
  const ajout = catsAjoutees[r.id] || [];
  return [...new Set([...base, ...ajout])];
}

function toutesLesCategories() {
  return ["Accompagnement","Agneau","Asiatique","Autocuiseur","Bœuf","Boisson","Canard",
  "Charcuterie","Comment faire","Confiture","Crème glacée","Déjeuner","Dessert","Entrée",
  "Fondue","Fromage maison","Fumoir","Indien","Jambon","Lapin","Légumes","Marinade",
  "Mélange d'épices","Mexicain","Mijoteuse","Noël","Pain","Pâte","Pâté","Pizza","Poisson",
  "Porc","Poulet","Quiche","Riz","Salade","Sandwich","Sauce","Soupe","Sous-vide","Trempette",
  "Veau","Viande vieillie","Vinaigrette"];
}


function ajouterCategorie(recetteId) {
  const c = prompt("Nouvelle catégorie pour cette recette :");
  if (!c || !c.trim()) return;
  if (!catsAjoutees[recetteId]) catsAjoutees[recetteId] = [];
  if (!catsAjoutees[recetteId].includes(c.trim())) catsAjoutees[recetteId].push(c.trim());
  localStorage.setItem("categoriesRecettes", JSON.stringify(catsAjoutees));
  appliquerFiltres();
}

function basculerCategorie(cat) {
  if (categoriesChoisies.includes(cat)) {
    categoriesChoisies = categoriesChoisies.filter(c => c !== cat);
  } else {
    categoriesChoisies.push(cat);
  }
  appliquerFiltres();
}

function basculerMode() {
  modeCategories = modeCategories === "ET" ? "OU" : "ET";
  appliquerFiltres();
}

function appliquerFiltres() {
  const mots = sansAccents(search.value).split(/\s+/).filter(m => m);
  const choisies = categoriesChoisies.map(sansAccents);

  const filtres = recettes.filter(r => {
    const cats = categoriesDeRecette(r).map(sansAccents);
    const champs = sansAccents(r.titre) + " " + cats.join(" ");
    const okTexte = mots.every(m => champs.includes(m));
    const okCats = choisies.length === 0 ? true
      : modeCategories === "ET"
        ? choisies.every(c => cats.includes(c))
        : choisies.some(c => cats.includes(c));
    return okTexte && okCats;
  });

  afficherRecettes(filtres);
}

