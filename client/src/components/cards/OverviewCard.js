import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { userContext } from "../../App";
import { getTransactionGroups } from "../../utils/API/transaction";
import BarChart from "../../utils/Barchart";

export default function OverviewCard({ range }) {
  const { user, token } = useContext(userContext);
  const [chartData, setChartData] = useState({
    expense: { labels: [], values: [] },
  });

  useEffect(() => {
    if (!token) return;

    getTransactionGroups(token, {
      days: range,
      type: "EXPENSE",
      limit: 10,
    }).then((res) => {
      if (!Array.isArray(res)) return;

      setChartData({
        expense: {
          labels: res.map((tx) => tx.name),
          values: res.map((tx) => tx.total),
        },
      });
    });
  }, [token, range]);

  return (
    <div
      className="d-flex flex-column align-items-center bg-gradient p-3 m-3 h-auto rounded border border-secondary"
      // style={{ width: "400px", height: "auto" }}
    >
      <h3 className="style-text">Spending Overview</h3>

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
