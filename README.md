# 🍼 Babyrons — Suivi des bébés (spécial jumeaux)

**Babyrons** est une application simple et intuitive pour suivre les **biberons, siestes, couches, médicaments et la croissance** de vos bébés — conçue **pour les parents de jumeaux et triplés**.  

💰 **Version gratuite** : complète, sans pub.  
🌈 **Version Pro (2 €)** : export PDF, synchronisation Cloud et thèmes personnalisables.

---

## 🎯 Objectifs

- Suivre facilement les besoins des bébés (repas, sommeil, soins, croissance).  
- Gérer plusieurs bébés à la fois grâce à une interface claire et fluide.  
- Activer ou désactiver les services (biberons, sommeil, etc.) selon vos besoins.  
- Offrir une **version Pro** à petit prix avec des outils avancés (PDF, Cloud, thèmes).  
- Rester **simple, fiable et sans abonnement**.

---

## 🧩 Fonctionnalités principales

| Fonctionnalité | Gratuit | Pro |
|----------------|:--------:|:---:|
| Multi-bébé (illimité) | ✅ | ✅ |
| Suivi des biberons (heure, quantité, type) | ✅ | ✅ |
| Suivi du sommeil / sieste | ✅ | ✅ |
| Médicaments / Vitamine D | ✅ | ✅ |
| Couches | ✅ | ✅ |
| Croissance (poids, taille, périmètre crânien) | ✅ | ✅ |
| Activation / désactivation des services | ✅ | ✅ |
| Historique détaillé (timeline) | ✅ | ✅ |
| Statistiques par bébé et par jour | ✅ | ✅ |
| Export PDF / CSV | ❌ | ✅ |
| Synchronisation Cloud (Firebase / Supabase) | ❌ | ✅ |
| Thèmes personnalisables (pastel, nuit) | ❌ | ✅ |

---

## 📱 Aperçu

👉 Voir le fichier : **`Babyrons_wireframes.pdf`** (maquette exportée depuis Figma).

---

## ⚙️ Stack technique

### Front-end
- **React Native** + **Expo**
- **TypeScript**
- **React Navigation**
- **Zustand** (état global)
- **MMKV** (stockage local ultra rapide)
- **Victory Native** (graphiques)
- **pdf-lib** (export PDF)
- **expo-in-app-purchases** (achats intégrés)

### Back-end (version Pro)
- **Firebase** ou **Supabase** :
  - Authentification
  - Firestore / Realtime DB
  - Cloud Storage (photos des bébés)

---

## 🧱 Structure du projet

Babyrons/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx          # Accueil (Dashboard)
│   │   ├── history.tsx        # Historique
│   │   ├── stats.tsx          # Statistiques
│   │   └── settings.tsx       # Paramètres
│   └── modals/
│       ├── add-event.tsx      # Ajout (biberon / sommeil / etc.)
│       └── manage-baby.tsx    # Gestion des bébés
│
├── src/
│   ├── components/            # Composants réutilisables
│   ├── state/                 # Stores Zustand
│   ├── lib/                   # Firebase, MMKV, PDF...
│   ├── api/                   # Gestion locale / cloud
│   ├── data/                  # Types et modèles
│   ├── hooks/                 # Hooks personnalisés
│   └── theme/                 # Couleurs et espacements
│
└── README.md

---

## 🧠 Modèles de données (TypeScript)

```ts
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
🚀 Installation & lancement
1️⃣ Cloner le projet
bash
Copier le code
git clone https://github.com/tonpseudo/Babyrons.git
cd Babyrons
2️⃣ Installer les dépendances
bash
Copier le code
npm install
3️⃣ Lancer le projet
bash
Copier le code
npx expo start
4️⃣ (Optionnel) Configurer Firebase
Crée un projet Firebase, active Firestore et ajoute ta configuration dans src/lib/firebase.ts :

ts
Copier le code
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
💰 Version Pro (2 €)
La version Babyrons Pro débloque :

Export PDF des historiques

Synchronisation Cloud multi-appareils

Thèmes pastel ou nuit

Gérée via expo-in-app-purchases :

ts
Copier le code
import * as InAppPurchases from 'expo-in-app-purchases';
📊 Statistiques et export PDF (Pro)
Moyenne des biberons par jour

Temps moyen de sieste

Graphiques de croissance

Bouton “Exporter en PDF” pour générer un rapport complet

Export réalisé avec pdf-lib.

☁️ Sauvegarde Cloud (Pro)
Synchro automatique via Firestore :

bash
Copier le code
users/{uid}/babies
users/{uid}/events
🔔 Notifications (à venir)
Rappel “Prochain biberon dans 15 min”

Rappel “Vitamine D oubliée”

🗓️ Roadmap de développement
Étape	Objectif	Statut
S1–S2	Design + Navigation + Zustand + CRUD bébés	✅
S3	Service Biberons + Historique local	🔄
S4	Sommeil / Médicaments / Couches / Croissance	⏳
S5	Stats + Thèmes + Export PDF (Pro)	⏳
S6	Firebase Sync (Pro) + In-App Purchase	⏳
S7	Tests + Optimisations	⏳
S8	Publication sur Play Store / App Store	⏳

👨‍💻 Contact
Auteur : Andreas Arnolfo & Matthieu Gallice
📧 contact@babyrons.app (placeholder)
🌐 Instagram / Site à venir

⚖️ Licence
MIT License — libre d’utilisation et d’adaptation.
© 2025 Babyrons.
 (placeholder)
🌐 Instagram / Site à venir

Licence

MIT License — libre d’utilisation et d’adaptation.
© 2025 Babyrons.
