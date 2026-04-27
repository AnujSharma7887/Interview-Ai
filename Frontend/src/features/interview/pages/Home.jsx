import React, { useState, useRef } from "react";
import {useAuth} from "../../auth/hooks/useAuth";
import "../style/home.scss";
import {
  RiUploadCloud2Line,
  RiFileTextLine,
  RiUserSearchLine,
  RiFileUploadLine,
  RiBardLine,
  RiFileListLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiLogoutBoxLine,
} from "react-icons/ri";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";
import Loading from "../../auth/components/Loading";

function Home() {

  // handle logout
  const { handleLogout } = useAuth();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };




  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const wordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;
  const selfWordCount = selfDescription
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const { loading, generateReport, reports } = useInterview();
  const resumeInputRef = useRef(null);
  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0];
    const data = await generateReport({
      jobDescription,
      selfDescription,
      resumeFile,
    });
    navigate(`/interview/${data._id}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home-layout">
      {/* ── Left Sidebar ── */}
      <aside
        className={`recent-sidebar ${sidebarOpen ? "" : "recent-sidebar--collapsed"}`}
      >
        {/* Toggle Button */}
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

        {/* Sidebar Content — hidden when collapsed */}
        {sidebarOpen && (
          <>
            <p className="recent-sidebar__label">Recent Reports</p>
            <div className="recent-sidebar__list">
              {reports && reports.length > 0 ? (
                reports.map((report) => (
                  <button
                    key={report._id}
                    className="recent-sidebar__item"
                    onClick={() => navigate(`/interview/${report._id}`)}
                  >
                    <RiFileListLine size={15} style={{ flexShrink: 0 }} />
                    <div className="recent-sidebar__info">
                      <p className="recent-sidebar__title">
                        {report.title || "Untitled Position"}
                      </p>
                      <span className="recent-sidebar__date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`recent-sidebar__score ${
                        report.matchScore >= 80
                          ? "score--high"
                          : report.matchScore >= 60
                            ? "score--mid"
                            : "score--low"
                      }`}
                    >
                      {report.matchScore}%
                    </span>
                  </button>
                ))
              ) : (
                <p className="recent-sidebar__empty">No reports yet</p>
              )}
            </div>
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

      {/* ── Main Content ── */}
      <main className="home">
        <div className="home-header">
          <p
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1696937059544-d27af28d458d?q=80&w=685&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              fontSize: "2.25rem",
              fontWeight: "900",
              textAlign: "center",
              width: "100%",
            }}
          >
            Generate Interview Preparation Plan
          </p>
          <p style={{ color: "#8B9199", fontSize: "1rem" }}>
            let our AI analyze the job requirements and your unique profile to
            build a winning strategy
          </p>
        </div>

        <div className="interview-input-group">
          <div className="left">
            <div className="left-card-input">
              <label className="job-description-label" htmlFor="jobDscription">
                <div className="job-desc-header">
                  <p className="icon-label-group">
                    <RiFileTextLine size={20} color="#FF8A70" />
                    Job Description
                  </p>
                  <div
                    style={{
                      backgroundColor: "#8C1800",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    <p
                      style={{
                        color: "#FF8A70",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                      }}
                    >
                      REQUIRED
                    </p>
                  </div>
                </div>
                <p>
                  <small>
                    Provide the full context of the role being evaluated.
                  </small>
                </p>
              </label>
              <textarea
                name="jobdescription"
                id="jobDscription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Enter job description here....."
              ></textarea>
              <div
                className={`word-counter ${wordCount > 5000 ? "over-limit" : ""}`}
              >
                {wordCount} / 5000 words
              </div>
            </div>
          </div>

          <div className="right">
            <div className="input-group">
              <div className="left-card-input">
                <div>
                  <div className="job-desc-header">
                    <p className="icon-label-group">
                      <RiFileUploadLine color="#FF8A70" />
                      <span>Upload Resume</span>
                    </p>
                    <div
                      style={{
                        backgroundColor: "#8C1800",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      <p
                        style={{
                          color: "#FF8A70",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                        }}
                      >
                        REQUIRED
                      </p>
                    </div>
                  </div>
                  <small className="highlight">
                    (Upload self description and resume together for best
                    result)
                  </small>
                </div>
                <label className="file-label" htmlFor="resume">
                  <RiUploadCloud2Line size={28} color="#FF8A70" />
                  Drag and drop file here, or click to browse
                </label>
                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  name="resume"
                  id="resume"
                  accept=".pdf"
                />
              </div>
            </div>

            <div className="left-card-input">
              <div className="input-group">
                <div className="job-desc-header">
                  <p className="icon-label-group">
                    <RiUserSearchLine color="#FF8A70" size={20} />
                    <label htmlFor="selfDescription">Self Description</label>
                  </p>
                  <div
                    style={{
                      backgroundColor: "#8C1800",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    <p
                      style={{
                        color: "#FF8A70",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                      }}
                    >
                      BEST RESULTS
                    </p>
                  </div>
                </div>
                <textarea
                  name="selfDescription"
                  id="selfDescription"
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  placeholder="describe yourself in few sentences..."
                ></textarea>
                <div
                  className={`word-counter ${selfWordCount > 5000 ? "over-limit" : ""}`}
                >
                  {selfWordCount} / 5000 words
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="homepage-generate-button">
          <p style={{ color: "#3F4850", fontSize: "0.875rem" }}>
            AI-Powered Strategy Generation. Approx 30s
          </p>
          <button
            onClick={handleGenerateReport}
            className="button primary-button"
          >
            <RiBardLine />
            Generate Interview Report
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;
