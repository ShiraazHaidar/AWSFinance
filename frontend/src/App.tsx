import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import "./App.css";
import buildersLogo from "./assets/builders-logo.png";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  completeNewPassword,
  getConfigError,
  getCurrentUser,
  getIdToken,
  signIn,
  signOut,
} from "./auth";

type Grant = {
  id?: string;
  name: string;
  organization: string;
  amount: string;
  deadline: string;
  status: string;
  owner: string;
  notes: string;
  createdAt?: string;
};

type GrantFormData = Omit<Grant, "id" | "createdAt">;

const emptyGrantForm: GrantFormData = {
  name: "",
  organization: "",
  amount: "",
  deadline: "",
  status: "Researching",
  owner: "",
  notes: "",
};

function formatMoney(amount: string | number | undefined | null) {
  if (amount === undefined || amount === null || amount === "") {
    return "—";
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "—";
  }

  return `$${numericAmount.toLocaleString()}`;
}

function formatDeadline(deadline: string | undefined | null) {
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

async function readApiError(response: Response) {
  const text = await response.text();

  if (!text) {
    return response.statusText || "Request failed.";
  }

  try {
    const payload = JSON.parse(text) as { error?: string; message?: string };
    return payload.error || payload.message || text;
  } catch {
    return text;
  }
}

function LoginPage({
  onAuthenticated,
}: {
  onAuthenticated: (username: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configError = getConfigError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passwordToSubmit = requiresNewPassword ? newPassword : password;

    if (!username.trim() || !passwordToSubmit) {
      setError(
        requiresNewPassword
          ? "Please enter a permanent password."
          : "Please enter your email and password.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (requiresNewPassword && pendingUser) {
        const result = await completeNewPassword(pendingUser, passwordToSubmit);
        onAuthenticated(result.user.getUsername());
      } else {
        const result = await signIn(username.trim(), password);

        if ("requiresNewPassword" in result) {
          setPendingUser(result.user);
          setRequiresNewPassword(true);
          setPassword("");
          setError(null);
        } else {
          onAuthenticated(result.user.getUsername());
        }
      }
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand">
          <img src={buildersLogo} alt="UMich Builders" className="brand-logo" />

          <div>
            <p className="eyebrow">AWS Student Builder Group</p>
            <h1>FinanceTool</h1>
          </div>
        </div>

        <div className="login-card">
          <h2>Secure sign in</h2>
          <p>Use the approved FinanceTool Cognito account to continue.</p>

          {configError && (
            <div className="auth-message auth-error">{configError}</div>
          )}

          {error && <div className="auth-message auth-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="user@umich.edu"
                disabled={Boolean(configError) || isSubmitting}
              />
            </label>

            <label>
              {requiresNewPassword ? "New permanent password" : "Password"}
              <input
                type="password"
                value={requiresNewPassword ? newPassword : password}
                onChange={(event) =>
                  requiresNewPassword
                    ? setNewPassword(event.target.value)
                    : setPassword(event.target.value)
                }
                placeholder={
                  requiresNewPassword
                    ? "Choose a permanent password"
                    : "Enter your password"
                }
                disabled={Boolean(configError) || isSubmitting}
              />
            </label>

            <button type="submit" className="primary-button login-button" disabled={Boolean(configError) || isSubmitting}>
              {isSubmitting
                ? requiresNewPassword
                  ? "Setting password..."
                  : "Signing in..."
                : requiresNewPassword
                  ? "Set password"
                  : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">FinanceTool</p>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GrantFormData>(emptyGrantForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [yearFilter, setYearFilter] = useState("All Years");

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

  const loadGrants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch(`${apiBaseUrl}/grants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : await readApiError(response),
        );
      }

      const data = (await response.json()) as Grant[];
      setGrants(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load grants right now.",
      );
      setGrants([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void loadGrants();
  }, [loadGrants]);

  const filteredGrants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return grants.filter((grant) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [grant.name, grant.organization, grant.owner, grant.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All Statuses" || grant.status === statusFilter;

      const grantYear = grant.deadline ? new Date(`${grant.deadline}T00:00:00`).getFullYear().toString() : null;
      const matchesYear =
        yearFilter === "All Years" || grantYear === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [grants, searchTerm, statusFilter, yearFilter]);

  function handleInputChange(
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.organization.trim()) {
      setError("Grant name and organization are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch(`${apiBaseUrl}/grants`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          organization: formData.organization.trim(),
          amount: formData.amount || "0",
          owner: formData.owner.trim(),
          notes: formData.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : await readApiError(response),
        );
      }

      setFormData(emptyGrantForm);
      setIsModalOpen(false);
      await loadGrants();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create the grant right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const yearOptions = Array.from(
    new Set(
      grants
        .map((grant) =>
          grant.deadline
            ? new Date(`${grant.deadline}T00:00:00`).getFullYear().toString()
            : null,
        )
        .filter((year): year is string => Boolean(year)),
    ),
  ).sort((left, right) => right.localeCompare(left));

  return (
    <div>
      <header className="topbar">
        <div>
          <p className="eyebrow">FinanceTool</p>
          <h2>Grants</h2>
          <p className="subtitle">
            Manage applications, funding amounts, deadlines, and statuses.
          </p>
        </div>

        <button className="primary-button" onClick={() => setIsModalOpen(true)}>
          + Add Grant
        </button>
      </header>

      {error && <div className="auth-message auth-error">{error}</div>}

      <section className="grant-toolbar">
        <input
          className="grant-search"
          type="text"
          placeholder="Search grants..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          className="grant-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option>All Statuses</option>
          <option>Researching</option>
          <option>Preparing</option>
          <option>Submitted</option>
          <option>Awarded</option>
        </select>

        <select
          className="grant-filter"
          value={yearFilter}
          onChange={(event) => setYearFilter(event.target.value)}
        >
          <option>All Years</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">All Grants</p>
            <h3>Grant Applications</h3>
          </div>

          <span className="grant-count">
            {filteredGrants.length} {filteredGrants.length === 1 ? "grant" : "grants"}
          </span>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div className="status-message">Loading grants...</div>
          ) : filteredGrants.length === 0 ? (
            <div className="status-message">
              No grants matched your current search.
            </div>
          ) : (
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
                {filteredGrants.map((grant, index) => (
                  <tr key={grant.id ?? `${grant.name}-${index}`}>
                    <td>
                      <strong>{grant.name}</strong>
                    </td>

                    <td>{grant.organization}</td>

                    <td>{formatMoney(grant.amount)}</td>

                    <td>{formatDeadline(grant.deadline)}</td>

                    <td>
                      <span className={`status ${statusClass(grant.status)}`}>
                        {grant.status}
                      </span>
                    </td>

                    <td>{grant.owner || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                type="button"
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

                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Grant"}
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
          <p className="eyebrow">AWS Student Builder Group</p>
          <h2>{title}</h2>
          <p className="subtitle">This page will be built next.</p>
        </div>
      </header>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");

  const refreshAuthState = useCallback(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      setIsAuthenticated(false);
      setUserName("");
      return;
    }

    currentUser.getSession((error: Error | null, session: any) => {
      if (error || !session || !session.isValid()) {
        setIsAuthenticated(false);
        setUserName("");
        return;
      }

      setUserName(currentUser.getUsername());
      setIsAuthenticated(true);
    });
  }, []);

  useEffect(() => {
    refreshAuthState();
  }, [refreshAuthState]);

  async function handleLogout() {
    signOut();
    setUserName("");
    setIsAuthenticated(false);
  }

  if (isAuthenticated === null) {
    return <div className="loading-screen">Checking your session...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={(username) => {
      setUserName(username);
      setIsAuthenticated(true);
    }} />;
  }

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
          <p>{userName || "Authorized Signer"}</p>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/grants" element={<Grants />} />
          <Route path="/documents" element={<PlaceholderPage title="Documents" />} />
          <Route path="/budgets" element={<PlaceholderPage title="Budgets" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;