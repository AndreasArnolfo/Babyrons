Babyrons — Suivi des bébés (spécial jumeaux)

Babyrons est une application simple et intuitive pour suivre les biberons, siestes, couches, médicaments et croissance de vos bébés — conçue pour les parents de jumeaux et triplés.
💰 Version gratuite : complète, sans pub.
🌈 Version Pro (2 €) : export PDF, synchronisation Cloud et thèmes personnalisables.

Objectifs

Suivre facilement les besoins des bébés (repas, sommeil, soins, croissance).

Gérer plusieurs bébés à la fois avec une interface claire et rapide.

Activer ou désactiver les services selon vos besoins (biberons, sommeil, etc.).

Proposer une version Pro abordable avec des outils avancés (PDF, Cloud, thèmes).

Rester simple, fiable et sans abonnement.

Fonctionnalités principales
Service	Gratuit	Pro
Multi-bébé (illimité)	✅	✅
Biberons (heure, quantité, type)	✅	✅
Sommeil / Sieste	✅	✅
Médicaments / Vitamine D	✅	✅
Couches	✅	✅
Croissance (poids, taille, périmètre crânien)	✅	✅
Activation/désactivation de services	✅	✅
Historique détaillé (timeline)	✅	✅
Statistiques par bébé et par jour	✅	✅
Export PDF / CSV	❌	✅
Synchro Cloud (Firebase/Supabase)	❌	✅
Thèmes personnalisables (pastel, nuit)	❌	✅
Aperçu

Voir le fichier : Babyrons_wireframes.pdf (wireframes exportés depuis Figma).

Stack technique
Front-end

React Native + Expo

TypeScript

React Navigation

Zustand (gestion d’état)

MMKV (stockage local rapide)

Victory Native (graphiques)

pdf-lib (export PDF)

expo-in-app-purchases (achats intégrés)

Back-end (version Pro)

Firebase ou Supabase

Authentification (parents)

Firestore (synchronisation des événements)

Cloud Storage (photos bébés)

Architecture du projet
Babyrons/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx         # Accueil (Dashboard)
│   │   ├── history.tsx       # Historique
│   │   ├── stats.tsx         # Statistiques
│   │   └── settings.tsx      # Paramètres
│   └── modals/
│       ├── add-event.tsx     # Ajout biberon/sommeil/etc.
│       └── manage-baby.tsx   # CRUD bébé
│
├── src/
│   ├── components/
│   │   ├── BabySwitcher.tsx
│   │   ├── ServiceCard.tsx
│   │   └── EventForm/
│   │       ├── BottleForm.tsx
│   │       ├── SleepForm.tsx
│   │       ├── MedForm.tsx
│   │       ├── DiaperForm.tsx
│   │       └── GrowthForm.tsx
│   ├── state/
│   │   ├── useServices.ts
│   │   ├── useBabies.ts
│   │   └── usePro.ts
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── mmkv.ts
│   │   ├── pdf.ts
│   │   └── charts.ts
│   ├── api/
│   │   ├── events.ts
│   │   ├── sync.ts
│   │   ├── local.ts
│   │   └── remote.ts
│   ├── data/
│   │   ├── types.ts
│   │   └── transforms.ts
│   ├── hooks/
│   │   ├── useEventSave.ts
│   │   └── useSyncGate.ts
│   └── theme/
│       ├── colors.ts
│       └── spacing.ts
│
└── README.md

Modèles de données (TypeScript)
export type ServiceType = "bottle" | "sleep" | "med" | "diaper" | "growth";

export interface Baby {
  id: string;
  name: string;
  color: string;
  photoUrl?: string;
  createdAt: number;
}

export interface BaseEvent {
  id: string;
  babyId: string;
  type: ServiceType;
  at: number;
  createdBy: string;
}

export interface BottleEvent extends BaseEvent {
  type: "bottle";
  ml: number;
  kind?: "breastmilk" | "formula" | "mixed";
}

Installation et lancement

Cloner le projet

git clone https://github.com/tonpseudo/Babyrons.git
cd Babyrons


Installer les dépendances

npm install


Lancer en développement

npx expo start


(Optionnel) Configurer Firebase
Crée un projet Firebase, active Firestore et ajoute ta configuration dans src/lib/firebase.ts :

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

Version Pro (2 €)

La version Babyrons Pro débloque :

Export PDF des historiques

Synchronisation Cloud multi-appareils

Thèmes pastel ou nuit

Gérée via expo-in-app-purchases.

Statistiques et export PDF (Pro)

Onglet Stats :

Moyenne des biberons par jour

Temps moyen de sieste

Graphique poids/taille

Bouton d’export PDF (Pro)

Généré avec pdf-lib.

Sauvegarde Cloud (Pro)

Synchronisation automatique via Firestore :

users/{uid}/babies
users/{uid}/events

Notifications (à venir)

Alerte “Prochain biberon dans 15 min”

Alerte “Vitamine D oubliée”

Roadmap
Étape	Objectif	Statut
S1–S2	Design + Navigation + Zustand + CRUD bébés	✅
S3	Service Biberons + Historique local	🔄
S4	Sommeil / Médicaments / Couches / Croissance	⏳
S5	Stats + Thèmes + Export PDF (Pro)	⏳
S6	Firebase Sync (Pro) + In-App Purchase	⏳
S7	Tests + Performance	⏳
S8	Publication Play Store / App Store	⏳
Contact

👨‍💻 Matthieu Gallice
📧 contact@babyrons.app
 (placeholder)
🌐 Instagram / Site à venir

Licence

MIT License — libre d’utilisation et d’adaptation.
© 2025 Babyrons.