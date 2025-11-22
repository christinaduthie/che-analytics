// src/components/VillageTable.jsx
import { generatePath, useNavigate } from "react-router-dom";
import { REPORT_PATH } from "../routes/paths";

function VillageTable({
  countryName,
  stateName,
  districtName,
  subDistrictName,
  villages,
}) {
  const navigate = useNavigate();
  const totalPopulation = villages.reduce((sum, village) => {
    return sum + (village.cheVillageInformation.population ?? 0);
  }, 0);

  const openReport = (village) => {
    if (!countryName || !stateName || !districtName || !subDistrictName) {
      return;
    }
    const info = village.cheVillageInformation;
    const path = generatePath(REPORT_PATH, {
      country: countryName,
      state: stateName,
      district: districtName,
      subDistrict: subDistrictName,
      village: info.cheVillageName,
    });
    navigate(path);
  };

  return (
    <section className="app-card p-4 mb-4 bg-white">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Sub district snapshot</p>
          <h2 className="section-heading mb-2">Villages inside {subDistrictName}</h2>
          <p className="text-muted mb-2">
            Scan active CHE villages, sponsoring organizations, and population insights at a glance.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge bg-light text-secondary">Active records {villages.length}</span>
            <span className="badge bg-light text-secondary">
              Population {totalPopulation.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-3">
          <StatsTile label="Villages" value={villages.length} />
          <StatsTile label="Population" value={totalPopulation.toLocaleString()} />
        </div>
      </div>
      <div className="alert alert-info d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
        <div>
          <p className="fw-semibold mb-1">Quick tip</p>
          <p className="mb-0">Click “Open report” next to a village to jump into the full narrative.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <span className="badge text-bg-light text-secondary">Worker visible</span>
          <span className="badge text-bg-light text-secondary">Languages listed</span>
        </div>
      </div>

      <div className="table-scroll">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">CHE Village</th>
              <th scope="col">Organization</th>
              <th scope="col" className="text-end">
                Population
              </th>
              <th scope="col" className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {villages.map((village, idx) => {
              const info = village.cheVillageInformation;
              return (
                <tr key={info.cheVillageName + idx}>
                  <td>
                    <div className="fw-semibold">{info.cheVillageName}</div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {info.languageSpoken.map((language) => (
                        <span key={language} className="text-chip">
                          {language}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">{info.cheOrganization}</div>
                    <div className="text-muted small">Worker: {info.cheWorkerName}</div>
                  </td>
                  <td className="text-end fw-semibold">{info.population.toLocaleString()}</td>
                  <td className="text-center">
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => openReport(village)}>
                      Open report
                    </button>
                  </td>
                </tr>
              );
            })}
            {villages.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No villages found for this sub district.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatsTile({ label, value }) {
  return (
    <div className="text-center border rounded-3 p-3 bg-light">
      <p className="text-uppercase small text-muted mb-1">{label}</p>
      <p className="fs-4 fw-semibold mb-0">{value}</p>
    </div>
  );
}

export default VillageTable;
