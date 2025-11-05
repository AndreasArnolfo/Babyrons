-- Migration SQL pour Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase pour créer/mettre à jour votre schéma

-- 1. Créer la table babies si elle n'existe pas
CREATE TABLE IF NOT EXISTS babies (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  photo TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_date BIGINT,
  created_at BIGINT NOT NULL
);

-- 2. Créer la table events si elle n'existe pas
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_id TEXT NOT NULL,
  type TEXT NOT NULL,
  at BIGINT NOT NULL,
  -- Champs optionnels selon le type d'événement
  ml INTEGER,
  kind TEXT,
  start_at BIGINT,
  end_at BIGINT,
  duration INTEGER,
  name TEXT,
  dose TEXT,
  note TEXT,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  head_circumference_cm NUMERIC
);

-- 3. Créer la table settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled_services TEXT[] DEFAULT ARRAY['bottle', 'sleep', 'med', 'diaper', 'growth'],
  theme TEXT DEFAULT 'pastel' CHECK (theme IN ('light', 'dark', 'pastel')),
  is_pro BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ajouter les colonnes manquantes à babies si elles n'existent pas déjà
DO $$ 
BEGIN
  -- Ajouter gender si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='babies' AND column_name='gender') THEN
    ALTER TABLE babies ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female'));
  END IF;
  
  -- Ajouter birth_date si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='babies' AND column_name='birth_date') THEN
    ALTER TABLE babies ADD COLUMN birth_date BIGINT;
  END IF;
  
  -- Ajouter photo si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='babies' AND column_name='photo') THEN
    ALTER TABLE babies ADD COLUMN photo TEXT;
  END IF;
  
  -- Si photo_url existe, la renommer en photo
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='babies' AND column_name='photo_url') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='babies' AND column_name='photo') THEN
    ALTER TABLE babies RENAME COLUMN photo_url TO photo;
  END IF;
END $$;

-- 5. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_babies_user_id ON babies(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_baby_id ON events(baby_id);

-- 6. Activer Row Level Security (RLS) sur les tables
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques RLS pour babies
DROP POLICY IF EXISTS "Users can view their own babies" ON babies;
CREATE POLICY "Users can view their own babies"
  ON babies FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own babies" ON babies;
CREATE POLICY "Users can insert their own babies"
  ON babies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own babies" ON babies;
CREATE POLICY "Users can update their own babies"
  ON babies FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own babies" ON babies;
CREATE POLICY "Users can delete their own babies"
  ON babies FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Créer les politiques RLS pour events
DROP POLICY IF EXISTS "Users can view their own events" ON events;
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own events" ON events;
CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own events" ON events;
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own events" ON events;
CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- 9. Créer les politiques RLS pour settings
DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;
CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON settings;
CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = user_id);

-- 10. Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer un trigger pour mettre à jour updated_at sur settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
