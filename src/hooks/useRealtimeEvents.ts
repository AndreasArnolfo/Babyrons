import { useEffect } from "react";
import { getSupabase } from "@/src/utils/supabase";
import { useBabyStore } from "@/src/state/useBabyStore";
import { Event } from "@/src/data/types";

/**
 * Écoute en temps réel les modifications sur la table events,
 * pour le user actuellement connecté.
 */
export function useRealtimeEvents() {
  const supabase = getSupabase()!;
  const { addEvent, updateEvent, removeEvent } = useBabyStore();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let activeUserId: string | null = null;

    async function init() {
      const { data } = await supabase.auth.getUser();
      activeUserId = data?.user?.id ?? null;

      if (!activeUserId) return;


      channel = supabase
        .channel("events-sync")
        .on(
          "postgres_changes",
          {
            event: "*", // INSERT / UPDATE / DELETE
            schema: "public",
            table: "events",
            filter: `createdBy=eq.${activeUserId}`,
          },
          (payload) => {

            switch (payload.eventType) {
              case "INSERT":
                addEvent(payload.new as Omit<Event, "id" | "createdBy">);
                break;
              case "UPDATE":
                updateEvent(payload.new.id, payload.new as Event);
                break;
              case "DELETE":
                removeEvent(payload.old.id);
                break;
            }
          }
        )
        .subscribe((status) => {
        });
    }

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
}
