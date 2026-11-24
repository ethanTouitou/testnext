# Préparation de l'oral R505 · J5

Le support demande de présenter une démo, d'expliquer un flux du parcours utilisateur jusqu'au code bas niveau, puis de répondre aux questions sur l'erreur et les commits, le travail avec un designer et un sujet tiré au sort.

## Présentation en 30 secondes

> Drops est une application Next.js où l'on peut se connecter, publier et consulter des posts géolocalisés, les modifier, les aimer et les commenter. Les pages serveur chargent les données avec l'API. Les formulaires passent par des actions serveur. Une seule connexion WebSocket alimente la présence et les mises à jour en direct. Leaflet 1.9.4 est installé pour la suite, mais la carte n'est pas encore codée.

## Démo courte

1. Montrer `/login`, se connecter et expliquer que la session est gardée dans un cookie `httpOnly`.
2. Montrer `/drops` : liste, recherche, filtres, likes et création d'un drop.
3. Ouvrir `/drops/[id]` : contenu, présence, commentaires et modification si le drop appartient à l'utilisateur.
4. Montrer le profil et le changement d'avatar.
5. Si possible, ouvrir le même drop dans deux sessions pour montrer présence, likes ou commentaires en direct.

Ne présente pas la carte comme une fonctionnalité terminée : le formulaire sait saisir des coordonnées et utiliser la géolocalisation du navigateur, mais il n'y a pas encore de carte Leaflet.

## Un flux complet : envoyer un commentaire

> Dans `comment-form.tsx`, l'utilisateur soumet le formulaire. `useActionState` affiche l'état d'envoi et les erreurs. L'action serveur `createComment` dans `lib/actions/drops.ts` valide le texte, lit le token de session et appelle `apiPost`. L'API répond, puis la page est revalidée. En parallèle, le serveur envoie `comment:created` sur la socket partagée. `LiveComments` ajoute le commentaire seulement s'il concerne ce drop et s'il n'est pas déjà présent. Le compteur évite lui aussi de compter deux fois le même identifiant.

## Question : une règle de l'AGENTS.md sur les erreurs et les commits

> Une erreur ne doit jamais devenir un succès silencieux ou une liste vide. Une page de route a un chargement, une erreur avec possibilité de réessayer et une vraie 404 si le contenu manque. Un formulaire affiche son état d'envoi et son erreur près du champ ou du bouton. Pour les commits, je vérifie la branche et le diff, je ne prends que les fichiers liés à la tâche et je ne commit que si on me le demande.

Fichiers à montrer : `AGENTS.md`, `src/app/drops/loading.tsx`, `src/app/drops/error.tsx`, `src/app/not-found.tsx`, `src/components/route-error.tsx`.

## Question : un designer arrive, que peut-il toucher ?

> Pour les couleurs et les styles communs, `src/app/globals.css`. Pour une page précise, le composant de cette page et ses classes Tailwind. Pour un bouton ou badge partagé, `src/components/ui/`. Je garde les appels API, la session et les règles temps réel dans `src/lib/` et les actions serveur.

## Sujet tiré au sort : temps réel

> Les composants ne créent pas chacun leur WebSocket. `src/lib/realtime.ts` garde une connexion partagée. Un composant appelle `retain()` pour l'utiliser, `subscribe()` pour écouter un événement, puis se désabonne au démontage. Le navigateur demande un ticket à `/api/realtime/ticket` ; le serveur ajoute le Bearer token et ne renvoie que l'URL temporaire. Les événements mettent à jour la présence, les likes, les commentaires, les notifications et la liste. Le code 4001 efface la session et renvoie au login.

À montrer : `src/lib/realtime.ts`, `src/app/api/realtime/ticket/route.ts`, puis un consommateur comme `src/hooks/use-presence.ts` ou `src/app/drops/[id]/live-comments.tsx`.

## Sujet tiré au sort : session

> La Server Action `login` envoie l'identifiant et le mot de passe à `/auth/login`. Elle met le token de la réponse dans un cookie `httpOnly`. Le proxy protège les routes en vérifiant que le cookie existe. La page récupère le token côté serveur avec `requireSession` et l'envoie à l'API dans `Authorization: Bearer ...`. L'API valide réellement le token. Le logout supprime le cookie.

Nuance utile : le proxy vérifie la présence du cookie, pas sa validité ; c'est l'API qui peut encore répondre 401 si le token est expiré ou invalide.

## Sujet tiré au sort : formulaires

> Le formulaire est un composant client parce qu'il gère les saisies et l'état pending. `useActionState` relie le formulaire à une Server Action. L'action valide à nouveau les données, lit la session, appelle l'API et renvoie un message d'erreur ou de succès. Après une modification, elle revalide le chemin pour rafraîchir les données serveur.

Exemples : `CreateDropForm` → `createDrop`, `CommentForm` → `createComment`, `EditDropForm` → `updateDrop`.

## Sujet tiré au sort : carte

> Pour l'instant, la carte n'est pas implémentée. Leaflet 1.9.4 et ses types sont installés, mais la liste et les coordonnées du formulaire ne sont pas encore reliées à Leaflet. La suite prévue est un composant client chargé sans rendu serveur, une carte créée une seule fois puis détruite avec `map.remove()`, et un `activeId` partagé entre la liste et les marqueurs. Leaflet attend `[latitude, longitude]`.

Le support demande aussi une carte de sélection dans le formulaire et une carte sur le détail et la modification du drop. Ne prétends pas que ces éléments sont déjà faits.

## Web Worker : ce qu'il faut répondre

> Il n'y a pas de Worker dans l'application actuellement, et ce n'est pas nécessaire pour les appels réseau ou pour manipuler la carte. J'en ajouterais un seulement après avoir mesuré un calcul JavaScript assez lourd pour bloquer l'interface, comme une tâche de plus de 50 ms. Un Worker ne peut pas manipuler le DOM.

## À vérifier avant la démo

- Tester les parcours dans le navigateur, notamment les erreurs, le chargement et la présence dans deux sessions.
- Le support propose les outils de simulation de l'API : `?delay=3000`, `?fail=422` et `?fail=500`.
- Les commandes disponibles dans le projet comprennent `npm run lint` et `npx tsc --noEmit`.
- Vérifier que la version déployée ou l'URL de preview contient bien les changements que tu veux montrer.
