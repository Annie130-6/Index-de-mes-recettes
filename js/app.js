let livres = [];
let recettes = [];

const pageLivres = document.getElementById("pageLivres");
const pageRecettes = document.getElementById("pageRecettes");
const pageFavoris = document.getElementById("pageFavoris");
const pageIngredients = document.getElementById("pageIngredients");
const search = document.getElementById("search");
const results = document.getElementById("results");
const pageEpicerie = document.getElementById("pageEpicerie");


async function chargerDonnees() {
  const version = Date.now();
  try {
    const rL = await fetch(`data/livres.json?v=${version}`);
    livres = await rL.json();

    const rR = await fetch(`data/recettes.json?v=${version}`);
    recettes = await rR.json();
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin',
      `<p style="background:red;color:white">ERREUR: ${err.message}</p>`);
  }
  afficherLivres();
}


function cacherPages() {
  pageLivres.style.display = "none";
  pageRecettes.style.display = "none";
  pageFavoris.style.display = "none";
  pageIngredients.style.display = "none";
  pageAgenda.style.display = "none";
  pageEpicerie.style.display = "none";
}

function afficherLivres() {
  cacherPages();
  pageLivres.style.display = "block";

  pageLivres.innerHTML = `<h2>📚 Mes livres</h2>`;

  livres.forEach(livre => {
       
        pageLivres.innerHTML += `
      <div class="livre">
        <img src="images/${livre.couverture}" alt="${livre.titre}">
        <div>
          <h3>${livre.titre}</h3>
          <p>${livre.langue} · ${livre.nbRecettes} recettes · ${livre.statut}</p>
          <button onclick="afficherRecettesDuLivre(${livre.id})">Ouvrir le livre</button>
        </div>
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
    let etoiles = "";
    for (let n = 1; n <= 3; n++) {
      const pleine = noteDe(recette.id) >= n ? " etoile-pleine" : "";
      etoiles += `<span class="etoile${pleine}" onclick="noter(${recette.id}, ${n})">★</span>`;
    }
    const coeur = estFavori(recette.id) ? "❤️" : "🤍";

      const panier = estDansEpicerie(recette.id) ? "🛒" : "🧺";


    html += `
      <div>
        <h3>${recette.titre}</h3>
        <p>Page ${recette.page} · ${categoriesDeRecette(recette).join(" · ")}</p>
                <p class="ing-liste">${ingredientsDeRecette(recette).join(" · ") || "<em>aucun ingrédient noté</em>"}</p>
        <div>${etoiles}<span class="coeur" onclick="basculerFavori(${recette.id})">${coeur}</span><span class="panier" onclick="ouvrirModalEpicerie(${recette.id}, '${recette.titre.replace(/'/g, "\\'")}')">${panier}</span>
   </div>
        <button onclick="ouvrirModalAgenda(${recette.id}, '${recette.titre.replace(/'/g, "\\'")}')">📅 Ajouter à l'agenda</button>
              <button onclick="ajouterIngredients(${recette.id})">🥕 Ingrédients</button>
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

let rechercheIngredient = "";

function afficherIngredients() {
  cacherPages();
  pageIngredients.style.display = "block";

  const compte = {};

  recettes.forEach(r => {
    const mots = new Set();
        ingredientsDeRecette(r).forEach(i => mots.add(sansAccents(i)));

    sansAccents(r.titre).split(/[^a-z0-9]+/).forEach(m => {
      if (m.length >= 4 && !motsIgnores.has(m)) mots.add(m);
    });
    mots.forEach(m => compte[m] = (compte[m] || 0) + 1);
  });

  const liste = Object.keys(compte)
    .filter(m => compte[m] >= 2)
    .filter(m => m.includes(sansAccents(rechercheIngredient)))
    .sort((a, b) => a.localeCompare(b, "fr"));

  let html = `<h2>🥕 Ingrédients (${liste.length})</h2>
    <input id="chercheIng" placeholder="Filtrer les ingrédients..." value="${rechercheIngredient}">
    <div class="chips">`;
  liste.forEach(m => {
    html += `<span class="chip" onclick="filtrerParIngredient('${m}')">${m} (${compte[m]})</span>`;
  });
  html += `</div>`;

  pageIngredients.innerHTML = html;

  const champ = document.getElementById("chercheIng");
  champ.addEventListener("input", () => {
    rechercheIngredient = champ.value;
    afficherIngredients();
    document.getElementById("chercheIng").focus();
  });
}



function filtrerParIngredient(mot) {
  afficherRecettes(recettes.filter(r =>
    sansAccents(r.titre).includes(mot) ||
    sansAccents(r.ingredientPrincipal || "").includes(mot)
  ));
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
  <button onclick="ajouterAgendaAEpicerie()">🛒 Ajouter le mois à l'épicerie</button>
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
const btnEpicerie = document.getElementById("btnEpicerie");

btnLivres.addEventListener("click", afficherLivres);
btnRecettes.addEventListener("click", () => afficherRecettes(recettes));
btnFavoris.addEventListener("click", () => afficherRecettes(recettes.filter(r => estFavori(r.id))));
btnIngredients.addEventListener("click", afficherIngredients);
btnEpicerie.addEventListener("click", afficherEpicerie);

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
        const champs = sansAccents(r.titre) + " " + cats.join(" ") + " " +
                   sansAccents(ingredientsDeRecette(r).join(" "));

    const okTexte = mots.every(m => champs.includes(m));
    const okCats = choisies.length === 0 ? true
      : modeCategories === "ET"
        ? choisies.every(c => cats.includes(c))
        : choisies.some(c => cats.includes(c));
    return okTexte && okCats;
  });

  afficherRecettes(filtres);
}



let notes = JSON.parse(localStorage.getItem("notesRecettes") || "{}");
let favoris = JSON.parse(localStorage.getItem("favorisRecettes") || "[]");

let ingredientsEpicerie = JSON.parse(localStorage.getItem("ingredientsEpicerie") || "{}");

function sauvegarderIngredientsEpicerie() {
  localStorage.setItem("ingredientsEpicerie", JSON.stringify(ingredientsEpicerie));
}

function estDansEpicerie(id) { return !!ingredientsEpicerie[id]; }



function noteDe(id) { return notes[id] || 0; }
function estFavori(id) { return favoris.includes(id); }

function noter(id, n) {
  notes[id] = (notes[id] === n) ? 0 : n;
  localStorage.setItem("notesRecettes", JSON.stringify(notes));
  appliquerFiltres();
}

function basculerFavori(id) {
  favoris = estFavori(id) ? favoris.filter(f => f !== id) : [...favoris, id];
  localStorage.setItem("favorisRecettes", JSON.stringify(favoris));
  appliquerFiltres();
}



const motsIgnores = new Set(["de","des","du","la","le","les","au","aux","et","en","avec",
"pour","ma","mon","mes","sa","son","ses","un","une","dans","sur","sous","par","ou","a",
"l","d","the","style","facon","facile","maison","rapide","petits","petites","petit",
"petite","grand","grande","notre","nos","leur","qui","que","plus","tres","bon",
"bonne","meilleur","meilleure","classique","simple"]);



let ingAjoutes = JSON.parse(localStorage.getItem("ingredientsRecettes") || "{}");

function ingredientsDeRecette(r) {
  const base = Array.isArray(r.ingredients) ? r.ingredients : [];
  const ajout = ingAjoutes[r.id] || [];
  return [...new Set([...base, ...ajout])];
}

function ajouterIngredients(recetteId) {
  const saisie = prompt("Ingrédients (séparés par des virgules) :",
    (ingAjoutes[recetteId] || []).join(", "));
  if (saisie === null) return;
  const liste = saisie.split(",").map(s => s.trim()).filter(s => s);
  if (liste.length) ingAjoutes[recetteId] = liste;
  else delete ingAjoutes[recetteId];
  localStorage.setItem("ingredientsRecettes", JSON.stringify(ingAjoutes));
  appliquerFiltres();
}

  function afficherEpicerie() {
  cacherPages();
  pageEpicerie.style.display = "block";

  const idsSelectionnes = Object.keys(ingredientsEpicerie).map(Number);
    
const recettesSelectionnees = recettes.filter(r => idsSelectionnes.includes(r.id));


  if (recettesSelectionnees.length === 0) {
    pageEpicerie.innerHTML = `<h2>🛒 Liste d'épicerie</h2>
      <p>Aucune recette sélectionnée. Coche des recettes (🧺) ou ajoute ton agenda du mois.</p>`;
    return;
  }

  const groupes = {};
  recettesSelectionnees.forEach(r => {
    (ingredientsEpicerie[r.id] || []).forEach(ing => {

      const cle = sansAccents(ing.trim());
      if (!groupes[cle]) {
        groupes[cle] = { affichage: ing.trim(), recettes: [] };
      }
      groupes[cle].recettes.push(r.titre);
    });
  });

  const clesTriees = Object.keys(groupes).sort((a, b) => a.localeCompare(b, "fr"));

  let html = `<h2>🛒 Liste d'épicerie (${recettesSelectionnees.length} recette${recettesSelectionnees.length > 1 ? "s" : ""})</h2>
    <button onclick="viderEpicerie()">Vider la liste</button>
    <ul class="liste-epicerie">`;

  clesTriees.forEach(cle => {
    const groupe = groupes[cle];
    const recettesPourIng = [...new Set(groupe.recettes)].join(", ");
    html += `<li>${groupe.affichage} <em>(${recettesPourIng})</em></li>`;
  });

  html += `</ul>`;
  pageEpicerie.innerHTML = html;
}


function viderEpicerie() {
  ingredientsEpicerie = {};
  sauvegarderIngredientsEpicerie();
  afficherEpicerie();
}


