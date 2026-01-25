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
  ChartDataLabels
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
        barThickness: 25, // <-- fixed bar width in pixels
        maxBarThickness: 25, // optional: ensure it never grows too wide
      },
    ],
  };

  const options = {
    indexAxis: "y", // horizontal bars
    responsive: true,
    maintainAspectRatio: false, // allows custom width/height
    plugins: {
      legend: {
        position: "top",
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
        formatter: (value) => `$${value}`, // shows value inside bar
        clamp: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 500,
        display: false, // hides the bottom axis
      },
      y: {
        ticks: {
          font: { size: 14 },
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
      <div style={{ width: "400px", height: "auto" /* "175px" */ }}>
        <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
    );
  }

  return null;
}
