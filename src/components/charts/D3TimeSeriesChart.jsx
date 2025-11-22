import { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3TimeSeriesChart({ data = [], series = [], height = 320 }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    const tooltipElement = tooltipRef.current;
    if (!svgElement || !tooltipElement) return;

    const render = () => {
      const bounds = svgElement.getBoundingClientRect();
      const width = bounds.width || 600;

      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const svg = d3.select(svgElement);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      if (!data.length) return;

      const sorted = [...data].sort((a, b) => a.date - b.date);

      const x = d3
        .scaleTime()
        .domain(d3.extent(sorted, (item) => item.date))
        .range([0, chartWidth]);

      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(sorted, (item) =>
            d3.max(series, (serie) => item[serie.key] ?? 0)
          ) || 0,
        ])
        .nice()
        .range([chartHeight, 0]);

      const chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      chartGroup
        .append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x).ticks(Math.min(6, sorted.length)))
        .selectAll("text")
        .attr("font-size", "0.75rem");

      chartGroup.append("g").call(d3.axisLeft(y).ticks(5));

      const lineGenerator = (serieKey) =>
        d3
          .line()
          .defined((item) => typeof item[serieKey] === "number")
          .x((item) => x(item.date))
          .y((item) => y(item[serieKey]))
          .curve(d3.curveMonotoneX);

      series.forEach((serie) => {
        chartGroup
          .append("path")
          .datum(sorted)
          .attr("fill", "none")
          .attr("stroke", serie.color || "#2563eb")
          .attr("stroke-width", 2.5)
          .attr("d", lineGenerator(serie.key));
      });

      const focusGroup = chartGroup.append("g").style("display", "none");
      const focusLine = focusGroup
        .append("line")
        .attr("class", "focus-line")
        .attr("stroke", "rgba(15,23,42,0.35)")
        .attr("stroke-dasharray", "4")
        .attr("y1", 0)
        .attr("y2", chartHeight);

      const focusDots = series.map((serie) =>
        focusGroup
          .append("circle")
          .attr("r", 5)
          .attr("fill", serie.color || "#2563eb")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
      );

      const bisect = d3.bisector((item) => item.date).center;
      const tooltip = d3.select(tooltipElement);

      const showTooltip = (event) => {
        const [pointerX] = d3.pointer(event, chartGroup.node());
        const date = x.invert(pointerX);
        const index = bisect(sorted, date);
        const selected = sorted[index];
        if (!selected) return;

        focusGroup.style("display", null);
        focusLine.attr("x1", x(selected.date)).attr("x2", x(selected.date));

        focusDots.forEach((dot, idx) => {
          const serieKey = series[idx].key;
          dot
            .attr("cx", x(selected.date))
            .attr("cy", y(selected[serieKey] ?? 0));
        });

        const tooltipEntries = series
          .map(
            (serie) =>
              `<div><span style="display:inline-block;width:10px;height:10px;background:${
                serie.color || "#2563eb"
              };border-radius:999px;margin-right:6px;"></span>${serie.label}: <strong>${
                selected[serie.key]?.toLocaleString() ?? 0
              }</strong></div>`
          )
          .join("");

        tooltip
          .html(
            `<div class="tooltip-date">${selected.date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}</div>${tooltipEntries}`
          )
          .style("opacity", 1);

        const containerRect = svgElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const left =
          containerRect.left +
          margin.left +
          x(selected.date) -
          tooltipRect.width / 2;
        const top =
          containerRect.top + margin.top + y(selected[series[0].key] ?? 0) - 40;

        tooltip.style("left", `${left}px`).style("top", `${top}px`);
      };

      const hideTooltip = () => {
        focusGroup.style("display", "none");
        tooltip.style("opacity", 0);
      };

      chartGroup
        .append("rect")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("fill", "transparent")
        .on("pointermove", showTooltip)
        .on("pointerleave", hideTooltip);
    };

    render();
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, [data, series, height]);

  return (
    <div className="d3-time-series">
      <svg ref={svgRef} style={{ width: "100%", height }} role="img" aria-label="Time series chart" />
      <div ref={tooltipRef} className="chart-tooltip" />
    </div>
  );
}

export default D3TimeSeriesChart;
