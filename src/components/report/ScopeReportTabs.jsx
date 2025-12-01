import { useState } from "react";
import ChurchesSection from "./ChurchesSection";
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
    trainings = [],
    projects = [],
    stories = [],
  } = data;
  const resolvedSummary = selectionSummary || "Selected scope focus";
  const resolvedTrail =
    selectionTrail || "Continent → Country → State → District → Sub district";

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
        {activeTab === "churches" && <ChurchesSection churches={churches} />}
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
