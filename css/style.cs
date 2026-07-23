body{
    margin:0;
    padding:0;
}
.agenda-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.agenda-grille { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
.agenda-entete { font-weight:bold; text-align:center; font-size:0.8em; }
.agenda-case { border:1px solid #ccc; min-height:60px; padding:4px; font-size:0.75em; }
.agenda-vide { border:none; }
.agenda-jour { font-weight:bold; }
.agenda-recette { background:#d4edda; border-radius:4px; padding:2px 4px; margin-top:2px; cursor:pointer; }
.modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); align-items:center; justify-content:center; z-index:1000; }
.modal-box { background:white; padding:20px; border-radius:8px; max-width:300px; width:90%; margin:auto; }
.modal-actions { display:flex; justify-content:space-between; margin-top:15px; }
