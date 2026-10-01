import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listPilots } from "@/lib/store/pilots";
import { getWorkApp } from "@/lib/work-apps";
import PilotStatusControl from "./PilotStatusControl";
export const dynamic = "force-dynamic";
export default async function PilotsPage() {
  await requireAdmin();
  const pilots = await listPilots();
  return (
    <main className="admin-shell">
      <div className="admin-topbar">
        <div>
          <p className="kicker">VIREON LABS</p>
          <h1>Đăng ký pilot</h1>
          <p>Tối đa 500 đăng ký gần nhất · {pilots.length} đăng ký hiển thị</p>
        </div>
        <Link className="button-ghost" href="/admin">
          ← Quản trị
        </Link>
      </div>
      <div className="work-panel">
        {pilots.length === 0 ? (
          <p>Chưa có đăng ký pilot.</p>
        ) : (
          pilots.map((pilot) => (
            <article className="demo-entry" key={pilot.id}>
              <div className="demo-section-head">
                <div>
                  <p className="kicker">
                    {getWorkApp(pilot.app_slug)?.title || pilot.app_slug}
                  </p>
                  <h2>
                    {pilot.name} · {pilot.organization}
                  </h2>
                  <p>{pilot.contact}</p>
                </div>
                <PilotStatusControl id={pilot.id} status={pilot.status} />
              </div>
              <p className="demo-pre">{pilot.need}</p>
              <small>
                {new Date(pilot.created_at).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </small>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
