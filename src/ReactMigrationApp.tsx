import { useEffect, useState } from "react";

type ViewName = "dashboard" | "evidence" | "people" | "timeline" | "workspace";

const views: Array<{ id: ViewName; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "evidence", label: "Evidence" },
  { id: "people", label: "People & Locations" },
  { id: "timeline", label: "Timeline" },
  { id: "workspace", label: "Workspace" },
];

function getViewFromHash(): ViewName {
  const requestedView = window.location.hash.slice(1) as ViewName;
  return views.some((view) => view.id === requestedView)
    ? requestedView
    : "dashboard";
}

function StubPage({ view }: { view: ViewName }) {
  const title = views.find((item) => item.id === view)?.label || "Dashboard";
  return (
    <section className="react-migration-page">
      <p className="react-migration-eyebrow">React migration preview</p>
      <h2>{title}</h2>
      <p>
        This is the React routing shell. The {title} view will be migrated in a
        later step.
      </p>
    </section>
  );
}

export function ReactMigrationApp() {
  const [currentView, setCurrentView] = useState<ViewName>(getViewFromHash);

  useEffect(() => {
    const handleHashChange = () => setCurrentView(getViewFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigateTo(view: ViewName): void {
    window.location.hash = view;
  }

  return (
    <div className="react-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <img
              src="assets/logo/logo.svg"
              alt="Project ReMotion logo"
              className="brand-logo"
            />
            <div>
              <h1>Project ReMotion</h1>
              <p className="subtitle">React migration preview</p>
            </div>
          </div>
          <nav className="main-nav" aria-label="React migration navigation">
            {views.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`nav-btn ${currentView === view.id ? "active" : ""}`}
                onClick={() => navigateTo(view.id)}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <StubPage view={currentView} />
      </main>
    </div>
  );
}
