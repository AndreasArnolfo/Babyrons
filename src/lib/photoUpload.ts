import * as FileSystem from 'expo-file-system/legacy';
import { getSupabase } from '../utils/supabase';

const BUCKET_NAME = 'baby-photos';

/**
 * Upload une photo vers Supabase Storage
 * @param localUri URI locale de la photo (ex: file://...)
 * @param userId ID de l'utilisateur
 * @param babyId ID du bébé
 * @returns URL publique de la photo uploadée ou null en cas d'erreur
 */
export async function uploadBabyPhoto(
  localUri: string,
  userId: string,
  babyId: string
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('Supabase non configuré');
    return null;
  }

  try {
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${babyId}_${timestamp}_${randomId}.jpg`;
    const filePath = `${userId}/${fileName}`;

    // Lire le fichier - essayer fetch d'abord, sinon nouvelle API FileSystem
    let byteArray: Uint8Array;
    
    try {
      // Méthode 1: fetch (fonctionne sur web et certaines plateformes)
      const response = await fetch(localUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      byteArray = new Uint8Array(arrayBuffer);
    } catch (fetchError) {
      // Méthode 2: API legacy FileSystem (pour React Native)
      try {
        const base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Convertir base64 en Uint8Array
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        byteArray = new Uint8Array(byteNumbers);
      } catch (fileSystemError) {
        console.error('Erreur lors de la lecture du fichier:', fileSystemError);
        throw new Error('Impossible de lire le fichier');
      }
    }

    // Upload vers Supabase Storage (accepte Uint8Array)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, byteArray, {
        contentType: 'image/jpeg',
        upsert: false, // Ne pas écraser si existe déjà
      });

    if (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      return null;
    }

    // Obtenir l'URL publique de la photo
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo:', error);
    return null;
  }
}

/**
 * Supprime une photo du Supabase Storage
 * @param photoUrl URL publique de la photo à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteBabyPhoto(photoUrl: string | null): Promise<boolean> {
  if (!photoUrl) return true; // Pas de photo à supprimer

  const supabase = getSupabase();
  if (!supabase) {
    console.error('Supabase non configuré');
    return false;
  }

  try {
    // Extraire le chemin du fichier depuis l'URL publique
    const filePath = extractFilePathFromUrl(photoUrl);
    if (!filePath) {
      console.error('Impossible d\'extraire le chemin depuis l\'URL:', photoUrl);
      return false;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
    return false;
  }
}

/**
 * Extrait le chemin du fichier depuis une URL publique Supabase
 * @param photoUrl URL publique de la photo
 * @returns Chemin du fichier dans le bucket ou null
 */
function extractFilePathFromUrl(photoUrl: string): string | null {
  try {
    // Format: https://[project].supabase.co/storage/v1/object/public/baby-photos/[userId]/[fileName]
    const match = photoUrl.match(/\/baby-photos\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Migre une photo locale vers Supabase Storage
 * @param localUri URI locale de la photo (ex: file://...)
 * @param userId ID de l'utilisateur
 * @param babyId ID du bébé
 * @returns URL publique de la photo uploadée ou null en cas d'erreur
 */
export async function migrateLocalPhotoToStorage(
  localUri: string,
  userId: string,
  babyId: string
): Promise<string | null> {
  // Vérifier que c'est bien une URL locale
  if (!localUri || !localUri.startsWith('file://')) {
    return null;
  }

  // Vérifier que le fichier existe encore
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) {
      console.warn('Le fichier local n\'existe plus:', localUri);
      return null;
    }
  } catch (error) {
    console.warn('Erreur lors de la vérification du fichier:', error);
    return null;
  }

  // Uploader la photo
  return await uploadBabyPhoto(localUri, userId, babyId);
}

