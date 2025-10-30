import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { userContext } from "../../App";
import { getTransactionGroups } from "../../utils/API";
import BarChart from "../../utils/Barchart";

export default function OverviewCard({ range }) {
  const { user, token } = useContext(userContext);
  const [chartData, setChartData] = useState({
    expense: { labels: [], values: [] },
  });

  useEffect(() => {
    if (!token) return;

    getTransactionGroups(token, range).then((res) => {
      if (!Array.isArray(res)) return;

      const expenseTx = res.filter((tx) => tx._id.type === "expense");

      setChartData({
        expense: {
          labels: expenseTx.map((tx) => tx._id.name),
          values: expenseTx.map((tx) => tx.total.toFixed(2)),
        },
      });
    });
  }, [token, range]);

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 mx-5 rounded border border-primary"
      style={{ width: "400px", height: "auto" }}
    >
      <h3>Overview</h3>

      {chartData.expense.labels.length > 0 ? (
        <BarChart
          data={{
            labels: chartData.expense.labels,
            values: chartData.expense.values,
          }}
        />
      ) : (
        <h3>Nothing to show here</h3>
      )}
    </div>
  );
}
