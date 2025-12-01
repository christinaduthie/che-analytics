import { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3BarChart({
  data = [],
  xKey,
  yKey,
  height = 320,
  barColor = "#0d6efd",
  series,
  xAxisLabel = "",
  yAxisLabel = "",
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const render = () => {
      const bounds = svgElement.getBoundingClientRect();
      const width = bounds.width || 600;

      const margin = { top: 20, right: 20, bottom: 60, left: 50 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const svg = d3.select(svgElement);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      if (!data.length) {
        return;
      }

      const seriesConfig =
        Array.isArray(series) && series.length
          ? series
          : [{ key: yKey, color: barColor }];

      const x0 = d3
        .scaleBand()
        .domain(data.map((item) => item[xKey]))
        .range([0, chartWidth])
        .paddingInner(0.2);

      const x1 = d3
        .scaleBand()
        .domain(seriesConfig.map((s) => s.key))
        .range([0, x0.bandwidth()])
        .padding(0.07);

      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(data, (item) =>
            d3.max(seriesConfig, (serie) => item[serie.key] ?? 0)
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
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-25)");

      chartGroup.append("g").call(d3.axisLeft(y).ticks(5));

      if (xAxisLabel) {
        chartGroup
          .append("text")
          .attr("class", "axis-label")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight + margin.bottom - 5)
          .attr("text-anchor", "middle")
          .text(xAxisLabel);
      }

      if (yAxisLabel) {
        chartGroup
          .append("text")
          .attr("class", "axis-label")
          .attr("transform", `rotate(-90)`)
          .attr("x", -chartHeight / 2)
          .attr("y", -margin.left + 15)
          .attr("text-anchor", "middle")
          .text(yAxisLabel);
      }

      const barGroups = chartGroup
        .selectAll(".bar-group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", (item) => `translate(${x0(item[xKey])},0)`);

      barGroups
        .selectAll("rect")
        .data((item) =>
          seriesConfig.map((serie) => ({
            key: serie.key,
            value: item[serie.key] ?? 0,
            color: serie.color || barColor,
          }))
        )
        .enter()
        .append("rect")
        .attr("x", (d) => x1(d.key))
        .attr("y", (d) => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", (d) => chartHeight - y(d.value))
        .attr("fill", (d) => d.color)
        .attr("rx", 6)
        .attr("ry", 6);
    };

    render();
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, [data, xKey, yKey, height, barColor, series]);

  return <svg ref={svgRef} style={{ width: "100%", height }} role="img" aria-label="Bar chart" />;
}

export default D3BarChart;
