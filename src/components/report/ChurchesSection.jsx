// src/components/report/ChurchesSection.jsx
import { useEffect, useMemo, useState } from "react";
import fileIcon from "../../assets/file-icon.png";
import D3BarChart from "../charts/D3BarChart";
import D3TimeSeriesChart from "../charts/D3TimeSeriesChart";
import {
  aggregateMonthlyMetrics,
  buildYearOptions,
  filterByYear,
} from "../../utils/chartUtils";
import { downloadTablePdf } from "../../utils/pdfUtils";

const PAGE_SIZE = 10;

function ChurchesSection({ churches = [] }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [chartView, setChartView] = useState("timeline");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const yearOptions = useMemo(
    () => buildYearOptions(churches, "updateDate"),
    [churches]
  );

  const yearFilteredChurches = useMemo(
    () => filterByYear(churches, selectedYear, "updateDate"),
    [churches, selectedYear]
  );

  const filteredChurches = yearFilteredChurches;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedChurches = filteredChurches.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const totalPages = Math.max(1, Math.ceil(filteredChurches.length / PAGE_SIZE));
  const handlePageChange = (next) => {
    setPage(Math.min(Math.max(1, next), totalPages));
  };
  useEffect(() => {
    setPage(1);
    setSelectedRows(new Set());
  }, [filteredChurches]);

  const makeRowKey = (church, index) =>
    `${church.churchName ?? "church"}-${church.updateDate ?? index}`;

  const selectedChurches = useMemo(
    () =>
      filteredChurches.filter((church, index) =>
        selectedRows.has(makeRowKey(church, index))
      ),
    [filteredChurches, selectedRows]
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
          filteredChurches.map((church, index) =>
            makeRowKey(church, index)
          )
        )
      );
    } else {
      setSelectedRows(new Set());
    }
  };

  const chartData = useMemo(
    () =>
      filteredChurches.map((c) => ({
        name: c.churchName,
        newCommitments: c.newCommitments,
        leftFaith: c.leftFaith,
      })),
    [filteredChurches]
  );

  const timelineData = useMemo(
    () =>
      aggregateMonthlyMetrics(filteredChurches, "updateDate", [
        { key: "newCommitments", accessor: (item) => item.newCommitments ?? 0 },
        { key: "leftFaith", accessor: (item) => item.leftFaith ?? 0 },
      ]),
    [filteredChurches]
  );

  const totals = useMemo(
    () =>
      filteredChurches.reduce(
        (acc, item) => {
          acc.newCommitments += item.newCommitments;
          acc.leftFaith += item.leftFaith;
          return acc;
        },
        { newCommitments: 0, leftFaith: 0 }
      ),
    [filteredChurches]
  );

  const handleDownloadPdf = () => {
    if (!hasSelection) return;
    downloadTablePdf({
      title: "Churches overview",
      columns: [
        "Church",
        "Location",
        "Established",
        "Updated",
        "New commitments",
        "Left faith",
      ],
      rows: selectedChurches.map((c) => [
        c.churchName ?? "",
        c.place ?? "",
        c.establishmentDate ?? "",
        c.updateDate ?? "",
        String(c.newCommitments ?? 0),
        String(c.leftFaith ?? 0),
      ]),
      filename: "churches-report.pdf",
    });
  };

  return (
    <section className="mb-4">
      <div className="report-toolbar d-flex flex-column flex-xl-row justify-content-end align-items-start gap-3 mb-3">
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
                    filteredChurches.length > 0 &&
                    selectedRows.size === filteredChurches.length
                  }
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                />
              </th>
              <th>Church</th>
              <th>Location</th>
              <th>Est. date</th>
              <th>Updated</th>
              <th>New commitments</th>
              <th>Left faith</th>
              <th>Files</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChurches.map((c, idx) => {
              const globalIndex = startIndex + idx;
              const rowKey = makeRowKey(c, globalIndex);
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
                  <td className="fw-semibold">{c.churchName}</td>
                <td>{c.place}</td>
                <td>{c.establishmentDate}</td>
                <td>{c.updateDate}</td>
                <td className="fw-semibold">{c.newCommitments}</td>
                <td className="fw-semibold">{c.leftFaith}</td>
                <td className="text-center">
                  <button type="button" className="btn btn-sm btn-outline-secondary" title="View uploaded file">
                    <img src={fileIcon} alt="file" className="file-icon" />
                  </button>
                </td>
                <td>{c.remarks}</td>
                </tr>
              );
            })}
            {filteredChurches.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No churches recorded for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredChurches.length > PAGE_SIZE && (
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
      {filteredChurches.length > 0 && (
        <div className="chart-container mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 className="section-heading mb-1">Engagement trends</h4>
              <p className="text-muted mb-0">
                Switch views to explore the same data over time or by congregation.
              </p>
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
                    {view === "timeline" ? "Timeline" : "By church"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {chartView === "timeline" ? (
            <D3TimeSeriesChart
              data={timelineData}
              series={[
                { key: "newCommitments", color: "#16a34a", label: "New commitments" },
                { key: "leftFaith", color: "#f43f5e", label: "Left faith" },
              ]}
            />
          ) : (
            <D3BarChart
              data={chartData}
              xKey="name"
              series={[
                { key: "newCommitments", color: "#16a34a" },
                { key: "leftFaith", color: "#f43f5e" },
              ]}
            />
          )}
        </div>
      )}
    </section>
  );
}

export default ChurchesSection;
