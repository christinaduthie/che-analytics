// src/components/report/StoriesSection.jsx
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

function StoriesSection({ transformationStories = [] }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [chartView, setChartView] = useState("timeline");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const yearOptions = useMemo(
    () => buildYearOptions(transformationStories, "updatedDate"),
    [transformationStories]
  );

  const yearFilteredStories = useMemo(
    () => filterByYear(transformationStories, selectedYear, "updatedDate"),
    [transformationStories, selectedYear]
  );

  const filteredStories = yearFilteredStories;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedStories = filteredStories.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / PAGE_SIZE));
  const handlePageChange = (next) => {
    setPage(Math.min(Math.max(1, next), totalPages));
  };
  useEffect(() => {
    setPage(1);
    setSelectedRows(new Set());
  }, [filteredStories]);

  const makeRowKey = (story, index) =>
    `${story.storiesCategory ?? "story"}-${story.updatedDate ?? index}`;
  const selectedStories = useMemo(
    () =>
      filteredStories.filter((story, index) =>
        selectedRows.has(makeRowKey(story, index))
      ),
    [filteredStories, selectedRows]
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
          filteredStories.map((story, index) => makeRowKey(story, index))
        )
      );
    } else {
      setSelectedRows(new Set());
    }
  };

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
    if (!hasSelection) return;
    downloadTablePdf({
      title: "Transformation Stories",
      columns: ["Category", "Place", "Updated", "People impacted"],
      rows: selectedStories.map((s) => [
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
        <div>
          <p className="text-muted text-uppercase small mb-1">Stories Report</p>
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
                    filteredStories.length > 0 &&
                    selectedRows.size === filteredStories.length
                  }
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                />
              </th>
              <th>Stories category</th>
              <th>Place</th>
              <th>Updated Date</th>
              <th>Title</th>
              <th>Photos</th>
              <th>Stories</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStories.map((s, idx) => {
              const globalIndex = startIndex + idx;
              const rowKey = makeRowKey(s, globalIndex);
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
                  <td className="fw-semibold">{s.storiesCategory}</td>
                  <td>{s.place}</td>
                  <td>{s.updatedDate}</td>
                  <td>{s.storyTitle ?? "Untitled Story"}</td>
                  <td className="text-center">
                    <button type="button" className="btn btn-sm btn-outline-secondary" title="View uploaded file">
                      <img src={fileIcon} alt="file" className="file-icon" />
                    </button>
                  </td>
                  <td>{s.description}</td>
                </tr>
              );
            })}
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
      {filteredStories.length > PAGE_SIZE && (
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
