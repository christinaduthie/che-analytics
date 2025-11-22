// src/components/LocationFilters.jsx
function LocationFilters({
  countries,
  currentCountry,
  currentState,
  currentDistrict,
  selectedCountry,
  selectedState,
  selectedDistrict,
  selectedSubDistrict,
  onCountryChange,
  onStateChange,
  onDistrictChange,
  onSubDistrictChange,
  onReset,
}) {
  const states = currentCountry?.states ?? [];
  const districts = currentState?.districts ?? [];
  const subDistricts = currentDistrict?.subDistricts ?? [];

  const selectionTrail = [
    selectedCountry || "Country",
    selectedState || "State",
    selectedDistrict || "District",
    selectedSubDistrict || "Sub District",
  ].join(" → ");

  const steps = [
    { label: "Country", value: selectedCountry },
    { label: "State", value: selectedState },
    { label: "District", value: selectedDistrict },
    { label: "Sub District", value: selectedSubDistrict },
  ];

  return (
    <section className="app-card p-4 mb-4 bg-white">
      <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-start">
        <div>
          <div className="d-flex flex-wrap gap-2 text-uppercase small text-secondary fw-semibold mb-2">
            <span className="badge bg-primary-subtle text-primary-emphasis">Guided filters</span>
            <span className="badge bg-light text-secondary">{selectionTrail}</span>
          </div>
          <h2 className="section-heading mb-1">Locate a community in four focused steps</h2>
          <p className="text-muted mb-0">
            Each dropdown unlocks the next so your selections stay precise and traceable as you move toward a
            village.
          </p>
        </div>
        <div className="text-md-end">
          <div className="text-uppercase small text-muted">Manage selection</div>
          <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={onReset}>
            Clear selection
          </button>
        </div>
      </div>

      <div className="row g-3 mt-3">
        {steps.map((step, index) => {
          const reached =
            index === 0 || steps.slice(0, index).every((s) => Boolean(s.value));
          const completed = Boolean(step.value);
          return (
            <div key={step.label} className="col-12 col-sm-6 col-lg-3">
              <div
                className={`border rounded-3 p-3 h-100 ${completed ? "border-success-subtle bg-success-subtle" : reached ? "bg-light" : "bg-body-secondary"}`}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className={`rounded-circle px-3 py-2 fw-semibold ${completed ? "bg-success text-white" : "bg-white border"}`}>
                    {completed ? "✓" : index + 1}
                  </div>
                  <div>
                    <div className="text-uppercase small text-muted">Step {index + 1}</div>
                    <div className="fw-semibold">{step.value || step.label}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row g-3 mt-1">
        <div className="col-12 col-md-6 col-xl-3">
          <FilterSelect
            label="Country"
            value={selectedCountry}
            onChange={onCountryChange}
            options={countries.map((c) => ({
              label: c.countryName,
              value: c.countryName,
            }))}
            placeholder="Select country"
            helper={`${countries.length} available`}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <FilterSelect
            label="State"
            value={selectedState}
            onChange={onStateChange}
            options={states.map((s) => ({
              label: s.stateName,
              value: s.stateName,
            }))}
            placeholder={selectedCountry ? "Select state" : "Pick a country first"}
            helper={`${states.length} available`}
            disabled={!selectedCountry}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <FilterSelect
            label="District"
            value={selectedDistrict}
            onChange={onDistrictChange}
            options={districts.map((d) => ({
              label: d.districtName,
              value: d.districtName,
            }))}
            placeholder={selectedState ? "Select district" : "Awaiting state selection"}
            helper={`${districts.length} available`}
            disabled={!selectedState}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <FilterSelect
            label="Sub district"
            value={selectedSubDistrict}
            onChange={onSubDistrictChange}
            options={subDistricts.map((sd) => ({
              label: sd.subDistrictName,
              value: sd.subDistrictName,
            }))}
            placeholder={selectedDistrict ? "Select sub district" : "Awaiting district"}
            helper={`${subDistricts.length} available`}
            disabled={!selectedDistrict}
          />
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  helper,
  disabled,
}) {
  return (
    <div className="border rounded-3 p-3 h-100">
      <label htmlFor={label} className="form-label fw-semibold w-100">
        {label}
      </label>
      <div className="text-muted small mb-2">{helper}</div>
      <select
        id={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="text-muted small mt-2">
        {value ? "Ready" : disabled ? "Locked" : "Select"}
      </div>
    </div>
  );
}

export default LocationFilters;
