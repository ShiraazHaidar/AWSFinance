import { useState, type ChangeEvent, type FormEvent } from "react";
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
  type Grant = {
    name: string;
    organization: string;
    amount: string;
    deadline: string;
    status: string;
    owner: string;
    notes: string;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [grants, setGrants] = useState<Grant[]>([
    {
      name: "AWS Student Grant",
      organization: "Amazon Web Services",
      amount: "5000",
      deadline: "2026-10-15",
      status: "Submitted",
      owner: "Shiraaz",
      notes: "",
    },
    {
      name: "CSG Funding",
      organization: "University of Michigan",
      amount: "2000",
      deadline: "2026-11-03",
      status: "Preparing",
      owner: "Finance Team",
      notes: "",
    },
    {
      name: "Technology Grant",
      organization: "Michigan Innovation Fund",
      amount: "10000",
      deadline: "2026-12-01",
      status: "Researching",
      owner: "Shiraaz",
      notes: "",
    },
    {
      name: "Community Program Grant",
      organization: "Local Foundation",
      amount: "7500",
      deadline: "2027-01-12",
      status: "Awarded",
      owner: "Finance Team",
      notes: "",
    },
  ]);

  const [formData, setFormData] = useState<Grant>({
    name: "",
    organization: "",
    amount: "",
    deadline: "",
    status: "Researching",
    owner: "",
    notes: "",
  });

  function handleInputChange(
   event:
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLSelectElement>
  | ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name || !formData.organization) {
      return;
    }

    setGrants((current) => [...current, formData]);

    setFormData({
      name: "",
      organization: "",
      amount: "",
      deadline: "",
      status: "Researching",
      owner: "",
      notes: "",
    });

    setIsModalOpen(false);
  }

  function formatMoney(amount: string) {
    if (!amount) {
      return "—";
    }

    return `$${Number(amount).toLocaleString()}`;
  }

  function formatDeadline(deadline: string) {
    if (!deadline) {
      return "—";
    }

    return new Date(`${deadline}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function statusClass(status: string) {
    return status.toLowerCase().replaceAll(" ", "-");
  }

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

        <button
          className="primary-button"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Grant
        </button>
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

          <span className="grant-count">
            {grants.length} {grants.length === 1 ? "grant" : "grants"}
          </span>
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
              {grants.map((grant, index) => (
                <tr key={`${grant.name}-${index}`}>
                  <td>
                    <strong>{grant.name}</strong>
                  </td>

                  <td>{grant.organization}</td>

                  <td>{formatMoney(grant.amount)}</td>

                  <td>{formatDeadline(grant.deadline)}</td>

                  <td>
                    <span
                      className={`status ${statusClass(grant.status)}`}
                    >
                      {grant.status}
                    </span>
                  </td>

                  <td>{grant.owner || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="grant-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">New Grant</p>
                <h3>Add Grant</h3>
              </div>

              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="grant-form" onSubmit={handleSubmit}>
              <label>
                Grant Name
                <input
                  name="name"
                  type="text"
                  placeholder="AWS Student Grant"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Organization
                <input
                  name="organization"
                  type="text"
                  placeholder="Amazon Web Services"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Amount Requested
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Deadline
                  <input
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option>Researching</option>
                    <option>Preparing</option>
                    <option>Submitted</option>
                    <option>Awarded</option>
                  </select>
                </label>

                <label>
                  Owner
                  <input
                    name="owner"
                    type="text"
                    placeholder="Shiraaz"
                    value={formData.owner}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Add any grant notes here..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  Save Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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