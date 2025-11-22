// src/components/report/ProjectsSection.jsx
import { useMemo, useState } from "react";
import fileIcon from "../../assets/file-icon.png";
import D3BarChart from "../charts/D3BarChart";
import D3TimeSeriesChart from "../charts/D3TimeSeriesChart";
import {
  aggregateCategoryTotals,
  aggregateMonthlyMetrics,
  buildYearOptions,
  filterByYear,
} from "../../utils/chartUtils";
import DateRangeSlider from "./DateRangeSlider";
import {
  buildDefaultDateRange,
  filterByDateRange,
} from "../../utils/dateRangeUtils";
import { downloadTablePdf } from "../../utils/pdfUtils";

function ProjectsSection({ projects = [] }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [chartView, setChartView] = useState("timeline");
  const [dateRange, setDateRange] = useState(() => buildDefaultDateRange());

  const yearOptions = useMemo(
    () => buildYearOptions(projects, "updatedDate"),
    [projects]
  );

  const yearFilteredProjects = useMemo(
    () => filterByYear(projects, selectedYear, "updatedDate"),
    [projects, selectedYear]
  );

  const filteredProjects = useMemo(
    () => filterByDateRange(yearFilteredProjects, "updatedDate", dateRange),
    [yearFilteredProjects, dateRange]
  );

  const totalPeople = useMemo(
    () => filteredProjects.reduce((sum, project) => sum + project.peopleTrained, 0),
    [filteredProjects]
  );

  const timelineData = useMemo(
    () =>
      aggregateMonthlyMetrics(filteredProjects, "updatedDate", [
        { key: "peopleTrained", accessor: (item) => item.peopleTrained ?? 0 },
      ]),
    [filteredProjects]
  );

  const categoryChartData = useMemo(
    () => aggregateCategoryTotals(filteredProjects, "projectCategory", "peopleTrained"),
    [filteredProjects]
  );

  const handleDownloadPdf = () => {
    if (!filteredProjects.length) return;
    downloadTablePdf({
      title: "Projects report",
      columns: ["Category", "Place", "Updated", "People reached"],
      rows: filteredProjects.map((p) => [
        p.projectCategory ?? "",
        p.place ?? "",
        p.updatedDate ?? "",
        String(p.peopleTrained ?? 0),
      ]),
      filename: "projects-report.pdf",
    });
  };

  return (
    <section className="mb-4">
      <div className="report-toolbar d-flex flex-column flex-xl-row justify-content-between align-items-start gap-3 mb-3">
        <DateRangeSlider value={dateRange} onChange={setDateRange} />
        <button
          type="button"
          className="btn btn-download-primary"
          onClick={handleDownloadPdf}
          disabled={filteredProjects.length === 0}
        >
          Download PDF
        </button>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-2 chart-toolbar">
        <span className="text-muted small">
          {selectedYear === "all" ? "Showing all years" : `Filtered to ${selectedYear}`}
        </span>
        {yearOptions.length > 0 && (
          <select
            className="form-select form-select-sm w-auto"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
          >
            <option value="all">All years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="table-scroll">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Project category</th>
              <th>Place</th>
              <th>Updated</th>
              <th>People trained</th>
              <th>File</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p, idx) => (
              <tr key={p.projectCategory + idx}>
                <td className="fw-semibold">{p.projectCategory}</td>
                <td>{p.place}</td>
                <td>{p.updatedDate}</td>
                <td className="fw-semibold">{p.peopleTrained}</td>
                <td className="text-center">
                  <button type="button" className="btn btn-sm btn-outline-secondary" title="View uploaded file">
                    <img src={fileIcon} alt="file" className="file-icon" />
                  </button>
                </td>
                <td>{p.description}</td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No projects documented for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredProjects.length > 0 && (
        <div className="chart-container mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 className="section-heading mb-1">Impact analytics</h4>
              <p className="text-muted mb-0">Compare reach across time or by initiative.</p>
            </div>
            <div className="chart-toolbar">
              <div className="view-toggle">
                {["timeline", "category"].map((view) => (
                  <button
                    key={view}
                    type="button"
                    className={chartView === view ? "active" : ""}
                    onClick={() => setChartView(view)}
                  >
                    {view === "timeline" ? "Timeline" : "By category"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {chartView === "timeline" ? (
            <D3TimeSeriesChart
              data={timelineData}
              series={[{ key: "peopleTrained", color: "#a855f7", label: "People reached" }]}
            />
          ) : (
            <D3BarChart data={categoryChartData} xKey="name" yKey="value" barColor="#a855f7" />
          )}
        </div>
      )}
    </section>
  );
}

function MiniStat({ label, value }) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div className="border rounded-3 p-3 bg-light text-center">
      <p className="text-uppercase small text-muted mb-1">{label}</p>
      <p className="fs-4 fw-semibold mb-0">{formattedValue}</p>
    </div>
  );
}

export default ProjectsSection;
