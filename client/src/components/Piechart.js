import { Pie } from "react-chartjs-2";
import { Chart, ArcElement as Arc, Tooltip, Legend } from "chart.js";

Chart.register(Arc, Tooltip, Legend);

export default function PieChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: ["rgba(7, 225, 109, 0.81)", "rgba(255, 99, 132, 0.6)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    // radius: 100,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: "Monthly Expenses Pie Chart",
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
    },
  };

  return <Pie data={chartData} options={options} />;
}
