import "./App.css";
import buildersLogo from "./assets/builders-logo.png";
import { NavLink, Route, Routes } from "react-router-dom";

function Dashboard() {
  return (
    <>
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
    </>
  );
}

function Grants() {
   return (
    <div>
      <header className="topbar">
        <div>
          <p className="eyebrow">GrantTrackingApp</p>
          <h2>Grants</h2>
          <p className="subtitle">
            Manage applications, funding amounts, deadlines, and statuses.
          </p>
        </div>

        <button className="primary-button">+ Add Grant</button>
      </header>

      <section className="grant-toolbar">
        <input
          className="grant-search"
          type="text"
          placeholder="Search grants..."
        />

        <select className="grant-filter">
          <option>All Statuses</option>
          <option>Researching</option>
          <option>Preparing</option>
          <option>Submitted</option>
          <option>Awarded</option>
        </select>

        <select className="grant-filter">
          <option>All Years</option>
          <option>2026</option>
          <option>2027</option>
        </select>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">All Grants</p>
            <h3>Grant Applications</h3>
          </div>

          <span className="grant-count">4 grants</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Grant</th>
                <th>Organization</th>
                <th>Requested</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Owner</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <strong>AWS Student Grant</strong>
                </td>
                <td>Amazon Web Services</td>
                <td>$5,000</td>
                <td>Oct 15, 2026</td>
                <td>
                  <span className="status submitted">Submitted</span>
                </td>
                <td>Shiraaz</td>
              </tr>

              <tr>
                <td>
                  <strong>CSG Funding</strong>
                </td>
                <td>University of Michigan</td>
                <td>$2,000</td>
                <td>Nov 3, 2026</td>
                <td>
                  <span className="status preparing">Preparing</span>
                </td>
                <td>Finance Team</td>
              </tr>

              <tr>
                <td>
                  <strong>Technology Grant</strong>
                </td>
                <td>Michigan Innovation Fund</td>
                <td>$10,000</td>
                <td>Dec 1, 2026</td>
                <td>
                  <span className="status researching">Researching</span>
                </td>
                <td>Shiraaz</td>
              </tr>

              <tr>
                <td>
                  <strong>Community Program Grant</strong>
                </td>
                <td>Local Foundation</td>
                <td>$7,500</td>
                <td>Jan 12, 2027</td>
                <td>
                  <span className="status awarded">Awarded</span>
                </td>
                <td>Finance Team</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <header className="topbar">
        <div>
          <p className="eyebrow">FinanceTool</p>
          <h2>{title}</h2>
          <p className="subtitle">This page will be built next.</p>
        </div>
      </header>
    </div>
  );
}

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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/grants"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Grants
          </NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Documents
          </NavLink>

          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Budgets
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>Authorized Signer</p>
          <span>Secure internal access</span>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/grants" element={<Grants />} />
          <Route
            path="/documents"
            element={<PlaceholderPage title="Documents" />}
          />
          <Route
            path="/budgets"
            element={<PlaceholderPage title="Budgets" />}
          />
          <Route
            path="/settings"
            element={<PlaceholderPage title="Settings" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;