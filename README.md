# EduSphere — Frontend

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvre ensuite l'URL affichée (généralement `http://localhost:5173/connexion`).

## Compte de test (données mockées)

- Identifiant : `eleve.demo`
- E-mail : `eleve@edusphere.test`
- Mot de passe : `demo1234`

## Organisation du projet

```
src/
  assets/styles/     -> design system (variables, base, boutons, formulaires, layout)
  components/base/   -> composants réutilisables (BaseButton, BaseInput, ...)
  components/layout/ -> composants de mise en page communs (à remplir au fil des pages)
  views/<profil>/    -> une page = un dossier par profil (auth/, eleve/, parent/, ...)
  router/            -> routes Vue Router, organisées par profil
  services/<domaine>/-> logique métier isolée (auth, courses, ...) — c'est ici
                         qu'on branchera Firebase, sans toucher aux vues
  mock/              -> données fictives, à supprimer progressivement au fur
                         et à mesure que le backend fournit les vraies données
```

## Pour la prochaine maquette

1. Ajouter la vue dans `views/<profil>/`
2. Ajouter la route correspondante dans `router/index.js`
3. Réutiliser les composants `base/` existants ; en créer un nouveau
   uniquement si aucun composant existant ne convient
4. Si la page a besoin de données, créer le service correspondant dans
   `services/` (avec une version mockée dans `mock/` en attendant Firebase)
