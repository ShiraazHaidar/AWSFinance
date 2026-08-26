import "./App.css";
import buildersLogo from "./assets/builders-logo.png";

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img
            src={buildersLogo}
            alt="UMich Builders"
            className="brand-logo"
          />

          <div>
            <h1>FinanceTool</h1>
            <p>UMich AWS</p>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Grants</button>
          <button className="nav-item">Documents</button>
          <button className="nav-item">Budgets</button>
          <button className="nav-item">Settings</button>
        </nav>

        <div className="sidebar-footer">
          <p>Authorized Signer</p>
          <span>Secure internal access</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">GrantTrackingApp</p>
            <h2>Finance Dashboard</h2>
            <p className="subtitle">
              Track grants, deadlines, awards, and funding activity.
            </p>
          </div>

          <button className="primary-button">+ Add Grant</button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Active Grants</p>
            <h3>8</h3>
            <span>3 deadlines this month</span>
          </div>

          <div className="stat-card">
            <p>Total Requested</p>
            <h3>$24,500</h3>
            <span>Across active applications</span>
          </div>

          <div className="stat-card">
            <p>Total Awarded</p>
            <h3>$8,000</h3>
            <span>32.7% award rate</span>
          </div>

          <div className="stat-card">
            <p>Pending Review</p>
            <h3>4</h3>
            <span>Awaiting decisions</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Overview</p>
              <h3>Recent Grants</h3>
            </div>

            <button className="secondary-button">View all grants</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Grant</th>
                  <th>Organization</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>AWS Student Grant</td>
                  <td>Amazon Web Services</td>
                  <td>$5,000</td>
                  <td>Oct 15</td>
                  <td>
                    <span className="status submitted">Submitted</span>
                  </td>
                </tr>

                <tr>
                  <td>CSG Funding</td>
                  <td>University of Michigan</td>
                  <td>$2,000</td>
                  <td>Nov 3</td>
                  <td>
                    <span className="status preparing">Preparing</span>
                  </td>
                </tr>

                <tr>
                  <td>Technology Grant</td>
                  <td>Michigan Innovation Fund</td>
                  <td>$10,000</td>
                  <td>Dec 1</td>
                  <td>
                    <span className="status researching">Researching</span>
                  </td>
                </tr>

                <tr>
                  <td>Community Program Grant</td>
                  <td>Local Foundation</td>
                  <td>$7,500</td>
                  <td>Jan 12</td>
                  <td>
                    <span className="status awarded">Awarded</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;