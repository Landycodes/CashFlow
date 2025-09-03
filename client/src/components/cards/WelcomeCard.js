export default function WelcomeCard() {
  return (
    <div
      className="bg-light bg-gradient p-3 rounded border border-primary my-5"
      style={{ width: "500px" }}
    >
      <h4 className="text-center">
        <b>Welcome to CashFlow</b>
      </h4>
      <p>
        To get started, head over to the{" "}
        <strong>
          <a className="text-decoration-none text-dark" href="/settings">
            Settings
          </a>
        </strong>{" "}
        tab and securely link your bank account using Plaid.
      </p>
    </div>
  );
}
