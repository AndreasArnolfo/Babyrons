# Configuration Supabase pour Babyrons

Ce document explique comment configurer votre base de données Supabase pour que toutes les données de l'application soient synchronisées.

## Prérequis

1. Un projet Supabase créé
2. Les variables d'environnement configurées dans votre `.env` ou `.env.local` :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=votre-clé-anon
   ```

## Instructions

### 1. Exécuter le script SQL de migration

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `supabase_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter le script

Ce script va :
- ✅ Ajouter les colonnes `gender`, `birth_date` et `photo` à la table `babies`
- ✅ Créer la table `settings` pour stocker les préférences utilisateur
- ✅ Activer Row Level Security (RLS) sur toutes les tables
- ✅ Créer les politiques de sécurité pour que chaque utilisateur ne voie que ses propres données

### 2. Vérifier les tables

Après l'exécution, vous devriez avoir :

- **Table `babies`** avec les colonnes :
  - `id` (UUID ou TEXT)
  - `user_id` (UUID, référence auth.users)
  - `name` (TEXT)
  - `color` (TEXT)
  - `photo` (TEXT, nullable)
  - `gender` (TEXT, nullable: 'male', 'female', ou null)
  - `birth_date` (BIGINT, nullable)
  - `created_at` (BIGINT ou TIMESTAMPTZ)

- **Table `events`** avec les colonnes :
  - `id` (UUID ou TEXT)
  - `user_id` (UUID, référence auth.users)
  - `baby_id` (UUID ou TEXT, référence babies)
  - `type` (TEXT)
  - `at` (BIGINT)
  - Et tous les champs optionnels selon le type d'événement

- **Table `settings`** avec les colonnes :
  - `user_id` (UUID, PRIMARY KEY, référence auth.users)
  - `enabled_services` (TEXT[])
  - `theme` (TEXT)
  - `is_pro` (BOOLEAN)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

### 3. Tester la synchronisation

Une fois le schéma mis à jour :

1. Lancez l'application
2. Connectez-vous avec un compte utilisateur
3. Ajoutez un bébé avec photo, genre et date de naissance
4. Ajoutez quelques événements
5. Modifiez les paramètres
6. Vérifiez dans Supabase que toutes les données sont bien sauvegardées

## Notes importantes

- **Sécurité** : Les politiques RLS garantissent que chaque utilisateur ne peut accéder qu'à ses propres données
- **Synchronisation** : Les données sont sauvegardées à la fois localement (pour le mode hors ligne) et dans Supabase (pour la synchronisation multi-appareils)
- **Performance** : Les opérations Supabase sont asynchrones et n'empêchent pas l'utilisation de l'application si la connexion est lente

## Dépannage

Si vous rencontrez des erreurs :

1. **"Column does not exist"** : Vérifiez que toutes les colonnes ont été ajoutées à la table `babies`
2. **"Table does not exist"** : Vérifiez que la table `settings` a été créée
3. **"Permission denied"** : Vérifiez que les politiques RLS sont bien créées et actives
4. **"Invalid input syntax"** : Vérifiez que les types de données correspondent (BIGINT pour les timestamps, TEXT[] pour les tableaux)

