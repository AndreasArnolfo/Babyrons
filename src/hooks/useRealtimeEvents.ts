import { useEffect } from "react";
import { getSupabase } from "@/src/utils/supabase";
import { useBabyStore } from "@/src/state/useBabyStore";

/**
 * ✅ Version automatique :
 * détecte si la colonne user_id contient un email ou un UUID
 * et s'abonne aux bons changements Realtime
 */
export function useRealtimeEvents() {
  const supabase = getSupabase();
  const { addEventFromSupabase, updateEventFromSupabase, removeEventFromSupabase } = useBabyStore();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // --- 1️⃣ Récupère l'utilisateur connecté ---
      const { data: u } = await supabase.auth.getUser();
      const user = u?.user;
      if (!user) {
        console.log("⚠️ Aucun utilisateur connecté, realtime non activé.");
        return;
      }

      // --- 2️⃣ Détermine automatiquement si user_id = UUID ou email ---
      let filterValue: string | null = user.id; // on suppose UUID par défaut
      try {
        const { data } = await supabase
          .from("events")
          .select("user_id")
          .limit(1);

        const sample = data?.[0]?.user_id ?? "";
        if (sample && sample.includes("@")) {
          filterValue = user.email ?? null;
        }
      } catch (e) {
        console.log("🔎 Impossible de détecter le type de user_id :", e);
      }

      // --- 3️⃣ Construction du canal Realtime ---
      const filterObj =
        filterValue !== null
          ? { filter: `user_id=eq.${filterValue}` }
          : {};

      console.log("🧩 Abonnement Realtime avec filtre :", filterObj);

      channel = supabase
        .channel("events-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "events", ...filterObj },
          (payload) => {
            console.log("📡 Realtime reçu :", payload.eventType, payload);

            switch (payload.eventType) {
              case "INSERT":
                const exists = useBabyStore
                    .getState()
                    .events.some((e) => e.id === payload.new.id);
                if (!exists) {
                    // Convertir les données Supabase au format Event local
                    const babyId = payload.new.baby_id;
                    console.log("🔍 Conversion événement realtime - baby_id:", babyId, "type:", typeof babyId);
                    console.log("🔍 Bébés disponibles:", useBabyStore.getState().babies.map(b => ({ id: b.id, name: b.name })));
                    
                    const eventData: Omit<Event, 'id' | 'createdBy'> = {
                      babyId: babyId,
                      type: payload.new.type,
                      at: Number(payload.new.at),
                      // Champs optionnels selon le type
                      ml: payload.new.ml ?? undefined,
                      kind: payload.new.kind ?? undefined,
                      startAt: payload.new.start_at ?? undefined,
                      endAt: payload.new.end_at ?? undefined,
                      duration: payload.new.duration ?? undefined,
                      name: payload.new.name ?? undefined,
                      dose: payload.new.dose ?? undefined,
                      note: payload.new.note ?? undefined,
                      weightKg: payload.new.weight_kg ?? undefined,
                      heightCm: payload.new.height_cm ?? undefined,
                      headCircumferenceCm: payload.new.head_circumference_cm ?? undefined,
                    };
                    // Créer l'événement avec l'ID de Supabase
                    const newEvent = {
                      ...eventData,
                      id: payload.new.id,
                      createdBy: 'remote',
                    } as Event;
                    console.log("✅ Événement converti:", { id: newEvent.id, babyId: newEvent.babyId, type: newEvent.type });
                    // Ajouter l'événement au store (sans déclencher d'upsert)
                    addEventFromSupabase(newEvent);
                }
                break;
              case "UPDATE":
                // Convertir les données Supabase au format local
                console.log("🔄 Mise à jour événement realtime:", payload.new.id);
                const updates: Partial<Event> = {
                  babyId: payload.new.baby_id,
                  type: payload.new.type,
                  at: Number(payload.new.at),
                  ml: payload.new.ml ?? undefined,
                  kind: payload.new.kind ?? undefined,
                  startAt: payload.new.start_at ?? undefined,
                  endAt: payload.new.end_at ?? undefined,
                  duration: payload.new.duration ?? undefined,
                  name: payload.new.name ?? undefined,
                  dose: payload.new.dose ?? undefined,
                  note: payload.new.note ?? undefined,
                  weightKg: payload.new.weight_kg ?? undefined,
                  heightCm: payload.new.height_cm ?? undefined,
                  headCircumferenceCm: payload.new.head_circumference_cm ?? undefined,
                };
                console.log("✅ Mise à jour appliquée:", { id: payload.new.id, updates });
                updateEventFromSupabase(payload.new.id, updates);
                break;
              case "DELETE":
                console.log("🗑️ Suppression événement realtime:", payload.old.id);
                removeEventFromSupabase(payload.old.id);
                break;
            }
          }
        )
        .subscribe((status) => {
          console.log("🔄 Canal Realtime status:", status);
        });
    })();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        console.log("🧹 Canal Realtime fermé");
      }
    };
  }, []);
}
