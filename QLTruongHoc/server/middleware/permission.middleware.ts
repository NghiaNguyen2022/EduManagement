import type {
  NextFunction,
  Request,
  Response,
} from "express";

export function requireCurrentOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.auth?.currentOrganization) {
    res.status(409).json({
      ok: false,
      error: "Vui lòng chọn đơn vị làm việc.",
    });
    return;
  }

  next();
}

export function requirePermission(permissionCode: string) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const organization = req.auth?.currentOrganization;

    if (!organization) {
      res.status(409).json({
        ok: false,
        error: "Vui lòng chọn đơn vị làm việc.",
      });
      return;
    }

    const isSystemAdmin = organization.quyen.includes(
      "he_thong.quan_tri",
    );

    if (
      !isSystemAdmin &&
      !organization.quyen.includes(permissionCode)
    ) {
      res.status(403).json({
        ok: false,
        error: "Bạn không có quyền thực hiện thao tác này.",
      });
      return;
    }

    next();
  };
}
