import { getSupabase } from '../utils/supabase';
import { Baby, Event, AppSettings } from '../data/types';

// Babies
export async function fetchBabies(userId: string): Promise<Baby[]> {
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
    photoUrl: row.photo_url ?? undefined,
    createdAt: Number(row.created_at) || Date.now(),
  }));
}

export async function upsertBaby(userId: string, baby: Baby): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('babies').upsert({
    id: baby.id,
    user_id: userId,
    name: baby.name,
    color: baby.color,
    photo_url: baby.photoUrl ?? null,
    created_at: baby.createdAt,
  });
  if (error) console.warn('upsertBaby error', error.message);
}

export async function deleteBabyAndEvents(userId: string, babyId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  // Delete events first
  const delEvents = await supabase.from('events').delete().match({ user_id: userId, baby_id: babyId });
  if (delEvents.error) console.warn('delete events error', delEvents.error.message);
  const delBaby = await supabase.from('babies').delete().match({ user_id: userId, id: babyId });
  if (delBaby.error) console.warn('delete baby error', delBaby.error.message);
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


