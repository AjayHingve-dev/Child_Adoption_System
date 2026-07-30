import React, { useMemo, useState } from "react";
import {
  ClipboardList,
  House,
  CheckCircle2,
  FileText,
  Eye,
  CalendarDays,
  Download,
  Save,
  UserRound,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  SearchBox,
  Status,
  Modal,
  Field,
  SelectField,
  TextareaField,
  Toast,
} from "../components/UI";
import { workerApplications, parentDetails, documents } from "../data/mockData";
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
export function WorkerDashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Social worker portal"
        title="Field Work Dashboard"
        description="Manage assigned applications, home visits and submitted reports."
      />
      <div className="stat-grid">
        <Card className="stat-card">
          <div className="stat-icon">
            <ClipboardList />
          </div>
          <div>
            <span>Assigned applications</span>
            <strong>3</strong>
            <small>Two active reviews</small>
          </div>
        </Card>
        <Card className="stat-card tone-1">
          <div className="stat-icon">
            <House />
          </div>
          <div>
            <span>Pending home visits</span>
            <strong>2</strong>
            <small>Next visit on 26 July</small>
          </div>
        </Card>
        <Card className="stat-card tone-2">
          <div className="stat-icon">
            <CheckCircle2 />
          </div>
          <div>
            <span>Completed visits</span>
            <strong>1</strong>
            <small>This month</small>
          </div>
        </Card>
        <Card className="stat-card tone-3">
          <div className="stat-icon">
            <FileText />
          </div>
          <div>
            <span>Submitted reports</span>
            <strong>1</strong>
            <small>Read-only after submission</small>
          </div>
        </Card>
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="card-title">
            <div>
              <span className="eyebrow">Upcoming visits</span>
              <h2>Schedule</h2>
            </div>
            <CalendarDays />
          </div>
          <div className="activity-list">
            {workerApplications
              .filter((a) => a.visitStatus !== "COMPLETED")
              .map((a) => (
                <div key={a.applicationId}>
                  <div className="activity-dot" />
                  <div>
                    <strong>{a.parentName}</strong>
                    <p>
                      {a.childName} · {fmt(a.visitDate)} at {a.visitTime}
                    </p>
                  </div>
                  <Status value={a.visitStatus} />
                </div>
              ))}
          </div>
        </Card>
        <Card>
          <div className="card-title">
            <div>
              <span className="eyebrow">Recent work</span>
              <h2>Reports</h2>
            </div>
            <FileText />
          </div>
          <div className="activity-list">
            <div>
              <div className="activity-dot" />
              <div>
                <strong>APP-2026-0087</strong>
                <p>Home study report submitted for Sneha Iyer.</p>
              </div>
              <Status value="RECOMMENDED" />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export function WorkerApplications() {
  const [search, setSearch] = useState(""),
    [detail, setDetail] = useState(null);
  const rows = useMemo(
    () =>
      workerApplications.filter(
        (a) =>
          !search ||
          `${a.applicationNumber} ${a.parentName} ${a.childName}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [search],
  );
  return (
    <>
      <PageHeader
        eyebrow="Social worker portal"
        title="Assigned Applications"
        description="Review assigned parent, child and application information."
      />
      <Card>
        <div className="table-tools">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search applications"
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Parent</th>
                <th>Child</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.applicationId}>
                  <td>
                    <b>{a.applicationNumber}</b>
                  </td>
                  <td>{a.parentName}</td>
                  <td>{a.childName}</td>
                  <td>{fmt(a.applicationDate)}</td>
                  <td>
                    <Status value={a.status} />
                  </td>
                  <td>
                    <Button variant="secondary" onClick={() => setDetail(a)}>
                      <Eye size={15} /> View details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Application Details"
        wide
      >
        {detail && (
          <>
            <div className="application-detail-head">
              <div>
                <span>Application</span>
                <b>{detail.applicationNumber}</b>
              </div>
              <Status value={detail.status} />
            </div>
            <section className="worker-section">
              <h3>Parent information</h3>
              <div className="detail-grid">
                <div>
                  <span>Name</span>
                  <b>{parentDetails.name}</b>
                </div>
                <div>
                  <span>Age / Gender</span>
                  <b>
                    {parentDetails.age} / {parentDetails.gender}
                  </b>
                </div>
                <div>
                  <span>Occupation</span>
                  <b>{parentDetails.occupation}</b>
                </div>
                <div>
                  <span>Annual income</span>
                  <b>{parentDetails.annualIncome}</b>
                </div>
                <div>
                  <span>Phone</span>
                  <b>{parentDetails.phone}</b>
                </div>
                <div>
                  <span>Email</span>
                  <b>{parentDetails.email}</b>
                </div>
                <div>
                  <span>Marital status</span>
                  <b>{parentDetails.maritalStatus}</b>
                </div>
                <div>
                  <span>Family members</span>
                  <b>{parentDetails.familyMembers}</b>
                </div>
                <div className="wide-detail">
                  <span>Address</span>
                  <b>{parentDetails.address}</b>
                </div>
              </div>
            </section>
            <section className="worker-section">
              <h3>Uploaded documents</h3>
              <div className="document-list">
                {documents.map((d) => (
                  <div key={d.id}>
                    <FileText />
                    <span>
                      <b>{d.name}</b>
                      <small>{d.fileName}</small>
                    </span>
                    <Status value={d.status} />
                    <button title="View">
                      <Eye size={16} />
                    </button>
                    <button title="Download">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </Modal>
    </>
  );
}

export function WorkerVisits() {
  const [rows, setRows] = useState(workerApplications),
    [schedule, setSchedule] = useState(null),
    [report, setReport] = useState(null),
    [toast, setToast] = useState(null);
  const saveSchedule = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setRows(
      rows.map((r) =>
        r.applicationId === schedule.applicationId
          ? {
              ...r,
              visitDate: fd.get("date"),
              visitTime: fd.get("time"),
              visitStatus: "SCHEDULED",
            }
          : r,
      ),
    );
    setSchedule(null);
    setToast({ message: "Home visit scheduled successfully" });
  };
  const submitReport = (e) => {
    e.preventDefault();
    setRows(
      rows.map((r) =>
        r.applicationId === report.applicationId
          ? { ...r, visitStatus: "COMPLETED", recommendation: "RECOMMENDED" }
          : r,
      ),
    );
    setReport(null);
    setToast({ message: "Home study report submitted and locked" });
  };
  return (
    <>
      <PageHeader
        eyebrow="Social worker portal"
        title="Home Visits"
        description="Schedule visits, inspect the family environment and submit home study reports."
      />
      <div className="visit-grid">
        {rows.map((a) => (
          <Card key={a.applicationId} className="visit-card">
            <div className="visit-top">
              <div>
                <span>{a.applicationNumber}</span>
                <h3>{a.parentName}</h3>
              </div>
              <Status value={a.visitStatus} />
            </div>
            <p className="muted-text">
              Child: <b>{a.childName}</b>
            </p>
            <div className="visit-info">
              <p>
                <b>Date</b>
                {fmt(a.visitDate)}
              </p>
              <p>
                <b>Time</b>
                {a.visitTime || "—"}
              </p>
              <p>
                <b>Status</b>
                {a.visitStatus}
              </p>
            </div>
            <div className="card-actions worker-actions">
              <Button variant="secondary" onClick={() => setSchedule(a)}>
                <CalendarDays size={15} /> Schedule
              </Button>
              <Button
                disabled={a.visitStatus === "COMPLETED"}
                onClick={() => setReport(a)}
              >
                <FileText size={15} /> Fill report
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={!!schedule}
        onClose={() => setSchedule(null)}
        title="Schedule Home Visit"
      >
        <form onSubmit={saveSchedule}>
          <div className="form-grid">
            <Field
              name="date"
              label="Visit date"
              type="date"
              defaultValue={schedule?.visitDate}
              required
            />
            <Field
              name="time"
              label="Visit time"
              type="time"
              defaultValue={schedule?.visitTime}
              required
            />
            <div className="full">
              <TextareaField
                name="remarks"
                label="Remarks"
                placeholder="Preparation notes or instructions"
              />
            </div>
          </div>
          <div className="modal-actions">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setSchedule(null)}
            >
              Cancel
            </Button>
            <Button>Schedule visit</Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!report}
        onClose={() => setReport(null)}
        title="Home Study Report"
        wide
      >
        <form onSubmit={submitReport}>
          <div className="visit-report-note">
            Inspect house condition, financial stability, family environment,
            parent behaviour and child safety before submitting.
          </div>
          <div className="form-grid">
            <SelectField label="House condition" required>
              <option value="">Select</option>
              <option>EXCELLENT</option>
              <option>GOOD</option>
              <option>AVERAGE</option>
              <option>POOR</option>
            </SelectField>
            <SelectField label="Financial stability" required>
              <option value="">Select</option>
              <option>STABLE</option>
              <option>MODERATE</option>
              <option>WEAK</option>
            </SelectField>
            <SelectField label="Family support" required>
              <option value="">Select</option>
              <option>EXCELLENT</option>
              <option>GOOD</option>
              <option>AVERAGE</option>
              <option>POOR</option>
            </SelectField>
            <SelectField label="Parent behaviour rating" required>
              <option value="">Select rating</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </SelectField>
            <div className="full">
              <TextareaField label="Overall observation" required />
            </div>
            <SelectField label="Recommendation" required>
              <option value="">Select</option>
              <option>RECOMMENDED</option>
              <option>RECOMMENDED_WITH_CONDITIONS</option>
              <option>NOT_RECOMMENDED</option>
            </SelectField>
            <div className="full">
              <TextareaField label="Final remarks" required />
            </div>
          </div>
          <div className="modal-actions">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setReport(null)}
            >
              Cancel
            </Button>
            <Button>
              <Save size={16} /> Submit and lock report
            </Button>
          </div>
        </form>
      </Modal>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export function WorkerReports() {
  const [detail, setDetail] = useState(null);
  const report = {
    applicationNumber: "APP-2026-0087",
    parentName: "Sneha Iyer",
    visitDate: "2026-07-18",
    recommendation: "RECOMMENDED",
    houseCondition: "GOOD",
    financialStability: "STABLE",
    familySupport: "EXCELLENT",
    parentBehaviour: 5,
    observation:
      "The family has a safe, supportive and child-friendly home environment.",
    remarks: "Recommended for final admin review.",
  };
  return (
    <>
      <PageHeader
        eyebrow="Social worker portal"
        title="Submitted Reports"
        description="Submitted home study reports are read-only and available for admin review."
      />
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Parent</th>
                <th>Visit Date</th>
                <th>Recommendation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>{report.applicationNumber}</b>
                </td>
                <td>{report.parentName}</td>
                <td>{fmt(report.visitDate)}</td>
                <td>
                  <Status value={report.recommendation} />
                </td>
                <td>
                  <Button variant="secondary" onClick={() => setDetail(report)}>
                    <Eye size={15} /> View report
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Submitted Home Study Report"
        wide
      >
        {detail && (
          <>
            <div className="visit-report-note">
              This report is read-only because it has already been submitted.
            </div>
            <div className="detail-grid">
              {Object.entries(detail).map(([k, v]) => (
                <div key={k}>
                  <span>{k.replace(/([A-Z])/g, " $1")}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
export function WorkerProfile() {
  return (
    <>
      <PageHeader
        eyebrow="Social worker portal"
        title="My Profile"
        description="View your registered social worker information."
      />
      <Card>
        <div className="profile-photo-row">
          <div className="profile-photo-large">M</div>
          <div>
            <h2>Meera Joshi</h2>
            <Status value="ACTIVE" />
          </div>
        </div>
        <div className="detail-grid">
          <div>
            <span>Worker code</span>
            <b>SW-2026-014</b>
          </div>
          <div>
            <span>Email</span>
            <b>worker@aashray.demo</b>
          </div>
          <div>
            <span>Phone</span>
            <b>98765 10001</b>
          </div>
          <div>
            <span>Experience</span>
            <b>5 years</b>
          </div>
          <div>
            <span>City</span>
            <b>Pune</b>
          </div>
          <div>
            <span>Approval status</span>
            <Status value="APPROVED" />
          </div>
        </div>
      </Card>
    </>
  );
}
