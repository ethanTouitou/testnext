# Règles du projet Drops

## Structure à connaître

- Le projet utilise Next.js App Router, React et TypeScript.
- `src/app/` contient les pages et leurs états de chargement, d'erreur et de page introuvable.
- `src/lib/api/` contient le client et les types de l'API ; `src/lib/actions/` contient les actions serveur des formulaires.
- `src/components/` contient les composants partagés ; `src/components/ui/` contient les composants d'interface réutilisables.
- `src/app/globals.css` définit les couleurs et les styles communs.

## Erreurs, chargement et formulaires

- Toute requête réseau doit avoir un état de chargement et un message compréhensible en cas d'échec. Ne transforme pas une erreur en liste vide ou en succès silencieux.
- Pour les pages de route, utilise `loading.tsx`, `error.tsx` avec un bouton de nouvel essai, et `not-found.tsx` quand la ressource n'existe pas.
- Dans un formulaire, désactive le bouton pendant l'envoi et affiche les erreurs ou la confirmation près du formulaire. Valide les données côté serveur, même si elles sont aussi vérifiées dans le navigateur.
- Utilise `ApiError` et le client de `src/lib/api/client.ts` pour les appels API côté serveur. Conserve les messages et statuts utiles de l'API.

## Session et API

- La session est stockée dans un cookie `httpOnly` par `src/lib/session.ts`. Ne lis pas et n'expose pas le token dans un composant client.
- Les appels authentifiés partent du serveur et transmettent le token Bearer. N'ajoute pas de cache partagé à une requête authentifiée et ne retire pas son token pour la mettre en cache.
- Utilise `API_URL` côté serveur. Ne place aucun secret dans une variable `NEXT_PUBLIC_*`.
- L'API du projet exige actuellement le token pour `/categories` : garde-le dans cet appel même si le schéma local indique le contraire.

## Temps réel

- Il n'existe qu'une socket partagée, gérée par `src/lib/realtime.ts`. Ne crée pas de nouvelle `WebSocket` dans les pages ou les widgets.
- Les composants réutilisent cette connexion avec `retain()`, `subscribe()`, `onOpen()` et `send()`, puis se désabonnent au démontage.
- Le navigateur demande son ticket à `/api/realtime/ticket`. Le JWT reste côté serveur ; ne l'envoie jamais au navigateur ni dans l'URL de la socket.
- Évite les doublons lors de la fusion d'un événement temps réel avec les données déjà rendues depuis l'API.

## Interface et travail avec un designer

- Pour une retouche visuelle locale, modifie le composant de la page concernée.
- Pour les couleurs, rayons et styles globaux, modifie les variables et règles de `src/app/globals.css`.
- Pour un élément partagé comme un bouton ou un badge, modifie ou ajoute un composant dans `src/components/ui/`.
- Garde la logique API, session et temps réel dans `src/lib/` ou les actions serveur ; un changement de style ne doit pas modifier ces comportements.

## Carte Leaflet

- Leaflet est installé en version stable **1.9.4**. N'installe pas Leaflet 2 bêta.
- La carte doit être un composant client chargé sans rendu serveur, car Leaflet utilise `window` et le DOM. Crée la carte une fois, puis appelle `map.remove()` au nettoyage.
- La liste, la page détail et les formulaires réutilisent les composants dans `src/components/map/`. La liste et la carte partagent `activeId` : survol ou focus d'une carte met son marqueur en évidence et recentre la carte ; clic sur un marqueur sélectionne et fait défiler jusqu'à la carte correspondante.
- À la création, un clic sur la carte place le repère. À la modification, le repère peut être déplacé ; les coordonnées restent aussi éditables dans les champs Latitude/Longitude. Envoie toujours `lat` et `lng` ensemble au `PATCH`.
- Leaflet attend les coordonnées `[latitude, longitude]`. Vérifie l'ordre si tu manipules du GeoJSON ou un `bbox`, qui place souvent la longitude en premier.
- Affiche l'attribution des tuiles et respecte la politique d'utilisation du fournisseur choisi.
- Le front-end ne limite pas la carte à une zone géographique. Le contrat de l'API Railway impose actuellement une limite de 3 km autour du département MMI : elle doit être changée côté API pour que les créations et modifications partout dans le monde soient acceptées.

## Web Worker

- N'ajoute un Worker qu'après avoir mesuré un calcul qui bloque l'interface (repère du cours : une tâche longue de plus de 50 ms).
- Un Worker sert aux calculs JavaScript lourds ; il ne manipule ni le DOM ni Leaflet et ne remplace pas un appel réseau.
- Si aucun calcul bloquant n'est mesuré, garde le code sans Worker.

## Vérifications et commits

- Avant de terminer une modification, vérifie le typage (`npx tsc --noEmit`) et ESLint (`npm run lint`) quand ils sont pertinents.
- Pour vérifier un chargement ou une erreur, l'API de cours accepte selon la route des paramètres de simulation comme `?delay=3000`, `?fail=422` ou `?fail=500`.
- **Ne crée pas de commit sans demande explicite.** Avant un commit demandé, vérifie la branche, `git status` et le diff ; n'ajoute que les fichiers liés à la tâche.
- Utilise un message court qui décrit le changement, par exemple `feat: ajouter la présence en direct` ou `fix: afficher l'erreur de connexion`.
