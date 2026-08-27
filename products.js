/*
  ===========================================================
  TES PRODUITS — modifie uniquement ce fichier pour gérer ta boutique
  ===========================================================

  Pour AJOUTER un article : copie un bloc { ... } entier, colle-le
  dans le tableau ci-dessous, puis change les valeurs.

  Pour SUPPRIMER un article : supprime son bloc { ... } en entier
  (attention à garder les virgules entre les blocs restants).

  Champs :
  - id          : identifiant unique, sans espace (ex: "sac-01")
  - nom         : nom affiché sur le site
  - prix        : prix en FCFA, juste un nombre, sans espace ni "FCFA"
  - description : une phrase courte
  - couleur     : couleur de la vignette produit tant que tu n'as pas
                  de photo (ex: "#6E2A35")
  - image       : chemin vers ta photo dans le dossier images/,
                  ex: "images/pashmina.jpg". Laisse "" si pas de photo.
*/

const PRODUITS = [
  {
    id: "voile-pashmina",
    nom: "Voile Pashmina",
    prix: 2500,
    description: "Tissu doux et fluide, bonne tenue, ne glisse pas.",
    couleur: "#6E2A35",
    image: "images/pashmina.jpeg"
  },
  {
    id: "voile-modal",
    nom: "Voile Modal",
    prix: 4000,
    description: "Matière légère et respirante, idéale au quotidien.",
    couleur: "#A6822E",
    image: "images/modal.jpeg"
  },
  {
    id: "voile-soie-medine",
    nom: "Voile Soie de Médine",
    prix: 2500,
    description: "Tombé élégant, ne se froisse pas, opaque.",
    couleur: "#57534A",
    image: "images/soie-de-medine.jpeg"
  },
  {
    id: "voile-jersey",
    nom: "Voile Jersey",
    prix: 2000,
    description: "Extensible et facile à nouer, sans épingles.",
    couleur: "#1C1A17",
    image: "images/jersey.jpeg"
  }
];