export function hasAnyPermission(input: {
  grantedPermissions: readonly string[];
  requiredPermissions: readonly string[];
}) {
  return (
    input.grantedPermissions.includes("he_thong.quan_tri") ||
    input.requiredPermissions.some((code) => input.grantedPermissions.includes(code))
  );
}

export function hasAnyPermissionOrRole(input: {
  grantedPermissions: readonly string[];
  grantedRoles: readonly string[];
  requiredPermissions: readonly string[];
  requiredRoles: readonly string[];
}) {
  return (
    hasAnyPermission({
      grantedPermissions: input.grantedPermissions,
      requiredPermissions: input.requiredPermissions,
    }) ||
    input.requiredRoles.some((code) => input.grantedRoles.includes(code))
  );
}
