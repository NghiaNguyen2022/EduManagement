export type OrganizationOption = {
  id: number;
  code: string;
  name: string;
  type: string;
};

type OrganizationSelectorProps = {
  organizations: OrganizationOption[];
  selectedId: number;
  onChange: (organizationId: number) => void;
};

export function OrganizationSelector({
  organizations,
  selectedId,
  onChange,
}: OrganizationSelectorProps) {
  const selected =
    organizations.find((item) => item.id === selectedId) ??
    organizations[0];

  return (
    <label className="organization-selector">
      <span className="organization-selector__mark">ED</span>

      <span className="organization-selector__text">
        <span className="organization-selector__label">Đơn vị đang làm việc</span>
        <span className="organization-selector__name">{selected?.name}</span>
      </span>

      <select
        aria-label="Chọn trường hoặc trung tâm"
        value={selectedId}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </label>
  );
}
