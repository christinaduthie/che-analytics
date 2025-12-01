// src/components/report/ProjectsSection.jsx
import { useEffect, useMemo, useState } from "react";
import fileIcon from "../../assets/file-icon.png";
import D3BarChart from "../charts/D3BarChart";
import D3TimeSeriesChart from "../charts/D3TimeSeriesChart";
import {
  aggregateCategoryTotals,
  aggregateMonthlyMetrics,
  buildYearOptions,
  filterByYear,
} from "../../utils/chartUtils";
import { downloadTablePdf } from "../../utils/pdfUtils";

const PAGE_SIZE = 10;

function ProjectsSection({ projects = [] }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [chartView, setChartView] = useState("timeline");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const yearOptions = useMemo(
    () => buildYearOptions(projects, "updatedDate"),
    [projects]
  );

  const yearFilteredProjects = useMemo(
    () => filterByYear(projects, selectedYear, "updatedDate"),
    [projects, selectedYear]
  );

  const filteredProjects = yearFilteredProjects;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const handlePageChange = (next) => {
    setPage(Math.min(Math.max(1, next), totalPages));
  };
  useEffect(() => {
    setPage(1);
    setSelectedRows(new Set());
  }, [filteredProjects]);

  const makeRowKey = (project, index) =>
    `${project.projectCategory ?? "project"}-${project.updatedDate ?? index}`;
  const selectedProjects = useMemo(
    () =>
      filteredProjects.filter((project, index) =>
        selectedRows.has(makeRowKey(project, index))
      ),
    [filteredProjects, selectedRows]
  );
  const hasSelection = selectedRows.size > 0;
  const toggleRowSelection = (key) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(
        new Set(
          filteredProjects.map((project, index) =>
            makeRowKey(project, index)
          )
        )
      );
    } else {
      setSelectedRows(new Set());
    }
  };

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
    if (!hasSelection) return;
    downloadTablePdf({
      title: "Projects report",
      columns: ["Category", "Place", "Updated", "People reached"],
      rows: selectedProjects.map((p) => [
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
        <div>
          <p className="text-muted text-uppercase small mb-1">Projects Report</p>
        </div>
        <button
          type="button"
          className="btn btn-download-primary"
          onClick={handleDownloadPdf}
          disabled={!hasSelection}
        >
          Download PDF
        </button>
      </div>
     
      <div className="table-scroll">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th className="text-center">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={
                    filteredProjects.length > 0 &&
                    selectedRows.size === filteredProjects.length
                  }
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                />
              </th>
              <th>Project category</th>
              <th>Place</th>
              <th>Updated Date</th>
              <th>No. of People Benefited</th>
              <th>Photos</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProjects.map((p, idx) => {
              const globalIndex = startIndex + idx;
              const rowKey = makeRowKey(p, globalIndex);
              return (
                <tr key={rowKey}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedRows.has(rowKey)}
                      onChange={() => toggleRowSelection(rowKey)}
                    />
                  </td>
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
              );
            })}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No projects documented for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredProjects.length > PAGE_SIZE && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-muted small">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
      {filteredProjects.length > 0 && (
        <div className="chart-container mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 className="section-heading mb-1">Projects/Initiatives Impact Chart</h4>
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
