export default function WelcomeCard() {
  return (
    <div className="window-style my-5" style={{ width: "500px" }}>
      <h3 className="text-center fst-italic">
        <b>Welcome to CashFlow</b>
      </h3>
      <section>
        <p>
          To get started, head over to the{" "}
          <strong>
            <a className="text-decoration-none text-light" href="/settings">
              Settings
            </a>
          </strong>{" "}
          tab where you can:
        </p>

        <ul>
          <li>
            <strong>Link your bank</strong> securely using Plaid.
          </li>
          <li>
            <strong>Add</strong> or <strong>select</strong> an account manually
            by clicking the Manage Accounts button.
          </li>
        </ul>
      </section>
    </div>
  );
}
