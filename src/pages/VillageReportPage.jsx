import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VillageReport from "../components/VillageReport";
import { cheData } from "../data/cheData";
import { HOME_PATH } from "../routes/paths";

function VillageReportPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { country, state, district, subDistrict, village } = params;

  const match = useMemo(
    () =>
      findVillageMatch(cheData.countries, {
        country,
        state,
        district,
        subDistrict,
        village,
      }),
    [country, state, district, subDistrict, village]
  );

  if (!match) {
    return (
      <main className="container-fluid py-4 px-3 px-lg-5">
        <section className="app-card p-5 text-center bg-white">
          <div className="display-6 mb-3">🧭</div>
          <h2 className="mb-2">We couldn’t find that village</h2>
          <p className="text-muted mb-4">
            The link might be outdated or the selection trail is incomplete. Head back to the dashboard to choose a
            fresh combination.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate(HOME_PATH)}>
            Return home
          </button>
        </section>
      </main>
    );
  }

  const { village: selectedVillage, names } = match;

  return (
    <main className="container-fluid py-4 px-3 px-lg-5">
      <section className="app-card p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
        
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="mt-3">
          <h1 className="display-6 fw-semibold mb-2">{names.village}</h1>
          <p className="text-muted mb-0">
            Comprehensive analytics dedicated to this village, powered by the latest CHE submissions across churches,
            trainings, projects, and transformation stories.
          </p>
        </div>
      </section>
      <VillageReport village={selectedVillage} />
    </main>
  );
}

function findVillageMatch(countries, trail) {
  const normalizedTrail = {
    country: normalize(trail.country),
    state: normalize(trail.state),
    district: normalize(trail.district),
    subDistrict: normalize(trail.subDistrict),
    village: normalize(trail.village),
  };

  if (
    !normalizedTrail.country ||
    !normalizedTrail.state ||
    !normalizedTrail.district ||
    !normalizedTrail.subDistrict ||
    !normalizedTrail.village
  ) {
    return null;
  }

  for (const country of countries) {
    if (normalize(country.countryName) !== normalizedTrail.country) continue;

    for (const state of country.states) {
      if (normalize(state.stateName) !== normalizedTrail.state) continue;

      for (const district of state.districts) {
        if (normalize(district.districtName) !== normalizedTrail.district)
          continue;

        for (const subDistrict of district.subDistricts) {
          if (
            normalize(subDistrict.subDistrictName) !==
            normalizedTrail.subDistrict
          )
            continue;

          const villageMatch = subDistrict.villages.find(
            (v) =>
              normalize(v.cheVillageInformation.cheVillageName) ===
              normalizedTrail.village
          );

          if (villageMatch) {
            return {
              village: villageMatch,
              names: {
                country: country.countryName,
                state: state.stateName,
                district: district.districtName,
                subDistrict: subDistrict.subDistrictName,
                village: villageMatch.cheVillageInformation.cheVillageName,
              },
            };
          }
        }
      }
    }
  }

  return null;
}

const normalize = (value = "") => value.trim().toLowerCase();

export default VillageReportPage;
