// ... (imports)
import { ExtendedBaby } from "@/src/data/types";
import { useEffect } from "react";
// ...
import { getSupabase } from "@/src/utils/supabase";
import { useBabyStore } from "@/src/state/useBabyStore";

export function useRealtimeBabies() {
  const supabase = getSupabase();
  const { addBabyFromSupabase, updateBabyFromSupabase, removeBabyFromSupabase } = useBabyStore();

  useEffect(() => {
    if (!supabase) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // --- 1️⃣ Récupère l'utilisateur connecté ---
      const { data: u } = await supabase.auth.getUser();
      const user = u?.user;
      if (!user) {
        console.log("⚠️ Aucun utilisateur connecté, realtime bébés non activé.");
        return;
      }

      // --- 2️⃣ Détermine automatiquement si user_id = UUID ou email ---
      let filterValue: string | null = user.id; // on suppose UUID par défaut
      try {
        const { data } = await supabase
          .from("babies")
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
      // Pour INSERT/UPDATE, on utilise le filtre
      // Pour DELETE, on écoute tout et on filtre manuellement (car les filtres ne fonctionnent pas toujours avec DELETE)
      const filterObj =
        filterValue !== null
          ? { filter: `user_id=eq.${filterValue}` }
          : {};

      console.log("🧩 Abonnement Realtime bébés avec filtre :", filterObj);

      // Canal pour INSERT et UPDATE avec filtre
      channel = supabase
        .channel("babies-sync", { config: { broadcast: { ack: true } } })
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "babies", ...filterObj },
          (payload) => {
            console.log("📡 Realtime bébé INSERT reçu :", payload);
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
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "babies", ...filterObj },
          (payload) => {
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
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "babies" },
          (payload) => {
            console.log("🗑️ Suppression bébé realtime - payload complet:", JSON.stringify(payload, null, 2));
            // Vérifier que le bébé supprimé appartient à cet utilisateur
            if (payload.old?.id) {
              const babyId = payload.old.id;
              // Vérifier si le bébé existe dans notre store local
              // Si oui, c'est qu'il nous appartient (on ne charge que nos bébés)
              const babyExists = useBabyStore.getState().babies.some(b => b.id === babyId);
              
              if (babyExists) {
                console.log("✅ Suppression du bébé avec ID:", babyId);
                removeBabyFromSupabase(babyId);
              } else {
                // Si le bébé n'existe pas dans notre store, vérifier le user_id si disponible
                const deletedUserId = payload.old.user_id;
                if (deletedUserId && filterValue && deletedUserId === filterValue) {
                  console.log("✅ Suppression du bébé avec ID (vérifié par user_id):", babyId);
                  removeBabyFromSupabase(babyId);
                } else {
                  console.log("⏭️ Suppression ignorée (bébé n'existe pas dans le store local)", {
                    babyId,
                    babyExists,
                    deletedUserId,
                    filterValue
                  });
                }
              }
            } else {
              console.error("❌ Pas d'ID dans payload.old pour DELETE:", payload);
            }
          }
        )
      .subscribe((status) => {
        console.log("🔄 Canal babies-sync status:", status);
      });
    })();

    return () => {
      if (channel) {
        console.log("🧹 useRealtimeBabies démonté");
        supabase.removeChannel(channel);
      }
    };
  }, []);
}
