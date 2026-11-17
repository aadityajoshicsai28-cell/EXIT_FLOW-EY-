import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const statusOptions = ['Pending', 'Submitted', 'Under Review', 'Approved', 'Rejected'];

function App() {
  const [dashboard, setDashboard] = useState({ total: 0, pending: 0, approved: 0, overdue: 0 });
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [caseName, setCaseName] = useState('');
  const [clientName, setClientName] = useState('');

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId) || null,
    [cases, selectedCaseId]
  );

  const fetchDashboard = async () => {
    const response = await fetch(`${API_BASE}/dashboard`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Dashboard request failed');
    setDashboard(data);
  };

  const fetchCases = async () => {
    const url = new URL(`${API_BASE}/cases`);
    if (search.trim()) url.searchParams.set('search', search.trim());
    if (statusFilter) url.searchParams.set('status', statusFilter);

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Cases request failed');
    setCases(data);
    if (!selectedCaseId && data[0]) {
      setSelectedCaseId(data[0].id);
    }
  };

  const fetchCaseDetails = async (id) => {
    if (!id) return;
    const [caseResponse, itemResponse, logResponse] = await Promise.all([
      fetch(`${API_BASE}/cases/${id}`),
      fetch(`${API_BASE}/cases/${id}/items`),
      fetch(`${API_BASE}/cases/${id}/logs`),
    ]);

    const caseData = await caseResponse.json();
    const itemData = await itemResponse.json();
    const logData = await logResponse.json();

    if (!caseResponse.ok) throw new Error(caseData.error || 'Case details request failed');
    if (!itemResponse.ok) throw new Error(itemData.error || 'Case items request failed');
    if (!logResponse.ok) throw new Error(logData.error || 'Case logs request failed');

    setCaseDetails(caseData);
    setItems(itemData);
    setLogs(logData);
  };

  useEffect(() => {
    fetchDashboard().catch((error) => console.error(error));
    fetchCases().catch((error) => console.error(error));
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDetails(selectedCaseId).catch((error) => console.error(error));
    }
  }, [selectedCaseId]);

  const handleCreateCase = async (event) => {
    event.preventDefault();
    const payload = { case_name: caseName.trim(), client_name: clientName.trim() };
    if (!payload.case_name || !payload.client_name) return;

    const response = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Case creation failed');

    setCaseName('');
    setClientName('');
    const createdId = data.id;
    setSelectedCaseId(createdId);
    await fetchCases();
    await fetchDashboard();
  };

  const handleItemUpdate = async (itemId, nextState) => {
    const response = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextState),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Item update failed');

    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, ...data } : item)));
    setCaseDetails((current) => (current ? { ...current, progress_percentage: data.progress_percentage ?? current.progress_percentage } : current));
    await fetchCases();
    await fetchDashboard();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">E</div>
          <div>
            <p className="ey-text">STPI Exit Tracker</p>
            <h1>ExitFlow</h1>
          </div>
        </div>

        <form className="case-form" onSubmit={handleCreateCase}>
          <h2>New Case</h2>
          <input
            value={caseName}
            onChange={(event) => setCaseName(event.target.value)}
            placeholder="Case name"
          />
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Client name"
          />
          <button type="submit">Create Case</button>
        </form>

        <div className="filters">
          <input
            type="search"
            placeholder="Search case"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <ul className="case-list">
          {cases.map((item) => (
            <li key={item.id} className={selectedCaseId === item.id ? 'active' : ''}>
              <button type="button" onClick={() => setSelectedCaseId(item.id)}>
                <span>{item.case_name}</span>
                <small>{item.client_name}</small>
                <b>{item.status}</b>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="ey-text">Overview</p>
            <h2>Exit dashboard</h2>
          </div>
          <div className="topbar-user">
            <span>Consultant</span>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <span>Total Cases</span>
            <strong>{dashboard.total}</strong>
          </article>
          <article className="stat-card accent">
            <span>Pending</span>
            <strong>{dashboard.pending}</strong>
          </article>
          <article className="stat-card success">
            <span>Approved</span>
            <strong>{dashboard.approved}</strong>
          </article>
          <article className="stat-card warning">
            <span>Overdue</span>
            <strong>{dashboard.overdue}</strong>
          </article>
        </section>

        {selectedCase && (
          <section className="case-overview">
            <div>
              <p className="ey-text">Case profile</p>
              <h3>{selectedCase.case_name}</h3>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar">
                <span style={{ width: `${selectedCase.progress_percentage || 0}%` }} />
              </div>
              <strong>{selectedCase.progress_percentage || 0}%</strong>
            </div>
          </section>
        )}

        <section className="content-grid">
          <div className="panel checklist-panel">
            <h3>Checklist</h3>
            <div className="item-list">
              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <div>
                    <strong>{item.task_name}</strong>
                    <small>{item.stage_name}</small>
                  </div>
                  <div className="item-controls">
                    <select
                      value={item.status}
                      onChange={(event) => handleItemUpdate(item.id, { status: event.target.value })}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={item.due_date || ''}
                      onChange={(event) => handleItemUpdate(item.id, { due_date: event.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel logs-panel">
            <h3>Activity log</h3>
            <ul>
              {logs.map((log) => (
                <li key={log.id}>
                  <strong>{new Date(log.timestamp).toLocaleDateString()}</strong>
                  <span>{log.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
