import { redirect } from "next/navigation";
import { adminExists } from "@/lib/store/users";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (await adminExists()) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <h1>Khởi tạo tài khoản admin</h1>
        <p className="subtitle">
          Chỉ hiển thị một lần cho đến khi tài khoản admin đầu tiên được tạo.
        </p>
        <SetupForm />
      </div>
    </div>
  );
}
