import { useEffect, useMemo, useState } from "react";
import { cheData } from "../data/cheData";
import VillageReport from "../components/VillageReport";
import ScopeReportTabs from "../components/report/ScopeReportTabs";

const normalizeContinentName = (value) => value ?? "Unspecified";

const movementMetricDescriptors = [
  {
    key: "churches",
    label: "CHE Churches",
    valueAccessor: (stats) => stats.movement.churches,
    buildSeries: (data, range) =>
      buildMonthlySeries(data.churches, "updateDate", range, () => 1),
  },
  {
    key: "commitments",
    label: "Commitments",
    valueAccessor: (stats) => stats.movement.commitments,
    buildSeries: (data, range) =>
      buildMonthlySeries(
        data.churches,
        "updateDate",
        range,
        (item) => item.newCommitments ?? 0
      ),
  },
  {
    key: "peopleTrained",
    label: "People Trained",
    valueAccessor: (stats) => stats.movement.peopleTrained,
    buildSeries: (data, range) =>
      buildMonthlySeries(
        data.trainings,
        "updatedDate",
        range,
        (item) => item.peopleTrained ?? 0
      ),
  },
  {
    key: "ches",
    label: "CHEs",
    valueAccessor: (stats) => stats.movement.ches,
    buildSeries: (data, range) =>
      buildGrowthCategorySeries(data.growthStats, "CHEs", range),
  },
  {
    key: "committeeMembers",
    label: "CHE Committee Members",
    valueAccessor: (stats) => stats.movement.committeeMembers,
    buildSeries: (data, range) =>
      buildGrowthCategorySeries(data.growthStats, "Committee Members", range),
  },
  {
    key: "committees",
    label: "CHE Committees",
    valueAccessor: (stats) => stats.movement.committees,
    buildSeries: (data, range) =>
      buildGrowthCategorySeries(data.growthStats, "Committees", range),
  },
  {
    key: "dbs",
    label: "Discovery Bible Studies",
    valueAccessor: (stats) => stats.movement.dbs,
    buildSeries: (data, range) =>
      buildGrowthCategorySeries(
        data.growthStats,
        "Discovery Bible Studies",
        range
      ),
  },
  {
    key: "growthGroups",
    label: "Growth Groups",
    valueAccessor: (stats) => stats.movement.growthGroups,
    buildSeries: (data, range) =>
      buildGrowthCategorySeries(data.growthStats, "Growth Groups", range),
  },
  {
    key: "homesVisited",
    label: "Homes Visited",
    valueAccessor: (stats) => stats.movement.homesVisited,
    buildSeries: (data, range) =>
      buildGrowthCategorySeries(
        data.growthStats,
        "Homes Being Visited",
        range
      ),
  },
  {
    key: "population",
    label: "Population",
    valueAccessor: (stats) => stats.population ?? 0,
    buildSeries: (data, range) =>
      buildPopulationSeries(data?.villages ?? [], range),
  },
];

function HomePage() {
  const countries = cheData.countries ?? [];
  const unreachedContinents = cheData.unreachedContinents ?? [];
  const globalTotals = cheData.globalTotals ?? {};
  const normalizedData = useMemo(
    () => normalizeCheDataset(countries),
    [countries]
  );
  const [scopeContinent, setScopeContinent] = useState("");
  const [scopeCountry, setScopeCountry] = useState("");
  const [scopeState, setScopeState] = useState("");
  const [scopeDistrict, setScopeDistrict] = useState("");
  const [scopeSubDistrict, setScopeSubDistrict] = useState("");
  const [scopeVillage, setScopeVillage] = useState("");
  const [graphMetricKey, setGraphMetricKey] = useState(null);
  const [graphChartType, setGraphChartType] = useState("line");
  const locationMeta = useMemo(
    () => ({ unreachedContinents, globalTotals }),
    [unreachedContinents, globalTotals]
  );
  const continentOptions = useMemo(
    () => buildContinentOptions(countries, unreachedContinents),
    [countries, unreachedContinents]
  );
  const scopedCountries = useMemo(
    () =>
      scopeContinent
        ? countries.filter(
            (country) =>
              (country.continentName ?? "Unspecified") === scopeContinent
          )
        : countries,
    [countries, scopeContinent]
  );
  const selectedCountryData = useMemo(
    () => countries.find((country) => country.countryName === scopeCountry),
    [countries, scopeCountry]
  );
  const availableStates = selectedCountryData?.states ?? [];
  const selectedStateData = availableStates.find(
    (state) => state.stateName === scopeState
  );
  const availableDistricts = selectedStateData?.districts ?? [];
  const selectedDistrictData = availableDistricts.find(
    (district) => district.districtName === scopeDistrict
  );
  const availableSubDistricts = selectedDistrictData?.subDistricts ?? [];
  const selectedSubDistrictData = availableSubDistricts.find(
    (subDistrict) => subDistrict.subDistrictName === scopeSubDistrict
  );
  const availableVillages = selectedSubDistrictData?.villages ?? [];
  const locationSelection = useMemo(
    () => ({
      continent: scopeContinent,
      country: scopeCountry,
      state: scopeState,
      district: scopeDistrict,
      subDistrict: scopeSubDistrict,
      village: scopeVillage,
    }),
    [
      scopeContinent,
      scopeCountry,
      scopeState,
      scopeDistrict,
      scopeSubDistrict,
      scopeVillage,
    ]
  );
  const locationStats = useMemo(
    () => buildLocationScopeStats(countries, locationSelection, locationMeta),
    [countries, locationSelection, locationMeta]
  );
  const selectionTrail = useMemo(
    () => buildSelectionTrail(locationSelection),
    [locationSelection]
  );
  const locationHighlights = useMemo(
    () => buildGeographyHighlights(locationStats, locationSelection),
    [locationStats, locationSelection]
  );
  const countryOptions = useMemo(
    () =>
      scopedCountries.map((country) => ({
        label: country.countryName,
        value: country.countryName,
      })),
    [scopedCountries]
  );
  const stateOptions = useMemo(
    () =>
      availableStates.map((state) => ({
        label: state.stateName,
        value: state.stateName,
      })),
    [availableStates]
  );
  const districtOptions = useMemo(
    () =>
      availableDistricts.map((district) => ({
        label: district.districtName,
        value: district.districtName,
      })),
    [availableDistricts]
  );
  const subDistrictOptions = useMemo(
    () =>
      availableSubDistricts.map((subDistrict) => ({
        label: subDistrict.subDistrictName,
        value: subDistrict.subDistrictName,
      })),
    [availableSubDistricts]
  );
  const villageOptions = useMemo(
    () =>
      availableVillages.map((village) => ({
        label: village.cheVillageInformation?.cheVillageName ?? "Unnamed village",
        value: village.cheVillageInformation?.cheVillageName ?? "",
      })),
    [availableVillages]
  );
  const selectedVillageData = useMemo(
    () =>
      availableVillages.find(
        (village) =>
          village.cheVillageInformation?.cheVillageName === scopeVillage
      ),
    [availableVillages, scopeVillage]
  );
  const scopeSummary = describeScopeSummary(locationSelection);
  const selectionChips = [
    { label: "Continent", value: scopeContinent },
    { label: "Country", value: scopeCountry },
    { label: "State", value: scopeState },
    { label: "District", value: scopeDistrict },
    { label: "Sub district", value: scopeSubDistrict },
    { label: "Village", value: scopeVillage },
  ].filter((chip) => Boolean(chip.value));
  const hasScopeSelection = Boolean(
    scopeContinent ||
      scopeCountry ||
      scopeState ||
      scopeDistrict ||
      scopeSubDistrict ||
      scopeVillage
  );
  const continentHelper = `${continentOptions.length} continent${
    continentOptions.length === 1 ? "" : "s"
  }`;
  const countryHelper = scopeContinent
    ? `${scopedCountries.length} in ${scopeContinent}`
    : `${countries.length} total`;
  const stateHelper = scopeCountry
    ? `${availableStates.length} in ${scopeCountry}`
    : "Select a country to unlock";
  const districtHelper = scopeState
    ? `${availableDistricts.length} in ${scopeState}`
    : "Select a state to unlock";
  const subDistrictHelper = scopeDistrict
    ? `${availableSubDistricts.length} in ${scopeDistrict}`
    : "Select a district to unlock";
  const villageHelper = scopeSubDistrict
    ? `${availableVillages.length} in ${scopeSubDistrict}`
    : "Select a sub district to unlock";
  const locationAwareData = useMemo(
    () => filterNormalizedCollections(normalizedData, locationSelection),
    [normalizedData, locationSelection]
  );

  const {
    villages,
    churches,
    growthStats,
    trainings,
    projects,
    stories,
    minDate,
    maxDate,
    timeline = [],
  } = normalizedData;

  const {
    villages: scopedVillages = villages,
    churches: scopedChurches,
    growthStats: scopedGrowthStats,
    trainings: scopedTrainings,
    projects: scopedProjects,
    stories: scopedStories,
  } = locationAwareData;

  const [timelineSelection, setTimelineSelection] = useState(() => ({
    from: 0,
    to: Math.max(timeline.length - 1, 0),
  }));

  const sliderMax = Math.max(timeline.length - 1, 0);

  useEffect(() => {
    setTimelineSelection((prev) => {
      const nextFrom = Math.min(prev.from, sliderMax);
      const nextTo = Math.min(prev.to, sliderMax);
      if (nextFrom <= nextTo) {
        return { from: nextFrom, to: nextTo };
      }
      return { from: nextTo, to: nextFrom };
    });
  }, [sliderMax]);

  const sliderFromDate = timeline[timelineSelection.from] ?? minDate;
  const sliderToDate = timeline[timelineSelection.to] ?? maxDate;

  const effectiveRange = useMemo(
    () => ensureOrderedRange({ from: sliderFromDate, to: sliderToDate }),
    [sliderFromDate, sliderToDate]
  );

  const formatTimelineLabel = (value) => {
    const timestamp = parseTimestamp(value);
    return timestamp === null ? "—" : formatHumanDate(timestamp);
  };

  const coverageStats = useMemo(
    () => buildCoverageStats(scopedVillages ?? []),
    [scopedVillages]
  );

  const coverageVillageCount = scopedVillages?.length ?? 0;
  const coverageCountryCount = useMemo(() => {
    const countriesSet = new Set();
    (scopedVillages ?? []).forEach((village) => {
      const name = village.__location?.country;
      if (name) {
        countriesSet.add(name);
      }
    });
    return countriesSet.size;
  }, [scopedVillages]);

  const impactStats = useMemo(
    () =>
      buildImpactStats(
        {
          villages: scopedVillages ?? [],
          churches: scopedChurches,
          growthStats: scopedGrowthStats,
          trainings: scopedTrainings,
          projects: scopedProjects,
          stories: scopedStories,
        },
        effectiveRange
      ),
    [
      scopedVillages,
      scopedChurches,
      scopedGrowthStats,
      scopedTrainings,
      scopedProjects,
      scopedStories,
      effectiveRange,
    ]
  );

  const rangeSummary = describeRange(effectiveRange);
  const sliderDisabled = timeline.length <= 1;
  const sliderFromLabel = formatTimelineLabel(sliderFromDate ?? minDate);
  const sliderToLabel = formatTimelineLabel(sliderToDate ?? maxDate);
  const minTimelineLabel = formatTimelineLabel(
    timeline[0] ?? sliderFromDate ?? minDate
  );
  const maxTimelineLabel = formatTimelineLabel(
    timeline[timeline.length - 1] ?? sliderToDate ?? maxDate
  );
  const selectionStartPct =
    sliderMax === 0 ? 0 : (timelineSelection.from / sliderMax) * 100;
  const selectionEndPct =
    sliderMax === 0 ? 100 : (timelineSelection.to / sliderMax) * 100;

  const handleRangeChange = (type) => (event) => {
    const value = Number(event.target.value);
    setTimelineSelection((prev) => {
      const next = { ...prev, [type]: value };
      if (next.from > next.to) {
        if (type === "from") {
          next.to = value;
        } else {
          next.from = value;
        }
      }
      return next;
    });
  };

  const handleScopeContinentChange = (value) => {
    setScopeContinent(value);
    setScopeCountry("");
    setScopeState("");
    setScopeDistrict("");
    setScopeSubDistrict("");
    setScopeVillage("");
  };

  const handleScopeCountryChange = (value) => {
    setScopeCountry(value);
    setScopeState("");
    setScopeDistrict("");
    setScopeSubDistrict("");
    setScopeVillage("");
  };

  const handleScopeStateChange = (value) => {
    setScopeState(value);
    setScopeDistrict("");
    setScopeSubDistrict("");
    setScopeVillage("");
  };

  const handleScopeDistrictChange = (value) => {
    setScopeDistrict(value);
    setScopeSubDistrict("");
    setScopeVillage("");
  };

  const handleScopeSubDistrictChange = (value) => {
    setScopeSubDistrict(value);
    setScopeVillage("");
  };

  const handleScopeVillageChange = (value) => {
    setScopeVillage(value);
  };

  const handleScopeReset = () => {
    setScopeContinent("");
    setScopeCountry("");
    setScopeState("");
    setScopeDistrict("");
    setScopeSubDistrict("");
    setScopeVillage("");
  };

  const handleOpenGraph = (key) => {
    setGraphMetricKey(key);
    setGraphChartType("line");
  };

  const handleCloseGraph = () => {
    setGraphMetricKey(null);
  };

  const coverageHighlights = [
    {
      label: "CHE Villages",
      value: coverageStats.villages,
      caption: "",
    },
    {
      label: "Language Groups",
      value: coverageStats.languages,
      caption: "",
    },
    {
      label: "People Groups",
      value: coverageStats.peopleGroups,
      caption: "",
    },
    {
      label: "CHE Partners",
      value: coverageStats.organizations,
      caption: "",
    },
  ];

  const movementMetrics = movementMetricDescriptors.map((descriptor) => ({
    key: descriptor.key,
    label: descriptor.label,
    value: descriptor.valueAccessor(impactStats),
    graphable: descriptor.graphable !== false,
  }));

  const selectedGraphMetric = useMemo(
    () => movementMetricDescriptors.find((metric) => metric.key === graphMetricKey),
    [graphMetricKey]
  );

  const graphSeries = useMemo(() => {
    if (!selectedGraphMetric) return [];
    return selectedGraphMetric.buildSeries(locationAwareData, effectiveRange);
  }, [selectedGraphMetric, locationAwareData, effectiveRange]);

  const trainingMetrics = [
    { label: "No of trainings", value: impactStats.trainings.count },
    { label: "No of places", value: impactStats.trainings.places },
    { label: "No of people trained", value: impactStats.trainings.people },
  ];

  const projectMetrics = [
    { label: "No of projects", value: impactStats.projects.count },
    { label: "No of places", value: impactStats.projects.places },
    { label: "No of people reached", value: impactStats.projects.people },
  ];

  const storyMetrics = [
    { label: "No of stories", value: impactStats.stories.count },
    { label: "No of people impacted", value: impactStats.stories.people },
  ];

  return (
    <main className="container-fluid py-4 px-3 px-lg-5 home-screen">
      <section className="app-card hero-card p-4 p-lg-5 mb-4 text-white position-relative overflow-hidden">
        <div className="hero-glow" aria-hidden />
        <div className="hero-minimal position-relative">
          <h1 className="display-4 fw-semibold mb-0">
            Global CHE Movement
          </h1>
        </div>
      </section>

      <section className="app-card p-4 mb-4">
        <div className="d-flex flex-column flex-xl-row justify-content-between gap-3 mb-4">
          <div>
           
            <h2 className="section-heading mb-2">
               Demographic Influence
            </h2>
          </div>
          <div className="text-xl-end">
            <div className="fw-semibold">{selectionTrail}</div>
            <div className="text-muted small mb-2">{scopeSummary}</div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleScopeReset}
            >
              Reset scope
            </button>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-6 col-xxl-2">
            <ScopeSelect
              label="Continent"
              value={scopeContinent}
              onChange={handleScopeContinentChange}
              options={continentOptions}
              placeholder="Select continent"
              helper={continentHelper}
              withAllOption
            />
          </div>
          <div className="col-12 col-md-6 col-xxl-2">
            <ScopeSelect
              label="Country"
              value={scopeCountry}
              onChange={handleScopeCountryChange}
              options={countryOptions}
              placeholder={scopeContinent ? "Choose country" : "Select country"}
              helper={countryHelper}
              withAllOption
            />
          </div>
          <div className="col-12 col-md-6 col-xxl-2">
            <ScopeSelect
              label="State"
              value={scopeState}
              onChange={handleScopeStateChange}
              options={stateOptions}
              placeholder={scopeCountry ? "Select state" : "Pick a country first"}
              helper={stateHelper}
              disabled={!scopeCountry}
              withAllOption
            />
          </div>
          <div className="col-12 col-md-6 col-xxl-2">
            <ScopeSelect
              label="District"
              value={scopeDistrict}
              onChange={handleScopeDistrictChange}
              options={districtOptions}
              placeholder={scopeState ? "Select district" : "Awaiting state selection"}
              helper={districtHelper}
              disabled={!scopeState}
              withAllOption
            />
          </div>
          <div className="col-12 col-md-6 col-xxl-2">
            <ScopeSelect
              label="Sub district"
              value={scopeSubDistrict}
              onChange={handleScopeSubDistrictChange}
              options={subDistrictOptions}
              placeholder={scopeDistrict ? "Select sub district" : "Awaiting district"}
              helper={subDistrictHelper}
              disabled={!scopeDistrict}
              withAllOption
            />
          </div>
          <div className="col-12 col-md-6 col-xxl-2">
            <ScopeSelect
              label="Village"
              value={scopeVillage}
              onChange={handleScopeVillageChange}
              options={villageOptions}
              placeholder={scopeSubDistrict ? "Select village" : "Awaiting sub district"}
              helper={villageHelper}
              disabled={!scopeSubDistrict}
              withAllOption
            />
          </div>
        </div>
       
        <div className="row g-3 mt-3">
          {locationHighlights.map((stat) => (
            <div key={stat.label} className="col-12 col-xxl">
              <WheelStatCard {...stat} />
            </div>
          ))}
        </div>
      </section>

      <section className="app-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h2 className="section-heading mb-2">CHE Footprint</h2>
          </div>
          <div className="text-muted small">
            {coverageVillageCount.toLocaleString()} villages ·{" "}
            {coverageCountryCount.toLocaleString()} countries
          </div>
        </div>
        <div className="row g-3">
          {coverageHighlights.map((stat) => (
            <div key={stat.label} className="col-6 col-lg-3">
              <div className="stat-panel h-100">
                <p className="muted-label mb-1">{stat.label}</p>
                <p className="fs-2 fw-semibold mb-1">
                  {formatNumber(stat.value)}
                </p>
                <p className="text-muted small mb-0">{stat.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="row g-4 mb-4 align-items-stretch">
        <div className="col-12 col-xl-7 col-xxl-8">
          <section className="app-card p-4 h-100">
            <div className="d-flex flex-column flex-xl-row align-items-start gap-4 mb-4">
              <div className="flex-grow-1">
                
                <h2 className="section-heading mb-2"> Growth </h2>
              </div>
              <div className="timeline-slider-panel w-100 w-xl-auto">
                <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                  <p className="muted-label text-uppercase small mb-0">
                    Adjust Reporting Date
                  </p>
                  <span className="badge bg-white text-primary-emphasis">
                    Latest update
                  </span>
                </div>
                <div className="timeline-summary mb-3">
                  <div className="fw-semibold text-dark">{rangeSummary.text}</div>
                  <div className="text-muted small">{rangeSummary.detail}</div>
                </div>
                <div className="dual-range-shell">
                  <div
                    className="dual-range-progress"
                    style={{
                      left: `${selectionStartPct}%`,
                      right: `${100 - selectionEndPct}%`,
                    }}
                  />
                  <input
                    type="range"
                    className="dual-range"
                    min={0}
                    max={sliderMax}
                    value={Math.min(timelineSelection.from, sliderMax)}
                    onChange={handleRangeChange("from")}
                    disabled={sliderDisabled}
                  />
                  <input
                    type="range"
                    className="dual-range dual-range--top"
                    min={0}
                    max={sliderMax}
                    value={Math.min(timelineSelection.to, sliderMax)}
                    onChange={handleRangeChange("to")}
                    disabled={sliderDisabled}
                  />
                </div>
                <div className="d-flex justify-content-between small text-muted mt-2">
                  <span>{minTimelineLabel}</span>
                  <span>{maxTimelineLabel}</span>
                </div>
              </div>
            </div>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-5 g-3">
              {movementMetrics.map((metric) => (
                <div key={metric.label} className="col d-flex">
                  <div className="stat-panel accent w-100">
                    <p className="muted-label mb-2">{metric.label}</p>
                    <p className="fs-3 fw-semibold mb-2">
                      {formatNumber(metric.value)}
                    </p>
                    {metric.graphable && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary mt-3"
                        onClick={() => handleOpenGraph(metric.key)}
                      >
                        See graph
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="col-12 col-xl-5 col-xxl-4 d-flex flex-column gap-4">
          <div className="stat-panel accent">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <p className="muted-label mb-1">Community impact</p>
                <h3 className="h4 mb-0">Training & Projects</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <h4 className="h6 text-muted text-uppercase mb-2">Training</h4>
                {trainingMetrics.map((metric) => (
                  <MetricRow
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
              <div className="col-sm-6 mt-4 mt-sm-0">
                <h4 className="h6 text-muted text-uppercase mb-2">Projects</h4>
                {projectMetrics.map((metric) => (
                  <MetricRow
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="stat-panel dark">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <p className="muted-label mb-1 text-white-50">
                  Narratives of change
                </p>
                <h3 className="h4 text-white mb-0">Transformation stories</h3>
              </div>
              <span className="badge bg-light text-dark">Story</span>
            </div>
            {storyMetrics.map((metric) => (
              <MetricRow
                key={metric.label}
                label={metric.label}
                value={metric.value}
                dark
              />
            ))}
          </div>
        </div>
      </div>
      {selectedVillageData && (
        <>
        
          <VillageReport village={selectedVillageData} />
        </>
      )}
      {!selectedVillageData && hasScopeSelection && (
        <ScopeReportTabs
          selectionSummary={scopeSummary}
          selectionTrail={selectionTrail}
          data={{
            churches: scopedChurches ?? [],
            growthStats: scopedGrowthStats ?? [],
            trainings: scopedTrainings ?? [],
            projects: scopedProjects ?? [],
            stories: scopedStories ?? [],
            villages: scopedVillages ?? [],
          }}
        />
      )}
      {selectedGraphMetric && (
        <MetricModal
          metric={selectedGraphMetric}
          data={graphSeries}
          chartType={graphChartType}
          onChartTypeChange={setGraphChartType}
          onClose={handleCloseGraph}
        />
      )}
    </main>
  );
}

function WheelStatCard({ label, value, total, caption, color, unit }) {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;
  const denominator = numericTotal > 0 ? numericTotal : Math.max(numericValue, 1);
  const clampedValue = Math.min(Math.max(numericValue, 0), denominator);
  const ratio = denominator === 0 ? 0 : clampedValue / denominator;
  const percent = Math.round(ratio * 100);
  const wheelStyle = {
    "--wheel-angle": `${Math.min(Math.max(ratio, 0), 1) * 360}deg`,
    "--wheel-color": color ?? "#4f46e5",
  };
  return (
    <div className="wheel-stat h-100">
      <div
        className="wheel-chart"
        style={wheelStyle}
        role="img"
        aria-label={`${label}: ${percent}% of ${formatNumber(total)} ${unit || "total"}`}
      >
        <div className="wheel-center">
          <div className="wheel-percent">{percent}%</div>
          <div className="wheel-subtext">of total</div>
        </div>
      </div>
      <div className="wheel-meta">
        <p className="muted-label mb-1">{label}</p>
        <p className="fs-3 fw-semibold mb-1">{formatNumber(value)}</p>
        <p className="text-muted small mb-1">
          {formatNumber(value)} of {formatNumber(total)} {unit || "records"}
        </p>
        <p className="text-muted small mb-0">{caption}</p>
      </div>
    </div>
  );
}

function ScopeSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  helper = "",
  disabled = false,
  withAllOption = false,
}) {
  const inputId = `scope-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const placeholderValue = "__placeholder__";
  const allValue = "__all__";
  const resolvedValue = value
    ? value
    : withAllOption
      ? allValue
      : placeholderValue;
  const displayValue = disabled ? placeholderValue : resolvedValue;
  const handleSelectChange = (event) => {
    const nextValue = event.target.value;
    if (nextValue === placeholderValue) {
      return;
    }
    if (nextValue === allValue) {
      onChange("");
      return;
    }
    onChange(nextValue);
  };
  return (
    <div className="scope-select border rounded-3 p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label htmlFor={inputId} className="fw-semibold mb-0">
          {label}
        </label>
        <span className="text-muted small">{helper}</span>
      </div>
      <select
        id={inputId}
        className="form-select"
        value={displayValue}
        onChange={handleSelectChange}
        disabled={disabled}
      >
        <option value={placeholderValue} disabled>
          {placeholder}
        </option>
        {withAllOption && <option value={allValue}>All</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MetricRow({ label, value, dark = false }) {
  return (
    <div className="metric-row d-flex justify-content-between align-items-center py-2">
      <span className={`small ${dark ? "text-white-50" : "text-muted"}`}>
        {label}
      </span>
      <span className={`fw-semibold ${dark ? "text-white" : ""}`}>
        {formatNumber(value)}
      </span>
    </div>
  );
}

function MetricModal({ metric, data, chartType, onChartTypeChange, onClose }) {
  const noData = data.length === 0;
  return (
    <div className="chart-modal-overlay" role="dialog" aria-modal="true">
      <div className="chart-modal">
        <div className="chart-modal__header d-flex justify-content-between align-items-start">
          <div>
            <p className="text-uppercase small text-muted mb-1">Monthly trend</p>
            <h3 className="h5 mb-1">{metric.label}</h3>
            <p className="text-muted small mb-0">Time (months) × Count</p>
          </div>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>
        <div className="chart-modal__body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
            <div className="text-muted small">
              View the {metric.label.toLowerCase()} progression with month-level resolution.
            </div>
            <div className="chart-modal__controls">
              <label htmlFor="chartType" className="me-2 text-muted small">
                Chart type
              </label>
              <select
                id="chartType"
                className="form-select form-select-sm chart-type-select"
                value={chartType}
                onChange={(event) => onChartTypeChange(event.target.value)}
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
              </select>
            </div>
          </div>
          {noData ? (
            <div className="chart-empty">No activity recorded for this metric within the selected range.</div>
          ) : (
            <MetricChart data={data} type={chartType} />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricChart({ data = [], type = "line" }) {
  const width = 640;
  const height = 320;
  const padding = 48;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const barWidth = data.length > 0 ? (width - padding * 2) / data.length - 8 : 0;
  const points = data.map((point, index) => {
    const x = padding + index * step;
    const y =
      height - padding - (point.value / maxValue) * (height - padding * 2);
    return {
      ...point,
      x,
      y,
    };
  });

  const axisY = height - padding;
  const axisXStart = padding;
  const axisXEnd = width - padding;
  const axisHeight = height - padding * 2;

  const yAxisLabels = [maxValue, Math.round(maxValue / 2), 0]
    .filter((value, index, arr) => !arr.slice(0, index).includes(value));

  return (
    <svg
      className="chart-canvas"
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Monthly metric chart"
    >
      <line x1={padding} y1={axisY} x2={axisXEnd} y2={axisY} className="chart-axis" />
      <line x1={padding} y1={padding} x2={padding} y2={axisY} className="chart-axis" />
      {yAxisLabels.map((value) => {
        const y =
          axisY - (value / Math.max(maxValue, 1)) * (axisHeight || 1);
        return (
          <g key={`y-${value}`}>
            <line
              x1={padding - 6}
              y1={y}
              x2={padding}
              y2={y}
              className="chart-axis"
            />
            <text
              x={padding - 10}
              y={y + 4}
              className="chart-axis-tick"
              textAnchor="end"
            >
              {formatNumber(value)}
            </text>
          </g>
        );
      })}
      <text x={axisXEnd} y={axisY + 32} className="chart-axis-label">
        Months
      </text>
      <text x={padding - 32} y={padding - 8} className="chart-axis-label" transform={`rotate(-90 ${padding - 32} ${padding - 8})`}>
        Count
      </text>
      {type === "line" && points.length > 0 && (
        <polyline
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          className="chart-line"
        />
      )}
      {type === "line" &&
        points.map((point) => (
          <circle key={point.month} cx={point.x} cy={point.y} r={4} className="chart-point" />
        ))}
      {type === "bar" &&
        points.map((point, index) => (
          <rect
            key={point.month}
            x={padding + index * ((width - padding * 2) / data.length) + 4}
            y={point.y}
            width={Math.max(barWidth, 8)}
            height={axisY - point.y}
            className="chart-bar"
          />
        ))}
      {points.map((point) => (
        <text
          key={`${point.month}-label`}
          x={point.x}
          y={axisY + 32}
          className="chart-tick"
          transform={`rotate(-45 ${point.x} ${axisY + 32})`}
          textAnchor="end"
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
}

function buildContinentOptions(countries = [], unreached = []) {
  const continents = new Set(unreached);
  countries.forEach((country) => {
    continents.add(country.continentName ?? "Unspecified");
  });
  return Array.from(continents)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ label: name, value: name }));
}

function buildLocationScopeStats(countries = [], selection = {}, meta = {}) {
  const { unreachedContinents = [], globalTotals = {} } = meta;
  const continentsSet = new Set(
    unreachedContinents.map((name) => normalizeContinentName(name))
  );
  countries.forEach((country) => {
    continentsSet.add(normalizeContinentName(country.continentName));
  });

  const matchesContinent = (country) =>
    selection.continent
      ? normalizeContinentName(country.continentName) === selection.continent
      : true;

  const countriesInContinent = countries.filter(matchesContinent);
  const selectedCountry = selection.country
    ? countriesInContinent.find(
        (country) => country.countryName === selection.country
      )
    : undefined;

  const countriesCurrent = selection.country
    ? selectedCountry
      ? [selectedCountry]
      : []
    : countriesInContinent;

  const countriesCurrentCount = countriesCurrent.length;
  const countriesTotalCount = selection.continent
    ? countriesInContinent.length || countriesCurrentCount
    : globalTotals.countries ?? Math.max(countries.length, countriesCurrentCount);

  const statesFromCountries = (countryList) =>
    countryList.flatMap((country) => country.states ?? []);
  const districtsFromStates = (stateList) =>
    stateList.flatMap((state) => state.districts ?? []);
  const subDistrictsFromDistricts = (districtList) =>
    districtList.flatMap((district) => district.subDistricts ?? []);

  const statesBaseCountries = selectedCountry ? [selectedCountry] : countriesInContinent;
  const statesTotalList = statesFromCountries(statesBaseCountries);
  let statesCurrentList = statesTotalList;
  if (selection.state) {
    statesCurrentList = statesCurrentList.filter(
      (state) => state.stateName === selection.state
    );
  }
  const statesTotalCount = selectedCountry || selection.continent
    ? statesTotalList.length
    : globalTotals.states ?? Math.max(statesTotalList.length, statesCurrentList.length);

  const statesForDistricts = statesBaseCountries;
  const districtsTotalList = districtsFromStates(statesForDistricts);
  let districtsCurrentList;
  if (selection.state && selectedCountry) {
    const stateMatch = selectedCountry.states?.find(
      (state) => state.stateName === selection.state
    );
    districtsCurrentList = districtsFromStates(stateMatch ? [stateMatch] : []);
  } else {
    districtsCurrentList = districtsTotalList;
  }
  if (selection.district) {
    districtsCurrentList = districtsCurrentList.filter(
      (district) => district.districtName === selection.district
    );
  }
  const districtsTotalCount = selectedCountry || selection.continent
    ? districtsTotalList.length
    : globalTotals.districts ?? Math.max(districtsTotalList.length, districtsCurrentList.length);

  const subDistrictsTotalList = subDistrictsFromDistricts(districtsTotalList);
  let subDistrictsCurrentList;
  if (selection.district && selectedCountry) {
    const stateMatch = selectedCountry.states?.find(
      (state) => state.stateName === selection.state
    );
    const districtMatch = stateMatch?.districts?.find(
      (district) => district.districtName === selection.district
    );
    subDistrictsCurrentList = districtMatch?.subDistricts ?? [];
  } else if (selection.state && selectedCountry) {
    const stateMatch = selectedCountry.states?.find(
      (state) => state.stateName === selection.state
    );
    subDistrictsCurrentList = subDistrictsFromDistricts(
      districtsFromStates(stateMatch ? [stateMatch] : [])
    );
  } else {
    subDistrictsCurrentList = subDistrictsTotalList;
  }
  if (selection.subDistrict) {
    subDistrictsCurrentList = subDistrictsCurrentList.filter(
      (subDistrict) => subDistrict.subDistrictName === selection.subDistrict
    );
  }
  const subDistrictsTotalCount = selectedCountry || selection.continent
    ? subDistrictsTotalList.length
    : globalTotals.subDistricts ?? Math.max(subDistrictsTotalList.length, subDistrictsCurrentList.length);

  const continentsCurrentCount = selection.continent ? 1 : continentsSet.size;
  const continentsTotalCount = selection.continent
    ? 1
    : globalTotals.continents ?? Math.max(continentsSet.size, 1);

  return {
    continents: {
      current: continentsCurrentCount,
      total: continentsTotalCount,
    },
    countries: {
      current: countriesCurrentCount,
      total: countriesTotalCount || countriesCurrentCount || 1,
    },
    states: {
      current: statesCurrentList.length,
      total: statesTotalCount || statesCurrentList.length || 1,
    },
    districts: {
      current: districtsCurrentList.length,
      total: districtsTotalCount || districtsCurrentList.length || 1,
    },
    subDistricts: {
      current: subDistrictsCurrentList.length,
      total: subDistrictsTotalCount || subDistrictsCurrentList.length || 1,
    },
  };
}

function buildSelectionTrail(selection = {}) {
  const parts = [
    selection.continent || "Continent",
    selection.country || "Country",
    selection.state || "State",
    selection.district || "District",
    selection.subDistrict || "Sub district",
  ];
  if ("village" in selection) {
    parts.push(selection.village || "Village");
  }
  return parts.join(" → ");
}

function buildGeographyHighlights(stats = {}, selection = {}) {
  const palette = ["#4f46e5", "#0ea5e9", "#22c55e", "#f97316", "#c026d3"];
  const config = [
    { key: "continents", label: "Continents engaged", unit: "continents" },
    { key: "countries", label: "Countries active", unit: "countries" },
    { key: "states", label: "States", unit: "states" },
    { key: "districts", label: "Districts ", unit: "districts" },
    { key: "subDistricts", label: "Sub districts ", unit: "sub districts" },
  ];
  const { continent, country, state, district } = selection;
  let keysToDisplay = config.map((entry) => entry.key);
  if (district) {
    keysToDisplay = ["subDistricts"];
  } else if (state) {
    keysToDisplay = ["districts", "subDistricts"];
  } else if (country) {
    keysToDisplay = ["states", "districts", "subDistricts"];
  } else if (continent) {
    keysToDisplay = ["countries", "states", "districts", "subDistricts"];
  }
  return config.filter((entry) => keysToDisplay.includes(entry.key)).map((entry, index) => {
    const bucket = stats[entry.key] ?? {};
    return {
      label: entry.label,
      value: bucket.current ?? 0,
      total: bucket.total ?? 0,
      caption: describeScopeCaption(entry.key, selection),
      color: palette[index % palette.length],
      unit: entry.unit,
    };
  });
}

function describeScopeCaption(level, selection = {}) {
  const { continent, country, state, district, subDistrict } = selection;
  switch (level) {
    case "continents":
      return continent ? `Focus: ${continent}` : "";
    case "countries":
      if (country) return `Focus: ${country}`;
      if (continent) return `Within ${continent}`;
      return "";
    case "states":
      if (state) return `Focus: ${state}`;
      if (country) return `Inside ${country}`;
      if (continent) return `States in ${continent}`;
      return "";
    case "districts":
      if (district) return `Focus: ${district}`;
      if (state) return `Inside ${state}`;
      if (country) return `Districts in ${country}`;
      if (continent) return `Spanning ${continent}`;
      return "";
    case "subDistricts":
      if (subDistrict) return `Focus: ${subDistrict}`;
      if (district) return `Within ${district}`;
      if (state) return `Across ${state}`;
      if (country) return `Sub districts in ${country}`;
      if (continent) return `Across ${continent}`;
      return "";
    default:
      return "";
  }
}

function describeScopeSummary(selection = {}) {
  const { village, subDistrict, district, state, country, continent } = selection;
  if (village) {
    return `Village focus · ${village}`;
  }
  if (subDistrict) {
    return `Sub district focus · ${subDistrict}`;
  }
  if (district) {
    return `District focus · ${district}`;
  }
  if (state) {
    return `State focus · ${state}`;
  }
  if (country) {
    return `Country focus · ${country}`;
  }
  if (continent) {
    return `Continent focus · ${continent}`;
  }
  return "Global focus · All regions";
}

function normalizeCheDataset(countries = []) {
  const villages = [];
  const churches = [];
  const growthStats = [];
  const trainings = [];
  const projects = [];
  const stories = [];
  const dateValues = [];

  const pushDate = (value) => {
    const ts = parseTimestamp(value);
    if (ts !== null) {
      dateValues.push(ts);
    }
  };

  countries.forEach((country) => {
    const continentLabel = normalizeContinentName(country.continentName);
    country.states?.forEach((state) => {
      state.districts?.forEach((district) => {
        district.subDistricts?.forEach((subDistrict) => {
          const baseLocation = {
            continent: continentLabel,
            country: country.countryName,
            state: state.stateName,
            district: district.districtName,
            subDistrict: subDistrict.subDistrictName,
          };
          subDistrict.villages?.forEach((village) => {
            const villageName =
              village.cheVillageInformation?.cheVillageName ?? "";
            const location = { ...baseLocation, village: villageName };
            villages.push({ ...village, __location: location });
            village.churches?.forEach((church) => {
              churches.push({ ...church, __location: location });
              pushDate(church.updateDate);
            });
            village.growthStatistics?.forEach((stat) => {
              growthStats.push({ ...stat, __location: location });
              pushDate(stat.updatedDate);
            });
            village.trainings?.forEach((training) => {
              trainings.push({ ...training, __location: location });
              pushDate(training.updatedDate);
            });
            village.projects?.forEach((project) => {
              projects.push({ ...project, __location: location });
              pushDate(project.updatedDate);
            });
            village.transformationStories?.forEach((story) => {
              stories.push({ ...story, __location: location });
              pushDate(story.updatedDate);
            });
          });
        });
      });
    });
  });

  const fallbackTimestamp = Date.now();
  const fallback = formatInputDate(fallbackTimestamp);
  const timelineValues =
    dateValues.length > 0
      ? Array.from(new Set(dateValues)).sort((a, b) => a - b)
      : [fallbackTimestamp];

  return {
    villages,
    churches,
    growthStats,
    trainings,
    projects,
    stories,
    minDate:
      dateValues.length > 0
        ? formatInputDate(Math.min(...dateValues))
        : fallback,
    maxDate:
      dateValues.length > 0
        ? formatInputDate(Math.max(...dateValues))
        : fallback,
    timeline: timelineValues.map((value) => formatInputDate(value)),
  };
}

function buildCoverageStats(villages = []) {
  const languages = new Set();
  const peopleGroups = new Set();
  const organizations = new Set();

  villages.forEach((village) => {
    const info = village.cheVillageInformation ?? {};
    info.languageSpoken?.forEach((language) => languages.add(language));
    info.peopleGroups?.forEach((group) => peopleGroups.add(group));
    if (info.cheOrganization) {
      organizations.add(info.cheOrganization);
    }
  });

  return {
    villages: villages.length,
    languages: languages.size,
    peopleGroups: peopleGroups.size,
    organizations: organizations.size,
  };
}

function buildImpactStats(collections, range) {
  const filteredChurches = filterByDate(collections.churches, "updateDate", range);
  const filteredGrowth = filterByDate(
    collections.growthStats,
    "updatedDate",
    range
  );
  const filteredTrainings = filterByDate(
    collections.trainings,
    "updatedDate",
    range
  );
  const filteredProjects = filterByDate(
    collections.projects,
    "updatedDate",
    range
  );
  const filteredStories = filterByDate(
    collections.stories,
    "updatedDate",
    range
  );

  const trainingPeople = filteredTrainings.reduce(
    (sum, training) => sum + (training.peopleTrained ?? 0),
    0
  );
  const projectPeople = filteredProjects.reduce(
    (sum, project) => sum + (project.peopleTrained ?? 0),
    0
  );
  const storyPeople = filteredStories.reduce(
    (sum, story) => sum + (story.peopleImpacted ?? 0),
    0
  );
  const totalCommitments = filteredChurches.reduce(
    (sum, church) => sum + (church.newCommitments ?? 0),
    0
  );

  const growthBuckets = filteredGrowth.reduce((acc, stat) => {
    const key = stat.growthCategory ?? "Unknown";
    acc[key] = (acc[key] ?? 0) + (stat.count ?? 0);
    return acc;
  }, {});

  const totalPopulation = (collections.villages ?? []).reduce(
    (sum, village) => sum + (village.cheVillageInformation?.population ?? 0),
    0
  );

  return {
    population: totalPopulation,
    movement: {
      churches: filteredChurches.length,
      commitments: totalCommitments,
      peopleTrained: trainingPeople,
      ches: growthBuckets["CHEs"] ?? 0,
      committeeMembers: growthBuckets["Committee Members"] ?? 0,
      committees: growthBuckets["Committees"] ?? 0,
      dbs: growthBuckets["Discovery Bible Studies"] ?? 0,
      growthGroups: growthBuckets["Growth Groups"] ?? 0,
      homesVisited: growthBuckets["Homes Being Visited"] ?? 0,
    },
    trainings: {
      count: filteredTrainings.length,
      places: countUnique(filteredTrainings.map((item) => item.place)),
      people: trainingPeople,
    },
    projects: {
      count: filteredProjects.length,
      places: countUnique(filteredProjects.map((item) => item.place)),
      people: projectPeople,
    },
    stories: {
      count: filteredStories.length,
      people: storyPeople,
    },
  };
}

function ensureOrderedRange(range) {
  const start = parseTimestamp(range.from);
  const end = parseTimestamp(range.to);
  if (start !== null && end !== null && start > end) {
    return { from: range.to, to: range.from };
  }
  return range;
}

function describeRange(range) {
  const start = parseTimestamp(range.from);
  const end = parseTimestamp(range.to);
  if (start !== null && end !== null) {
    const duration = Math.max(1, Math.round((end - start) / 86400000) + 1);
    return {
      text: `${formatHumanDate(start)} → ${formatHumanDate(end)}`,
      detail: `${duration.toLocaleString()} day window`,
    };
  }
  if (start !== null) {
    return {
      text: `Since ${formatHumanDate(start)}`,
      detail: "Open ended through the latest update",
    };
  }
  if (end !== null) {
    return {
      text: `Up to ${formatHumanDate(end)}`,
      detail: "Includes everything prior to this date",
    };
  }
  return {
    text: "All available data",
    detail: "No date filter applied",
  };
}

function filterByDate(items = [], dateField, range) {
  const start = parseTimestamp(range.from);
  const end = parseTimestamp(range.to);

  if (start === null && end === null) {
    return items;
  }

  return items.filter((item) => {
    const value = parseTimestamp(item?.[dateField]);
    if (value === null) return false;
    if (start !== null && value < start) return false;
    if (end !== null && value > end) return false;
    return true;
  });
}

const formatNumber = (value) => {
  const numericValue = Number(value) || 0;
  return numericValue.toLocaleString();
};

const formatInputDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
};

const formatHumanDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const parseTimestamp = (value) => {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const countUnique = (list = []) => {
  const items = list
    .map((value) => value?.trim())
    .filter((value) => Boolean(value));
  return new Set(items).size;
};

function buildMonthlySeries(items = [], dateField, range, resolver) {
  const filtered = filterByDate(items, dateField, range);
  const monthBuckets = new Map();
  filtered.forEach((item) => {
    const timestamp = parseTimestamp(item?.[dateField]);
    if (timestamp === null) return;
    const date = new Date(timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = monthBuckets.get(monthKey) ?? {
      label: formatMonthLabel(date),
      month: monthKey,
      value: 0,
    };
    current.value += resolver(item) ?? 0;
    monthBuckets.set(monthKey, current);
  });
  return Array.from(monthBuckets.values()).sort((a, b) => a.month.localeCompare(b.month));
}

function buildGrowthCategorySeries(growthStats = [], category, range) {
  const filtered = growthStats.filter(
    (stat) => (stat.growthCategory ?? "").toLowerCase() === category.toLowerCase()
  );
  return buildMonthlySeries(filtered, "updatedDate", range, (stat) => stat.count ?? 0);
}

function buildPopulationSeries(villages = [], range = {}) {
  if (!Array.isArray(villages) || villages.length === 0) {
    return [];
  }
  const totalPopulation = villages.reduce(
    (sum, village) => sum + (village.cheVillageInformation?.population ?? 0),
    0
  );
  const points = [];
  const pushPoint = (timestamp) => {
    if (timestamp === null) return;
    const date = new Date(timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (points.some((point) => point.month === monthKey)) {
      return;
    }
    points.push({
      label: formatMonthLabel(date),
      month: monthKey,
      value: totalPopulation,
    });
  };

  const startTs = parseTimestamp(range.from);
  const endTs = parseTimestamp(range.to);
  if (startTs !== null) {
    pushPoint(startTs);
  }
  if (endTs !== null) {
    pushPoint(endTs);
  }

  if (points.length === 0) {
    const now = new Date();
    points.push({
      label: formatMonthLabel(now),
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      value: totalPopulation,
    });
  }

  return points.sort((a, b) => a.month.localeCompare(b.month));
}

function formatMonthLabel(date) {
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

function matchesLocationScope(location = {}, selection = {}) {
  if (selection.continent) {
    const continent = location.continent ?? normalizeContinentName(location.continent);
    if (continent !== selection.continent) return false;
  }
  if (selection.country && location.country !== selection.country) return false;
  if (selection.state && location.state !== selection.state) return false;
  if (selection.district && location.district !== selection.district) return false;
  if (selection.subDistrict && location.subDistrict !== selection.subDistrict)
    return false;
  if (selection.village && location.village !== selection.village) return false;
  return true;
}

function filterByLocationScope(items = [], selection = {}) {
  const hasSelection = Boolean(
    selection.continent ||
      selection.country ||
      selection.state ||
      selection.district ||
      selection.subDistrict ||
      selection.village
  );
  if (!hasSelection) {
    return items ?? [];
  }
  return (items ?? []).filter((item) =>
    matchesLocationScope(item?.__location ?? {}, selection)
  );
}

function filterNormalizedCollections(data = {}, selection = {}) {
  const hasSelection = Boolean(
    selection.continent ||
      selection.country ||
      selection.state ||
      selection.district ||
      selection.subDistrict ||
      selection.village
  );
  if (!hasSelection) {
    return data;
  }
  return {
    ...data,
    villages: filterByLocationScope(data.villages, selection),
    churches: filterByLocationScope(data.churches, selection),
    growthStats: filterByLocationScope(data.growthStats, selection),
    trainings: filterByLocationScope(data.trainings, selection),
    projects: filterByLocationScope(data.projects, selection),
    stories: filterByLocationScope(data.stories, selection),
  };
}

export default HomePage;
