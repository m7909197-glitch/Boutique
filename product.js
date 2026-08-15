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
                  de photo (ex: "#6E2A35"). Codes de couleur possibles
                  ici : https://htmlcolorcodes.com
  - image       : (optionnel) laisse "" pour l'instant. Le jour où tu as
                  une vraie photo en ligne, colle son lien ici entre les
                  guillemets, ex: "https://exemple.com/photo.jpg"
                  et elle remplacera automatiquement la couleur.
*/

const PRODUITS = [
  {
    id: "sac-besace-cuir",
    nom: "Sac besace en cuir",
    prix: 25000,
    description: "Sac bandoulière en cuir souple, fait main.",
    couleur: "#6E2A35",
    image: ""
  },
  {
    id: "ceinture-tressee",
    nom: "Ceinture tressée",
    prix: 8000,
    description: "Cuir tressé, boucle laiton brossé.",
    couleur: "#A6822E",
    image: ""
  },
  {
    id: "foulard-soie",
    nom: "Foulard en soie",
    prix: 12000,
    description: "Imprimé exclusif, bords roulottés main.",
    couleur: "#57534A",
    image: ""
  },
  {
    id: "boucles-oreilles-laiton",
    nom: "Boucles d'oreilles laiton",
    prix: 6000,
    description: "Pièces uniques martelées à la main.",
    couleur: "#1C1A17",
    image: ""
  }
];