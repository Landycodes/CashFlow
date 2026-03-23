export default function WelcomeCard() {
  return (
    <div
      className="info-text bg-gradient p-3 rounded border border-secondary my-5"
      style={{ width: "500px" }}
    >
      <h3 className="text-center fst-italic">
        <b>Welcome to CashFlow</b>
      </h3>
      <p>
        To get started, head over to the{" "}
        <strong>
          <a className="text-decoration-none text-light" href="/settings">
            Settings
          </a>
        </strong>{" "}
        tab and securely link your bank account using Plaid.
      </p>
    </div>
  );
}
