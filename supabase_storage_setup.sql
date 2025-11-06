-- Script de configuration Supabase Storage pour les photos de bébés
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer le bucket pour les photos de bébés (si n'existe pas déjà)
INSERT INTO storage.buckets (id, name, public)
VALUES ('baby-photos', 'baby-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Activer RLS sur le bucket
-- Note: Les buckets sont créés avec RLS activé par défaut

-- 3. Politique pour permettre aux utilisateurs de lire leurs propres photos
-- (Le bucket est public, mais on peut restreindre l'accès si nécessaire)
DROP POLICY IF EXISTS "Users can view their own baby photos" ON storage.objects;
CREATE POLICY "Users can view their own baby photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'baby-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Politique pour permettre aux utilisateurs d'uploader leurs propres photos
DROP POLICY IF EXISTS "Users can upload their own baby photos" ON storage.objects;
CREATE POLICY "Users can upload their own baby photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'baby-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Politique pour permettre aux utilisateurs de mettre à jour leurs propres photos
DROP POLICY IF EXISTS "Users can update their own baby photos" ON storage.objects;
CREATE POLICY "Users can update their own baby photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'baby-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Politique pour permettre aux utilisateurs de supprimer leurs propres photos
DROP POLICY IF EXISTS "Users can delete their own baby photos" ON storage.objects;
CREATE POLICY "Users can delete their own baby photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'baby-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

