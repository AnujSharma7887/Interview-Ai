import React, { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import "../style/interview.scss";
import {
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileListLine,
  RiLogoutBoxLine,
  RiArrowGoBackLine,
} from "react-icons/ri";
import { BotIcon } from "../components/animated-icons/BotIcon";
import { useInterview } from "../hooks/useInterview";
import { useParams, useNavigate } from "react-router";
import Loading from "../../auth/components/Loading";

const getScoreColor = (score) => {
  if (score >= 80) return "#3fb950";
  if (score >= 60) return "#f5a623";
  return "#ff4d4d";
};

const NAV_ITEMS = [
  {
    id: "technical",
    label: "Technical Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "behavioral",
    label: "Behavioral Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    label: "Road Map",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="q-card">
      <div className="q-card__header" onClick={() => setOpen((o) => !o)}>
        <span className="q-card__index">Q{index + 1}</span>
        <p className="q-card__question">{item.question}</p>
        <span
          className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {open && (
        <div className="q-card__body">
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--intention">
              Intention
            </span>
            <p>{item.intention}</p>
          </div>
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--answer">
              Model Answer
            </span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const RoadMapDay = ({ day }) => (
  <div className="roadmap-day">
    <div className="roadmap-day__header">
      <span className="roadmap-day__badge">Day {day.day}</span>
      <h3 className="roadmap-day__focus">{day.focus}</h3>
    </div>
    <ul className="roadmap-day__tasks">
      {day.tasks.map((task, i) => (
        <li key={i}>
          <span className="roadmap-day__bullet" />
          {task}
        </li>
      ))}
    </ul>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const [navOpen, setNavOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ reports added here
  const { report, reports, loading, getResumePdf } = useInterview();
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  if (loading || !report) {
    return <Loading />;
  }

  return (
    // ✅ Wrapper div so sidebar sits outside interview-layout
    <div className="interview-page-wrapper">
      {/* ── Recent Reports Sidebar ── */}
      <aside
        className={`recent-sidebar ${sidebarOpen ? "" : "recent-sidebar--collapsed"}`}
      >
        <button
          className="back-button"
          onClick={() => navigate("/")}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <RiArrowGoBackLine size={23} />
          ) : (
            <RiArrowGoBackLine size={23} />
          )}
        </button>

        <button
          className="recent-sidebar__toggle"
          onClick={() => setSidebarOpen((o) => !o)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <RiMenuFoldLine size={18} />
          ) : (
            <RiMenuUnfoldLine size={18} />
          )}
        </button>

        {sidebarOpen && (
          <>
            <p className="recent-sidebar__label">Recent Reports</p>
            <div className="recent-sidebar__list">
              {reports && reports.length > 0 ? (
                reports.map((r) => (
                  <button
                    key={r._id}
                    className={`recent-sidebar__item ${r._id === interviewId ? "recent-sidebar__item--active" : ""}`}
                    onClick={() => navigate(`/interview/${r._id}`)}
                  >
                    <RiFileListLine size={15} style={{ flexShrink: 0 }} />
                    <div className="recent-sidebar__info">
                      <p className="recent-sidebar__title">
                        {r.title || "Untitled Position"}
                      </p>
                      <span className="recent-sidebar__date">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`recent-sidebar__score ${
                        r.matchScore >= 80
                          ? "score--high"
                          : r.matchScore >= 60
                            ? "score--mid"
                            : "score--low"
                      }`}
                    >
                      {r.matchScore}%
                    </span>
                  </button>
                ))
              ) : (
                <p className="recent-sidebar__empty">No reports yet</p>
              )}
            </div>

            {/* Logout at bottom of sidebar */}
            <button
              onClick={onLogout}
              className="recent-sidebar__logout"
              style={{ marginTop: "auto" }}
            >
              <RiLogoutBoxLine size={15} />
              Logout
            </button>
          </>
        )}
      </aside>

      {/* ── Interview Page ── */}
      <div className="interview-page">
        <div className="interview-layout">
          {/* ── Left Nav ── */}
          <nav
            className={`interview-nav ${navOpen ? "" : "interview-nav--collapsed"}`}
          >
            <button
              className="interview-nav__toggle"
              onClick={() => setNavOpen((o) => !o)}
              title={navOpen ? "Collapse nav" : "Expand nav"}
            >
              {navOpen ? (
                <RiMenuFoldLine size={16} />
              ) : (
                <RiMenuUnfoldLine size={16} />
              )}
            </button>

            {navOpen && (
              <div className="nav-content">
                <p className="interview-nav__label">Sections</p>
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                    onClick={() => setActiveNav(item.id)}
                  >
                    <span className="interview-nav__icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {!navOpen && (
              <div className="nav-content nav-content--icons-only">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    className={`interview-nav__item interview-nav__item--icon-only ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                    onClick={() => setActiveNav(item.id)}
                    title={item.label}
                  >
                    <span className="interview-nav__icon">{item.icon}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Download Resume Button */}
            {navOpen ? (
              <button
                onClick={() => getResumePdf(interviewId)}
                className="button primary-button"
                style={{ marginTop: "auto" }}
              >
                <BotIcon size={23} style={{ color: "white" }} />
                Download Resume
              </button>
            ) : (
              <button
                onClick={() => getResumePdf(interviewId)}
                className="button primary-button"
                style={{ marginTop: "auto", padding: "0.65rem", width: "40px" }}
                title="Download Resume"
              >
                <BotIcon size={23} style={{ color: "white" }} />
              </button>
            )}
          </nav>

          <div className="interview-divider" />

          {/* ── Center Content ── */}
          <main className="interview-content">
            {/* Back Button */}

            {activeNav === "technical" && (
              <section>
                <div className="content-header">
                  <h2>Technical Questions</h2>
                  <span className="content-header__count">
                    {report.technicalQuestions.length} questions
                  </span>
                </div>
                <div className="q-list">
                  {report.technicalQuestions.map((q, i) => (
                    <QuestionCard key={i} item={q} index={i} />
                  ))}
                </div>
              </section>
            )}

            {activeNav === "behavioral" && (
              <section>
                <div className="content-header">
                  <h2>Behavioral Questions</h2>
                  <span className="content-header__count">
                    {report.behavioralQuestions.length} questions
                  </span>
                </div>
                <div className="q-list">
                  {report.behavioralQuestions.map((q, i) => (
                    <QuestionCard key={i} item={q} index={i} />
                  ))}
                </div>
              </section>
            )}

            {activeNav === "roadmap" && (
              <section>
                <div className="content-header">
                  <h2>Preparation Road Map</h2>
                  <span className="content-header__count">
                    {report.preparationPlan.length}-day plan
                  </span>
                </div>
                <div className="roadmap-list">
                  {report.preparationPlan.map((day) => (
                    <RoadMapDay key={day.day} day={day} />
                  ))}
                </div>
              </section>
            )}
          </main>

          <div className="interview-divider" />

          {/* ── Right Sidebar ── */}
          <aside className="interview-sidebar" style={{ alignItems: "center" }}>
            <div>
              <h3>Match Score</h3>
            </div>
            <div
              className="match-score__ring"
              style={{
                background: `conic-gradient(
                  ${getScoreColor(report.matchScore)} 0deg,
                  ${getScoreColor(report.matchScore)} ${(report.matchScore / 100) * 360}deg,
                  #2a3348 ${(report.matchScore / 100) * 360}deg,
                  #2a3348 360deg
                )`,
              }}
            >
              <div className="match-score__inner">
                <span className="match-score__value">{report.matchScore}</span>
                <span className="match-score__pct">%</span>
              </div>
            </div>

            <div className="sidebar-divider" style={{ width: "100%" }} />

            <div className="skill-gaps">
              <p className="skill-gaps__label">Skill Gaps</p>
              <div className="skill-gaps__list">
                {report.skillGaps.map((gap, i) => (
                  <span
                    key={i}
                    className={`skill-tag skill-tag--${gap.severity}`}
                  >
                    {gap.skill}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Interview;
