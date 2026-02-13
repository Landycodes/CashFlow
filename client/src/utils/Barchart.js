import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// register Chart.js components and plugin
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  Colors
);

export default function BarChart({ data }) {
  const [render, setRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRender(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderWidth: 1,
        label: "Spending",
        // barThickness: 25, // <-- fixed bar width in pixels
        maxBarThickness: 25, // optional: ensure it never grows too wide
      },
    ],
  };

  const options = {
    indexAxis: "y", // horizontal bars
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.formattedValue}`,
          labelPointStyle: () => ({
            pointStyle: false, // disables the square
          }),
        },
        usePointStyle: true, // must be set for labelPointStyle to apply
      },
      datalabels: {
        anchor: "end",
        align: "end",
        font: { size: 14 },
        color: "white",
        formatter: (value) => `$${Number(value).toLocaleString()}`,
        clamp: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grace: 1000,
        display: false, // hides the bottom axis
      },
      y: {
        ticks: {
          font: { size: 14 },
          color: "white",
          maxTicksLimit: 10,
          callback: function (val) {
            const label = this.getLabelForValue(val);
            return label.split(" ").join("\n");
          },
        },
      },
    },
  };

  if (render) {
    return (
      <div style={{ minWidth: "500px", maxHeight: "100%" }}>
        <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
    );
  }

  return null;
}
