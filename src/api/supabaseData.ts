import { getSupabase } from '../utils/supabase';
import { Baby, Event, AppSettings } from '../data/types';
import { ExtendedBaby } from '../state/useBabyStore';

// Babies
export async function fetchBabies(userId: string): Promise<ExtendedBaby[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('fetchBabies error', error.message);
    return [];
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    photo: row.photo ?? null,
    gender: row.gender ?? null,
    birthDate: row.birth_date ? Number(row.birth_date) : null,
    createdAt: Number(row.created_at) || Date.now(),
  }));
}

export async function upsertBaby(userId: string, baby: ExtendedBaby): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  
  // Migrer la photo locale vers Storage si nécessaire
  let photoUrl = baby.photo;
  if (photoUrl && photoUrl.startsWith('file://')) {
    const { migrateLocalPhotoToStorage } = await import('../lib/photoUpload');
    const migratedUrl = await migrateLocalPhotoToStorage(
      photoUrl,
      userId,
      baby.id
    );
    if (migratedUrl) {
      photoUrl = migratedUrl;
    } else {
      // Si la migration échoue, mettre null (photo perdue)
      console.warn(`Impossible de migrer la photo locale pour ${baby.name}`);
      photoUrl = null;
    }
  }
  
  const { error } = await supabase.from('babies').upsert({
    id: baby.id,
    user_id: userId,
    name: baby.name,
    color: baby.color,
    photo: photoUrl ?? null,
    gender: baby.gender ?? null,
    birth_date: baby.birthDate ?? null,
    created_at: baby.createdAt,
  });
  if (error) console.warn('upsertBaby error', error.message);
}

export async function deleteBabyAndEvents(userId: string, babyId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  
  // Récupérer le bébé pour obtenir l'URL de la photo avant suppression
  const { data: babyData } = await supabase
    .from('babies')
    .select('photo')
    .eq('user_id', userId)
    .eq('id', babyId)
    .single();
  
  // Delete events first
  const delEvents = await supabase.from('events').delete().match({ user_id: userId, baby_id: babyId });
  if (delEvents.error) console.warn('delete events error', delEvents.error.message);
  
  // Delete baby
  const delBaby = await supabase.from('babies').delete().match({ user_id: userId, id: babyId });
  if (delBaby.error) console.warn('delete baby error', delBaby.error.message);
  
  // Delete photo from storage if exists
  if (babyData?.photo) {
    const { deleteBabyPhoto } = await import('../lib/photoUpload');
    await deleteBabyPhoto(babyData.photo);
  }
}

// Events
export async function fetchEvents(userId: string): Promise<Event[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('at', { ascending: false });
  if (error) {
    console.warn('fetchEvents error', error.message);
    return [];
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    babyId: row.baby_id,
    type: row.type,
    at: Number(row.at),
    createdBy: 'remote',
    // optional fields
    ml: row.ml ?? undefined,
    kind: row.kind ?? undefined,
    startAt: row.start_at ?? undefined,
    endAt: row.end_at ?? undefined,
    duration: row.duration ?? undefined,
    name: row.name ?? undefined,
    dose: row.dose ?? undefined,
    note: row.note ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    heightCm: row.height_cm ?? undefined,
    headCircumferenceCm: row.head_circumference_cm ?? undefined,
  })) as Event[];
}

export async function upsertEvent(userId: string, event: Event): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('events').upsert({
    id: event.id,
    user_id: userId,
    baby_id: event.babyId,
    type: event.type,
    at: event.at,
    ml: (event as any).ml ?? null,
    kind: (event as any).kind ?? null,
    start_at: (event as any).startAt ?? null,
    end_at: (event as any).endAt ?? null,
    duration: (event as any).duration ?? null,
    name: (event as any).name ?? null,
    dose: (event as any).dose ?? null,
    note: (event as any).note ?? null,
    weight_kg: (event as any).weightKg ?? null,
    height_cm: (event as any).heightCm ?? null,
    head_circumference_cm: (event as any).headCircumferenceCm ?? null,
  });
  if (error) console.warn('upsertEvent error', error.message);
}

export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('events').delete().match({ user_id: userId, id: eventId });
  if (error) console.warn('deleteEvent error', error.message);
}

// Settings
export async function fetchSettings(userId: string): Promise<AppSettings | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.warn('fetchSettings error', error.message);
    return null;
  }
  if (!data) return null;
  return {
    enabledServices: data.enabled_services || ['bottle', 'sleep', 'med', 'diaper', 'growth'],
    theme: data.theme || 'pastel',
    isPro: data.is_pro || false,
  };
}

export async function upsertSettings(userId: string, settings: AppSettings): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('settings').upsert({
    user_id: userId,
    enabled_services: settings.enabledServices,
    theme: settings.theme,
    is_pro: settings.isPro,
  });
  if (error) console.warn('upsertSettings error', error.message);
}


