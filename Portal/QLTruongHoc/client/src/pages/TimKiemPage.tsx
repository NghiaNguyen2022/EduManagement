import { useState } from "react";

import { TextField } from "../components/form";
import { EntityLink, OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { searchAllDonViApi } from "../features/timKiem/timKiemApi";
import type { TimKiemResult } from "../features/timKiem/timKiemApi";

const empty: TimKiemResult = { hocSinh: [], giaoVien: [], lopHoc: [] };

export function TimKiemPage() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<TimKiemResult>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (keyword.trim().length < 2) {
      setError("Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.");
      return;
    }

    setLoading(true);

    try {
      const data = await searchAllDonViApi(keyword);
      setResult(data);
      setSearched(true);
    } catch (searchError) {
      setError(
        searchError instanceof Error ? searchError.message : "Không thể tìm kiếm.",
      );
    } finally {
      setLoading(false);
    }
  }

  const totalResults = result.hocSinh.length + result.giaoVien.length + result.lopHoc.length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Tìm kiếm xuyên đơn vị"
        subtitle="Tìm học sinh, giáo viên, lớp học theo tên hoặc mã — không cần biết thuộc đơn vị nào."
      />

      {error ? <div className="form-error">{error}</div> : null}

      <SectionCard title="Tìm kiếm">
        <form className="user-toolbar" onSubmit={handleSearch}>
          <TextField
            type="search"
            value={keyword}
            placeholder="Nhập tên hoặc mã học sinh / giáo viên / lớp học..."
            onChange={setKeyword}
          />

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>
      </SectionCard>

      {searched ? (
        <SectionCard
          title="Kết quả"
          subtitle={`${totalResults} kết quả (tối đa 10 mỗi loại)`}
        >
          {totalResults === 0 ? (
            <div className="empty-cell">Không tìm thấy kết quả phù hợp.</div>
          ) : (
            <div className="page-stack">
              {result.hocSinh.length > 0 ? (
                <div>
                  <strong>Học sinh</strong>
                  <div className="user-table-wrap">
                    <table className="user-table">
                      <tbody>
                        {result.hocSinh.map((item) => (
                          <tr key={`hs-${item.id}`}>
                            <td>
                              <EntityLink to={`/students/${item.id}`} donVi={item.donVi}>
                                <strong>{item.hoTen}</strong>
                              </EntityLink>
                              <small>{item.maHocSinh}</small>
                            </td>
                            <td>
                              <OrgLink donVi={item.donVi} to="/students" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {result.giaoVien.length > 0 ? (
                <div>
                  <strong>Giáo viên</strong>
                  <div className="user-table-wrap">
                    <table className="user-table">
                      <tbody>
                        {result.giaoVien.map((item) => (
                          <tr key={`gv-${item.id}`}>
                            <td>
                              <EntityLink to={`/teachers/${item.id}`} donVi={item.donVi}>
                                <strong>{item.hoTen}</strong>
                              </EntityLink>
                              <small>{item.maGiaoVien}</small>
                            </td>
                            <td>
                              <OrgLink donVi={item.donVi} to="/teachers" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {result.lopHoc.length > 0 ? (
                <div>
                  <strong>Lớp học</strong>
                  <div className="user-table-wrap">
                    <table className="user-table">
                      <tbody>
                        {result.lopHoc.map((item) => (
                          <tr key={`lh-${item.id}`}>
                            <td>
                              <EntityLink to={`/classes/${item.id}`} donVi={item.donVi}>
                                <strong>{item.tenLop}</strong>
                              </EntityLink>
                              <small>{item.maLop}</small>
                            </td>
                            <td>
                              <OrgLink donVi={item.donVi} to="/classes" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </SectionCard>
      ) : null}
    </div>
  );
}
