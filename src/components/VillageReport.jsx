// src/components/VillageReport.jsx
import { useState } from "react";
import ChurchesSection from "./report/ChurchesSection";
import TrainingsSection from "./report/TrainingsSection";
import ProjectsSection from "./report/ProjectsSection";
import StoriesSection from "./report/StoriesSection";
import { REPORT_TABS } from "./report/reportTabsConfig";

function VillageReport({ village }) {
  const [activeTab, setActiveTab] = useState("churches");
  const info = village.cheVillageInformation;
  const workerShortName =
    typeof info.cheWorkerName === "string"
      ? info.cheWorkerName.split(" ")[0]
      : "Worker";

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
      <div className="report-hero app-card p-4 p-lg-5 mb-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-8">
            <div className="hero-eyebrow text-uppercase small text-white-50 mb-2">
              Village dossier · Population {info.population.toLocaleString()}
            </div>
            <h1 className="display-6 text-white mb-3">{info.cheVillageName}</h1>
            <p className="text-white-50 mb-4">
              A living snapshot of churches, trainings, projects, and transformation stories curated
              by CHE workers on the ground.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="hero-chip">{workerShortName} on duty</span>
              <span className="hero-chip">{info.languageSpoken.length} languages</span>
              <span className="hero-chip">{info.peopleGroups.length} people groups</span>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="report-worker-card">
              <p className="muted-label mb-1 text-white-50">Lead worker</p>
              <h3 className="h5 text-white mb-1">{info.cheWorkerName}</h3>
              <p className="text-white-50 mb-3">{info.cheWorkerOrganization}</p>
              <div className="worker-meta">
                <MetricBadge label="CHE Organization" value={info.cheOrganization} />
                <MetricBadge label="Poverty index" value={info.povertyIndex} />
              </div>
            </div>
          </div>
        </div>
      </div>

   

    

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
    </section>
  );
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

export default VillageReport;
