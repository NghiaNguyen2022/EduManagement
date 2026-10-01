import { useAuth } from "../features/auth/AuthContext";

export function SelectOrganizationPage() {
  const { auth, selectOrganization } = useAuth();

  return (
    <main className="organization-page">
      <section className="organization-page__header">
        <h1>Chọn đơn vị làm việc</h1>
        <p>
          Chọn trường hoặc trung tâm bạn muốn truy cập trong phiên này.
        </p>
      </section>

      <section className="organization-grid">
        {auth?.organizations.map((organization) => (
          <button
            type="button"
            className="organization-card"
            key={organization.id}
            onClick={() =>
              void selectOrganization(organization.id)
            }
          >
            <span className="organization-card__mark">ED</span>
            <strong>{organization.tenDonVi}</strong>
            <small>{organization.maDonVi}</small>
            <span>Truy cập đơn vị →</span>
          </button>
        ))}
      </section>
    </main>
  );
}
