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
      // console.log("RESPONSE: ", res);
      const expenseTx = res.filter((tx) => tx.type === "EXPENSE");

      setChartData({
        expense: {
          labels: expenseTx.map((tx) => tx.name),
          values: expenseTx.map((tx) => Number(tx.total).toLocaleString()),
        },
      });
    });
  }, [token, range]);

  return (
    <div
      className="d-flex flex-column align-items-center bg-gradient p-3 m-5 h-auto rounded border border-secondary"
      // style={{ width: "400px", height: "auto" }}
    >
      <h3 className="text-light text-opacity-75">Spending Overview</h3>

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
