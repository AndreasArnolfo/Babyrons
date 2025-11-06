import { useEffect } from "react";
import { getSupabase } from "@/src/utils/supabase";
import { useBabyStore } from "@/src/state/useBabyStore";

export function useRealtimeBabies() {
  const supabase = getSupabase();
  const { addBabyFromSupabase, updateBabyFromSupabase, removeBabyFromSupabase } = useBabyStore();

  useEffect(() => {
    console.log("👶 useRealtimeBabies monté");

    // on garde la référence du canal pour le cleanup
    const channel = supabase
      .channel("babies-sync", { config: { broadcast: { ack: true } } })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "babies" },
        (payload) => {
          console.log("📡 Realtime bébé reçu :", payload.eventType, payload);

          switch (payload.eventType) {
            case "INSERT":
              // ✅ éviter les doublons et convertir les données Supabase au format local
              if (
                !useBabyStore
                  .getState()
                  .babies.some((b) => b.id === payload.new.id)
              ) {
                // Convertir les données Supabase au format ExtendedBaby
                const baby: ExtendedBaby = {
                  id: payload.new.id,
                  name: payload.new.name,
                  color: payload.new.color || null,
                  photo: payload.new.photo ?? null,
                  gender: payload.new.gender ?? null,
                  birthDate: payload.new.birth_date ? Number(payload.new.birth_date) : null,
                  createdAt: Number(payload.new.created_at) || Date.now(),
                };
                addBabyFromSupabase(baby);
              }
              break;

            case "UPDATE":
              // Convertir les données Supabase au format local
              console.log("🔄 Mise à jour bébé realtime:", payload.new.id);
              const updates: Partial<ExtendedBaby> = {
                name: payload.new.name,
                color: payload.new.color || null,
                photo: payload.new.photo ?? null,
                gender: payload.new.gender ?? null,
                birthDate: payload.new.birth_date ? Number(payload.new.birth_date) : null,
              };
              console.log("✅ Mise à jour appliquée:", { id: payload.new.id, updates });
              updateBabyFromSupabase(payload.new.id, updates);
              break;

            case "DELETE":
              console.log("🗑️ Suppression bébé realtime:", payload.old.id);
              removeBabyFromSupabase(payload.old.id);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log("🔄 Canal babies-sync status:", status);
      });

    return () => {
      console.log("🧹 useRealtimeBabies démonté");
      supabase.removeChannel(channel);
    };
  }, []);
}
