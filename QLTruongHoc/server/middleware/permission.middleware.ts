import type { NextFunction, Request, Response } from "express";

export function requireCurrentOrganization(req: Request, res: Response, next: NextFunction) {
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
  return (req: Request, res: Response, next: NextFunction) => {
    const organization = req.auth?.currentOrganization;

    if (!organization) {
      res.status(409).json({
        ok: false,
        error: "Vui lòng chọn đơn vị làm việc.",
      });
      return;
    }

    const isSystemAdmin = organization.quyen.includes("he_thong.quan_tri");

    if (!isSystemAdmin && !organization.quyen.includes(permissionCode)) {
      res.status(403).json({
        ok: false,
        error: "Bạn không có quyền thực hiện thao tác này.",
      });
      return;
    }

    next();
  };
}

/**
 * Cho phép thao tác nếu người dùng có ÍT NHẤT MỘT trong các mã quyền được liệt kê.
 * Dùng cho hành động hợp lý với từ hai vai trò trở lên, tránh phải cấp chéo quyền
 * cho từng vai trò riêng lẻ.
 */
export function requireAnyPermission(permissionCodes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const organization = req.auth?.currentOrganization;

    if (!organization) {
      res.status(409).json({
        ok: false,
        error: "Vui lòng chọn đơn vị làm việc.",
      });
      return;
    }

    const isSystemAdmin = organization.quyen.includes("he_thong.quan_tri");

    const hasAny = permissionCodes.some((code) => organization.quyen.includes(code));

    if (!isSystemAdmin && !hasAny) {
      res.status(403).json({
        ok: false,
        error: "Bạn không có quyền thực hiện thao tác này.",
      });
      return;
    }

    next();
  };
}

/**
 * Cho phép thao tác nếu có ít nhất một mã quyền được liệt kê, HOẶC vai trò tại
 * đơn vị hiện tại nằm trong danh sách vai trò được liệt kê. Dùng cho các thao
 * tác "chỉ xem" mà một vai trò không có hệ thống mã quyền riêng (ví dụ
 * `phu_huynh`) vẫn cần truy cập được — theo đúng cách `portal.router.ts` đã
 * kiểm tra `vaiTro` trực tiếp, không cấp thêm mã quyền quản lý cho vai trò đó.
 */
export function requireAnyPermissionOrRole(permissionCodes: string[], roleCodes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const organization = req.auth?.currentOrganization;

    if (!organization) {
      res.status(409).json({
        ok: false,
        error: "Vui lòng chọn đơn vị làm việc.",
      });
      return;
    }

    const isSystemAdmin = organization.quyen.includes("he_thong.quan_tri");

    const hasAnyPermission = permissionCodes.some((code) => organization.quyen.includes(code));

    const hasAnyRole = roleCodes.some((code) => organization.vaiTro.includes(code));

    if (!isSystemAdmin && !hasAnyPermission && !hasAnyRole) {
      res.status(403).json({
        ok: false,
        error: "Bạn không có quyền thực hiện thao tác này.",
      });
      return;
    }

    next();
  };
}
