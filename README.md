# EduSphere — Frontend

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvre ensuite l'URL affichée (généralement `http://localhost:5173/connexion`).

## Comptes de test (données mockées)

**Élève**
- Identifiant : `eleve.demo`
- E-mail : `eleve@edusphere.test`
- Mot de passe : `demo1234`

**Parent**
- Identifiant : `parent.demo`
- E-mail : `parent@edusphere.test`
- Mot de passe : `demo1234`

**Administration**
- Identifiant : `admin.demo`
- E-mail : `admin@edusphere.test`
- Mot de passe : `demo1234`

**Professeur**
- Identifiant : `professeur.demo`
- E-mail : `professeur@edusphere.test`
- Mot de passe : `demo1234`

Chaque compte redirige automatiquement vers le tableau de bord de son espace après connexion.

## Pages disponibles

**Espace élève** (`/eleve/...`)
- `dashboard` — Tableau de bord
- `banque-epreuves` — Banque d'épreuves
- `cours` — Mes cours
- `exercices` — Exercices
- `tuteur-ia` — Tuteur IA
- `progression` — Progression & révisions
- `groupes` — Groupes
- `tickets` — Mes tickets

**Espace parent** (`/parent/...`)
- `dashboard` — Tableau de bord (suivi de l'enfant)
- `evolution` — Evolution par matière
- `devoirs` — Devoirs & échéances
- `messagerie` — Messagerie

**Espace administration** (`/admin/...`)
- `dashboard` — Tableau de bord
- `eleves-enseignants` — Eleves & Enseignants
- `emploi-du-temps` — Emploi du temps
- `statistiques` — Statistiques
- `supervision` — Supervision des tickets

**Espace professeur** (`/professeur/...`)
- `dashboard` — Tableau de bord
- `comprehension` — Comprehension de la classe
- `programme` — Programme & Planification
- `contenus` — Contenus & Validation IA
- `devoirs` — Devoirs & Evaluations
- `tickets` — Tickets pédagogiques
- `programme/:id` — Détail d'un chapitre (exercices IA + séances), accessible via le bouton "Ouvrir" de la page Programme

Cette liste est mise à jour à chaque nouvelle page ajoutée — vérifie-la ici avant de demander "comment j'accède à telle page".

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