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
  const { addEvent, updateEvent, removeEvent } = useBabyStore();

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
                    addEvent(payload.new);
                }
                break;
              case "UPDATE":
                updateEvent(payload.new.id, payload.new);
                break;
              case "DELETE":
                removeEvent(payload.old.id);
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
