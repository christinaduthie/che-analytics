// src/components/report/GrowthStatsSection.jsx
import { useMemo, useState } from "react";
import D3BarChart from "../charts/D3BarChart";
import D3TimeSeriesChart from "../charts/D3TimeSeriesChart";
import {
  aggregateCategoryTotals,
  aggregateMonthlyMetrics,
  buildYearOptions,
  filterByYear,
  topCategoriesBySum,
} from "../../utils/chartUtils";
import DateRangeSlider from "./DateRangeSlider";
import {
  buildDefaultDateRange,
  filterByDateRange,
} from "../../utils/dateRangeUtils";
import { downloadTablePdf } from "../../utils/pdfUtils";

function GrowthStatsSection({ growthStatistics = [], population = 0 }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [chartView, setChartView] = useState("timeline");
  const [dateRange, setDateRange] = useState(() => buildDefaultDateRange());

  const yearOptions = useMemo(
    () => buildYearOptions(growthStatistics, "updatedDate"),
    [growthStatistics]
  );

  const yearFilteredGrowth = useMemo(
    () => filterByYear(growthStatistics, selectedYear, "updatedDate"),
    [growthStatistics, selectedYear]
  );

  const filteredGrowth = useMemo(
    () => filterByDateRange(yearFilteredGrowth, "updatedDate", dateRange),
    [yearFilteredGrowth, dateRange]
  );

  const total = useMemo(
    () => filteredGrowth.reduce((sum, item) => sum + item.count, 0),
    [filteredGrowth]
  );

  const topCategories = useMemo(() => {
    const base = filteredGrowth.length ? filteredGrowth : growthStatistics;
    return topCategoriesBySum(base, "growthCategory", "count", 4);
  }, [filteredGrowth, growthStatistics]);

  const seriesMetrics = useMemo(
    () =>
      topCategories.map((category) => ({
        key: category,
        accessor: (item) =>
          item.growthCategory === category ? item.count ?? 0 : 0,
        label: category,
      })),
    [topCategories]
  );

  const timelineData = useMemo(
    () =>
      aggregateMonthlyMetrics(filteredGrowth, "updatedDate", seriesMetrics),
    [filteredGrowth, seriesMetrics]
  );

  const categoryChartData = useMemo(
    () => aggregateCategoryTotals(filteredGrowth, "growthCategory", "count"),
    [filteredGrowth]
  );

  const handleDownloadPdf = () => {
    if (!filteredGrowth.length) return;
    downloadTablePdf({
      title: "Growth indicators",
      columns: ["Category", "Count", "Updated"],
      rows: filteredGrowth.map((g) => [
        g.growthCategory ?? "",
        String(g.count ?? 0),
        g.updatedDate ?? "",
      ]),
      filename: "growth-indicators.pdf",
    });
  };

  const formattedPopulation =
    typeof population === "number" ? population.toLocaleString() : population;

  return (
    <section className="mb-4">
      <div className="report-toolbar d-flex flex-column flex-xl-row justify-content-between align-items-start gap-3 mb-3">
        <DateRangeSlider value={dateRange} onChange={setDateRange} />
        <button
          type="button"
          className="btn btn-download-primary"
          onClick={handleDownloadPdf}
          disabled={filteredGrowth.length === 0}
        >
          Download PDF
        </button>
      </div>
    
      <div className="table-scroll">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Growth category</th>
              <th>Count</th>
              <th>Updated Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrowth.map((g, idx) => (
              <tr key={g.growthCategory + idx}>
                <td>{g.growthCategory}</td>
                <td className="fw-semibold">{g.count}</td>
                <td>{g.updatedDate}</td>
              </tr>
            ))}
            {filteredGrowth.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No growth statistics logged for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredGrowth.length > 0 && (
        <div className="chart-container mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 className="section-heading mb-1">Growth analytics</h4>
              <p className="text-muted mb-0">
                Timeline focuses on top categories in this view.
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
                    {view === "timeline" ? "Timeline" : "By category"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {chartView === "timeline" && seriesMetrics.length > 0 ? (
            <D3TimeSeriesChart
              data={timelineData}
              series={seriesMetrics.map((serie, idx) => ({
                key: serie.key,
                color: ["#0ea5e9", "#8b5cf6", "#10b981", "#f97316"][idx % 4],
                label: serie.label,
              }))}
            />
          ) : (
            <D3BarChart data={categoryChartData} xKey="name" yKey="value" barColor="#0ea5e9" />
          )}
        </div>
      )}
    </section>
  );
}

export default GrowthStatsSection;
