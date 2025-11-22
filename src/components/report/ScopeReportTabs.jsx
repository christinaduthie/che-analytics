import { useMemo, useState } from "react";
import ChurchesSection from "./ChurchesSection";
import GrowthStatsSection from "./GrowthStatsSection";
import TrainingsSection from "./TrainingsSection";
import ProjectsSection from "./ProjectsSection";
import StoriesSection from "./StoriesSection";
import { REPORT_TABS } from "./reportTabsConfig";

function ScopeReportTabs({
  selectionSummary,
  selectionTrail,
  data = {},
}) {
  const [activeTab, setActiveTab] = useState("churches");
  const {
    churches = [],
    growthStats = [],
    trainings = [],
    projects = [],
    stories = [],
    villages = [],
  } = data;

  const totalPopulation = useMemo(
    () =>
      (villages ?? []).reduce(
        (sum, village) => sum + (village.cheVillageInformation?.population ?? 0),
        0
      ),
    [villages]
  );
  const resolvedSummary = selectionSummary || "Selected scope focus";
  const resolvedTrail =
    selectionTrail || "Continent → Country → State → District → Sub district";

  return (
    <section className="report-section mb-4">
      <div className="app-card hero-card p-4 p-lg-5 mb-4 text-white position-relative overflow-hidden">
        <div className="hero-glow" aria-hidden />
        <div className="hero-minimal position-relative">
         
          <h2 className="section-heading text-white mb-2">
            View and Download Reports
          </h2>
        
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
        {activeTab === "churches" && <ChurchesSection churches={churches} />}
        {activeTab === "growth" && (
          <GrowthStatsSection
            growthStatistics={growthStats}
            population={totalPopulation}
          />
        )}
        {activeTab === "trainings" && <TrainingsSection trainings={trainings} />}
        {activeTab === "projects" && <ProjectsSection projects={projects} />}
        {activeTab === "stories" && (
          <StoriesSection transformationStories={stories} />
        )}
      </div>
    </section>
  );
}

export default ScopeReportTabs;
