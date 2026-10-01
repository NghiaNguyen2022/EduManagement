"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  pilotStatuses,
  pilotStatusLabels,
  type PilotStatus,
} from "@/lib/pilot-validation";
export default function PilotStatusControl({
  id,
  status,
}: {
  id: string;
  status: PilotStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <select
        aria-label="Trạng thái đăng ký"
        value={status}
        disabled={busy}
        onChange={async (e) => {
          setBusy(true);
          setError("");
          try {
            const response = await fetch(`/api/admin/pilots/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: e.target.value }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể kết nối.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {pilotStatuses.map((s) => (
          <option key={s} value={s}>
            {pilotStatusLabels[s]}
          </option>
        ))}
      </select>
      <p role="status">{error}</p>
    </div>
  );
}
