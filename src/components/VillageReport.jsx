// src/components/VillageReport.jsx
import { useState } from "react";
import ChurchesSection from "./report/ChurchesSection";
import TrainingsSection from "./report/TrainingsSection";
import ProjectsSection from "./report/ProjectsSection";
import StoriesSection from "./report/StoriesSection";
import { REPORT_TABS } from "./report/reportTabsConfig";

const WORKER_STATUS_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function VillageReport({ village }) {
  const [activeTab, setActiveTab] = useState("churches");
  const info = village.cheVillageInformation;
  const workerPhone = formatWorkerPhone(info.cheWorkerPhone);
  const teleDoctorStatusLabel = info.teleDoctorAccess
    ? "Available"
    : "Not available";
  const teleDoctorStatusClass = info.teleDoctorAccess ? "available" : "unavailable";
  const teleDoctorStatusDate = formatDisplayDate(info.teleDoctorAccessDate);
  const workerStatusItems = [
    {
      id: "che-training",
      label: "CHE Trained",
      dateLabel: "Date",
      date: info.cheWorkerTrainedDate,
      isComplete: Boolean(info.cheWorkerTrained),
    },
    {
      id: "mvc-status",
      label: "MVC Status",
      dateLabel: "Date",
      date: info.mvcAdoptedDate,
      isComplete: Boolean(info.mvcStatus),
    },
  ];

  const infoTiles = [
    { label: "CHE Village", value: info.cheVillageName },
    { label: "CHE Organization", value: info.cheOrganization },
    { label: "Population", value: info.population.toLocaleString() },
    { label: "Languages", value: info.languageSpoken },
    { label: "People Groups", value: info.peopleGroups },
    { label: "Poverty Index", value: info.povertyIndex },
    { label: "CHE Worker", value: info.cheWorkerName },
    {
      label: "Worker Organization",
      value: info.cheWorkerOrganization,
    },
  ];

  const quickMetrics = [
    { label: "Churches", value: village.churches.length, tone: "purple" },
    { label: "Growth logs", value: village.growthStatistics.length, tone: "lime" },
    { label: "Trainings", value: village.trainings.length, tone: "blue" },
    { label: "Projects", value: village.projects.length, tone: "amber" },
    { label: "Stories", value: village.transformationStories.length, tone: "rose" },
  ];

  return (
    <section className="report-section mb-4">
      <div className="report-tabs mb-3">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`report-tab ${activeTab === tab.id ? "active" : ""}`}
          >
            <span className="report-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="report-panel app-card p-4">
        {activeTab === "churches" && <ChurchesSection churches={village.churches} />}
        {activeTab === "trainings" && <TrainingsSection trainings={village.trainings} />}
        {activeTab === "projects" && <ProjectsSection projects={village.projects} />}
        {activeTab === "stories" && (
          <StoriesSection transformationStories={village.transformationStories} />
        )}
      </div>

      <div className="report-hero app-card p-4 p-lg-5 mt-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-8">
            
            <h1 className="display-6 text-white mb-3">{info.cheVillageName}</h1>
            <div className="tele-doctor-meta mb-3">
              <span className="tele-doctor-label">TeleDoctor Access</span>
              <span className={`tele-doctor-status ${teleDoctorStatusClass}`}>
                {teleDoctorStatusLabel}
              </span>
              <span className="tele-doctor-date">Date: {teleDoctorStatusDate}</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="hero-chip">{info.languageSpoken.length} languages</span>
              <span className="hero-chip">{info.peopleGroups.length} people groups</span>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="report-worker-card">
              <p className="muted-label mb-1 text-white-50">CHE worker</p>
              <h3 className="h5 text-white mb-3">{info.cheWorkerName}</h3>
              <div className="worker-meta">
                <MetricBadge label="CHE Worker Organization" value={info.cheWorkerOrganization} />
                {workerPhone && (
                  <MetricBadge label="Phone" value={workerPhone} />
                )}
              </div>
              <div className="worker-status-list mt-4">
                {workerStatusItems.map((item) => (
                  <WorkerStatusItem key={item.id} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatWorkerPhone(phone) {
  if (!phone) {
    return "";
  }
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (hasPlus && digitsOnly.length > 10) {
    const countryDigits = digitsOnly.slice(0, digitsOnly.length - 10);
    const nationalDigits = digitsOnly.slice(-10);
    return `+${countryDigits} ${nationalDigits}`;
  }

  if (hasPlus) {
    return `+${digitsOnly}`;
  }

  return digitsOnly;
}

function InfoRow({ label, value }) {
  const isArray = Array.isArray(value);
  return (
    <div className="col">
      <div className="report-info-card h-100">
        <p className="muted-label text-uppercase mb-2">{label}</p>
        {isArray ? (
          <div className="d-flex flex-wrap gap-1">
            {value.map((item) => (
              <span key={`${label}-${item}`} className="text-chip">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="fw-semibold mb-0">{value}</p>
        )}
      </div>
    </div>
  );
}

function MetricBadge({ label, value }) {
  return (
    <div className="worker-meta-badge">
      <p className="text-uppercase small text-white-50 mb-1">{label}</p>
      <p className="text-white fw-semibold mb-0">{value}</p>
    </div>
  );
}

function WorkerStatusItem({ label, dateLabel, date, isComplete }) {
  const iconLabel = `${label} ${isComplete ? "complete" : "pending"}`;
  const iconSymbol = isComplete ? "✓" : "×";
  return (
    <div className="worker-status-item">
      <div>
        <p className="worker-status-label mb-1">{label}</p>
        {isComplete && (
          <p className="text-white fw-semibold mb-0">
            {dateLabel}: {formatDisplayDate(date)}
          </p>
        )}
      </div>
      <span
        className={`worker-status-icon ${isComplete ? "" : "inactive"}`}
        role="img"
        aria-label={iconLabel}
      >
        {iconSymbol}
      </span>
    </div>
  );
}

function formatDisplayDate(date) {
  if (!date) {
    return "Not recorded";
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed)) {
    return date;
  }
  return WORKER_STATUS_DATE_FORMATTER.format(parsed);
}

export default VillageReport;
