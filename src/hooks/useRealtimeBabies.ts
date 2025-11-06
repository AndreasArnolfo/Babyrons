import { useEffect } from "react";
import { getSupabase } from "@/src/utils/supabase";
import { useBabyStore } from "@/src/state/useBabyStore";

export function useRealtimeBabies() {
  const supabase = getSupabase();
  const { addBaby, updateBaby, removeBaby } = useBabyStore();

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
              // ✅ éviter les doublons
              if (
                !useBabyStore
                  .getState()
                  .babies.some((b) => b.id === payload.new.id)
              ) {
                addBaby(payload.new);
              }
              break;

            case "UPDATE":
              updateBaby(payload.new.id, payload.new);
              break;

            case "DELETE":
              removeBaby(payload.old.id);
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
