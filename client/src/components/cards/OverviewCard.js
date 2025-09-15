import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { userContext } from "../../App";
import { getTransactionGroups } from "../../utils/API";
import BarChart from "../../utils/Barchart";

export default function OverviewCard({ range }) {
  const { user } = useContext(userContext);
  const [chartData, setChartData] = useState({
    expense: { labels: [], values: [] },
  });

  useEffect(() => {
    getTransactionGroups(user._id, user.selected_account_id, range).then(
      (res) => {
        const expenseTx = res.filter((tx) => tx._id.type === "expense");

        setChartData({
          expense: {
            labels: expenseTx.map((tx) => tx._id.name),
            values: expenseTx.map((tx) => tx.total.toFixed(2)),
          },
        });
      }
    );
  }, [user._id, user.selected_account_id, range]);

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 mx-5 rounded border border-primary"
      // style={{ width: "400px" }}
    >
      <h3>Overview</h3>

      <BarChart
        data={{
          labels: chartData.expense.labels,
          values: chartData.expense.values,
        }}
      />
      {/* <BarChart
        data={{
          labels: chartData.income.labels,
          values: chartData.income.values,
        }}
        type={"income"}
      /> */}

      {/* <table className="table table-sm align-middle table-striped table-bordered border-dark">
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => {
            return (
              <tr key={row._id.name}>
                <td>{row._id.name}</td>
                <td
                  className={
                    row._id.type === "income" ? "table-success" : "table-danger"
                  }
                >
                  ${Math.abs(Math.round(row.total * 100) / 100).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table> */}
    </div>
  );
}
