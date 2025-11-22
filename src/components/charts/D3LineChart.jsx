import { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3LineChart({ data = [], xKey, yKey, height = 320, stroke = "#0d6efd" }) {
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

      const x = d3
        .scalePoint()
        .domain(data.map((item) => item[xKey]))
        .range([0, chartWidth]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (item) => item[yKey]) || 0])
        .nice()
        .range([chartHeight, 0]);

      const lineGenerator = d3
        .line()
        .x((item) => x(item[xKey]))
        .y((item) => y(item[yKey]))
        .curve(d3.curveMonotoneX);

      const chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      chartGroup
        .append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-25)");

      chartGroup.append("g").call(d3.axisLeft(y).ticks(5));

      chartGroup
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", 3)
        .attr("d", lineGenerator);

      chartGroup
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (item) => x(item[xKey]))
        .attr("cy", (item) => y(item[yKey]))
        .attr("r", 5)
        .attr("fill", stroke)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
    };

    render();
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, [data, xKey, yKey, height, stroke]);

  return <svg ref={svgRef} style={{ width: "100%", height }} role="img" aria-label="Line chart" />;
}

export default D3LineChart;
