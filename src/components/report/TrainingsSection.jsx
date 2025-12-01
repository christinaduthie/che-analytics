// src/components/report/TrainingsSection.jsx
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

function TrainingsSection({ trainings = [] }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [chartView, setChartView] = useState("timeline");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const yearOptions = useMemo(
    () => buildYearOptions(trainings, "updatedDate"),
    [trainings]
  );

  const yearFilteredTrainings = useMemo(
    () => filterByYear(trainings, selectedYear, "updatedDate"),
    [trainings, selectedYear]
  );

  const filteredTrainings = yearFilteredTrainings;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedTrainings = filteredTrainings.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const totalPages = Math.max(1, Math.ceil(filteredTrainings.length / PAGE_SIZE));
  const handlePageChange = (next) => {
    setPage(Math.min(Math.max(1, next), totalPages));
  };
  useEffect(() => {
    setPage(1);
    setSelectedRows(new Set());
  }, [filteredTrainings]);

  const makeRowKey = (training, index) =>
    `${training.trainingCategory ?? "training"}-${
      training.updatedDate ?? index
    }`;
  const selectedTrainings = useMemo(
    () =>
      filteredTrainings.filter((training, index) =>
        selectedRows.has(makeRowKey(training, index))
      ),
    [filteredTrainings, selectedRows]
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
          filteredTrainings.map((training, index) =>
            makeRowKey(training, index)
          )
        )
      );
    } else {
      setSelectedRows(new Set());
    }
  };

  const totalParticipants = useMemo(
    () => filteredTrainings.reduce((sum, training) => sum + training.peopleTrained, 0),
    [filteredTrainings]
  );

  const timelineData = useMemo(
    () =>
      aggregateMonthlyMetrics(filteredTrainings, "updatedDate", [
        { key: "peopleTrained", accessor: (item) => item.peopleTrained ?? 0 },
      ]),
    [filteredTrainings]
  );

  const categoryChartData = useMemo(
    () => aggregateCategoryTotals(filteredTrainings, "trainingCategory", "peopleTrained"),
    [filteredTrainings]
  );

  const handleDownloadPdf = () => {
    if (!hasSelection) return;
    downloadTablePdf({
      title: "Trainings report",
      columns: ["Category", "Place", "Updated", "People trained"],
      rows: selectedTrainings.map((t) => [
        t.trainingCategory ?? "",
        t.place ?? "",
        t.updatedDate ?? "",
        String(t.peopleTrained ?? 0),
      ]),
      filename: "trainings-report.pdf",
    });
  };

  return (
    <section className="mb-4">
      <div className="report-toolbar d-flex flex-column flex-xl-row justify-content-between align-items-start gap-3 mb-3">
        <div>
          <p className="text-muted text-uppercase small mb-1">Trainings Report</p>
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
                    filteredTrainings.length > 0 &&
                    selectedRows.size === filteredTrainings.length
                  }
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                />
              </th>
              <th>Training category</th>
              <th>Place</th>
              <th>Updated Date</th>
              <th>People trained</th>
              <th>Photos</th>
              <th>Stories</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrainings.map((t, idx) => {
              const globalIndex = startIndex + idx;
              const rowKey = makeRowKey(t, globalIndex);
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
                  <td className="fw-semibold">{t.trainingCategory}</td>
                <td>{t.place}</td>
                <td>{t.updatedDate}</td>
                <td className="fw-semibold">{t.peopleTrained}</td>
                <td className="text-center">
                  <button type="button" className="btn btn-sm btn-outline-secondary" title="View uploaded file">
                    <img src={fileIcon} alt="file" className="file-icon" />
                  </button>
                </td>
                <td>{t.description}</td>
                </tr>
              );
            })}
            {filteredTrainings.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No trainings captured for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredTrainings.length > PAGE_SIZE && (
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
      {filteredTrainings.length > 0 && (
        <div className="chart-container mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 className="section-heading mb-1">Training Growth Chart</h4>
            
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
              series={[{ key: "peopleTrained", color: "#f97316", label: "People trained" }]}
            />
          ) : (
            <D3BarChart data={categoryChartData} xKey="name" yKey="value" barColor="#f97316" />
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

export default TrainingsSection;
