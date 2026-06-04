export const chartDefaults = {
  cartesianGrid: { strokeDasharray: "3 3", stroke: "#1e293b", vertical: false },
  xAxis: { axisLine: false, tickLine: false, tick: { fill: "#64748b", fontSize: 12, fontFamily: "var(--font-mono)" } },
  yAxis: { axisLine: false, tickLine: false, tick: { fill: "#64748b", fontSize: 12, fontFamily: "var(--font-mono)" } },
  tooltip: {
    contentStyle: {
      backgroundColor: "#0f172a",
      border: "1px solid #1e293b",
      borderRadius: "16px",
      color: "#f8fafc",
      fontFamily: "var(--font-sans)",
    },
    itemStyle: { color: "#f8fafc" },
  },
};
