/*
  ===========================================================
  TES PRODUITS — modifie uniquement ce fichier pour gérer ta boutique
  ===========================================================

  Chaque bloc représente UN TYPE de voile, avec la liste de ses
  couleurs disponibles à l'intérieur.

  Pour AJOUTER UN NOUVEAU TYPE de voile : copie un bloc { ... }
  entier (de "id" à la dernière couleur), colle-le dans le tableau,
  puis change les valeurs. N'oublie pas la virgule après le bloc
  précédent.

  Pour AJOUTER UNE COULEUR à un type existant : copie une ligne
  { nom: "...", hex: "...", image: "..." } à l'intérieur de
  "couleurs", et modifie ses valeurs.

  Champs d'un type :
  - id          : identifiant unique, sans espace (ex: "pashmina")
  - nom         : nom affiché (ex: "Voile Pashmina")
  - prix        : prix en FCFA, identique pour toutes les couleurs
  - description : une phrase courte
  - categorie   : sert à ranger ce type dans le bon onglet de filtre

  Champs d'une couleur :
  - nom   : nom de la couleur (ex: "Bleu marine")
  - hex   : code couleur affiché tant qu'il n'y a pas de photo
            (trouve des codes ici : https://htmlcolorcodes.com)
  - image : chemin vers la photo de cette couleur précise,
            ex: "images/pashmina.jpeg". Laisse "" si pas de photo.
*/

const PRODUITS = [
  {
    id: "pashmina",
    nom: "Voile Pashmina",
    prix: 7000,
    description: "Tissu doux et fluide, bonne tenue, ne glisse pas.",
    categorie: "Pashmina",
    couleurs: [
      { nom: "Bleu marine", hex: "#1F3A5F", image: "" },
      { nom: "Bordeaux", hex: "#6E2A35", image: "images/pashmina.jpeg" },
      { nom: "Kaki", hex: "#6B6E4E", image: "" }
    ]
  },
  {
    id: "modal",
    nom: "Voile Modal",
    prix: 6000,
    description: "Matière légère et respirante, idéale au quotidien.",
    categorie: "Modal",
    couleurs: [
      { nom: "Noir", hex: "#1C1A17", image: "images/modal.jpeg" },
      { nom: "Beige", hex: "#C9B79C", image: "" },
      { nom: "Gris souris", hex: "#8A8577", image: "" }
    ]
  },
  {
    id: "soie-medine",
    nom: "Voile Soie de Médine",
    prix: 6500,
    description: "Tombé élégant, ne se froisse pas, opaque.",
    categorie: "Soie de Médine",
    couleurs: [
      { nom: "Gris", hex: "#57534A", image: "images/soie-de-medine.jpeg" },
      { nom: "Blanc cassé", hex: "#EDE8DC", image: "" }
    ]
  },
  {
    id: "jersey",
    nom: "Voile Jersey",
    prix: 6500,
    description: "Extensible et facile à nouer, sans épingles.",
    categorie: "Jersey",
    couleurs: [
      { nom: "Kaki", hex: "#6B6E4E", image: "images/jersey.jpeg" },
      { nom: "Noir", hex: "#1C1A17", image: "" }
    ]
  }
];