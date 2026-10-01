import { redirect } from "next/navigation";
import { adminExists } from "@/lib/store/users";
import { isAdminAuthenticated } from "@/lib/auth/session";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!(await adminExists())) {
    redirect("/admin/setup");
  }
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <h1>Đăng nhập quản trị</h1>
        <p className="subtitle">Vireon Admin — không gian số nội bộ.</p>
        <LoginForm />
      </div>
    </div>
  );
}
