// src/components/report/StoriesSection.jsx
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

function StoriesSection({ transformationStories = [] }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [chartView, setChartView] = useState("timeline");
  const [dateRange, setDateRange] = useState(() => buildDefaultDateRange());

  const yearOptions = useMemo(
    () => buildYearOptions(transformationStories, "updatedDate"),
    [transformationStories]
  );

  const yearFilteredStories = useMemo(
    () => filterByYear(transformationStories, selectedYear, "updatedDate"),
    [transformationStories, selectedYear]
  );

  const filteredStories = useMemo(
    () => filterByDateRange(yearFilteredStories, "updatedDate", dateRange),
    [yearFilteredStories, dateRange]
  );

  const totalImpacted = useMemo(
    () => filteredStories.reduce((sum, story) => sum + story.peopleImpacted, 0),
    [filteredStories]
  );

  const timelineData = useMemo(
    () =>
      aggregateMonthlyMetrics(filteredStories, "updatedDate", [
        { key: "peopleImpacted", accessor: (item) => item.peopleImpacted ?? 0 },
      ]),
    [filteredStories]
  );

  const categoryChartData = useMemo(
    () =>
      aggregateCategoryTotals(filteredStories, "storiesCategory", "peopleImpacted"),
    [filteredStories]
  );

  const handleDownloadPdf = () => {
    if (!filteredStories.length) return;
    downloadTablePdf({
      title: "Transformation stories",
      columns: ["Category", "Place", "Updated", "People impacted"],
      rows: filteredStories.map((s) => [
        s.storiesCategory ?? "",
        s.place ?? "",
        s.updatedDate ?? "",
        String(s.peopleImpacted ?? 0),
      ]),
      filename: "stories-report.pdf",
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
          disabled={filteredStories.length === 0}
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
              <th>Stories category</th>
              <th>Place</th>
              <th>Updated</th>
              <th>People impacted</th>
              <th>File</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.map((s, idx) => (
              <tr key={s.storiesCategory + idx}>
                <td className="fw-semibold">{s.storiesCategory}</td>
                <td>{s.place}</td>
                <td>{s.updatedDate}</td>
                <td className="fw-semibold">{s.peopleImpacted}</td>
                <td className="text-center">
                  <button type="button" className="btn btn-sm btn-outline-secondary" title="View uploaded file">
                    <img src={fileIcon} alt="file" className="file-icon" />
                  </button>
                </td>
                <td>{s.description}</td>
              </tr>
            ))}
            {filteredStories.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No transformation stories submitted for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredStories.length > 0 && (
        <div className="chart-container mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 className="section-heading mb-1">Impact storytelling</h4>
              <p className="text-muted mb-0">Drill down into when and how lives were changed.</p>
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
              series={[{ key: "peopleImpacted", color: "#f43f5e", label: "People impacted" }]}
            />
          ) : (
            <D3BarChart data={categoryChartData} xKey="name" yKey="value" barColor="#f43f5e" />
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

export default StoriesSection;
