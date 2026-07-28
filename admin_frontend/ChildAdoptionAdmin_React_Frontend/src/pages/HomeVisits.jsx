import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock3,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { api, errorMessage } from "../api";
import {
  PageHeader,
  Card,
  Status,
  Loading,
  Empty,
  Modal,
  Button,
  Field,
  SelectField,
  TextareaField,
  Toast,
  SearchBox,
} from "../components/UI";

const emptyForm = {
  requestId: "",
  socialWorkerId: "",
  scheduledDate: "",
  scheduledTime: "",
  notes: "",
};
const emptyReport = {
  overallImpression: "",
  familyEnvironment: "",
  financialStability: "",
  familySupport: "",
  anyConcern: "",
  remarks: "",
};
const today = () => new Date().toISOString().slice(0, 10);
const timeText = (value) => (value ? String(value).slice(0, 5) : "Not set");

export default function HomeVisits() {
  const [rows, setRows] = useState([]),
    [workers, setWorkers] = useState([]),
    [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [toast, setToast] = useState(null);
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("ALL"),
    [workerFilter, setWorkerFilter] = useState(""),
    [dateFilter, setDateFilter] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false),
    [editVisit, setEditVisit] = useState(null),
    [detail, setDetail] = useState(null),
    [completeVisit, setCompleteVisit] = useState(null);
  const [form, setForm] = useState(emptyForm),
    [report, setReport] = useState(emptyReport);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status !== "ALL") params.status = status;
      if (workerFilter) params.socialWorkerId = workerFilter;
      if (dateFilter) params.visitDate = dateFilter;
      const [visits, sw, applications] = await Promise.all([
        api.get("/home-visits", { params }),
        api.get("/social-workers", { params: { status: "ACTIVE" } }),
        api.get("/applications"),
      ]);
      setRows(visits.data);
      setWorkers(sw.data);
      setApps(
        applications.data.filter(
          (a) => !["APPROVED", "REJECTED"].includes(a.status),
        ),
      );
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [search, status, workerFilter, dateFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((x) => x.status === "PENDING").length,
      completed: rows.filter((x) => x.status === "COMPLETED").length,
      cancelled: rows.filter((x) => x.status === "CANCELLED").length,
    }),
    [rows],
  );
  const closeSchedule = () => {
    setScheduleOpen(false);
    setForm(emptyForm);
  };
  const submitSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/home-visits", {
        ...form,
        requestId: Number(form.requestId),
        socialWorkerId: Number(form.socialWorkerId),
        scheduledTime: form.scheduledTime ? `${form.scheduledTime}:00` : null,
      });
      setToast({ message: "Home visit scheduled successfully." });
      closeSchedule();
      await load();
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };
  const openEdit = async (row) => {
    try {
      const { data } = await api.get(`/home-visits/${row.homeVisitId}`);
      setEditVisit(data);
      setForm({
        requestId: String(data.requestId),
        socialWorkerId: String(data.socialWorkerId),
        scheduledDate: data.scheduledDate.slice(0, 10),
        scheduledTime:
          timeText(data.scheduledTime) === "Not set"
            ? ""
            : timeText(data.scheduledTime),
        notes: data.remarks || "",
      });
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    }
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/home-visits/${editVisit.homeVisitId}`, {
        socialWorkerId: Number(form.socialWorkerId),
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime ? `${form.scheduledTime}:00` : null,
        notes: form.notes,
      });
      setToast({ message: "Home visit updated successfully." });
      setEditVisit(null);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };
  const view = async (id) => {
    try {
      const { data } = await api.get(`/home-visits/${id}`);
      setDetail(data);
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    }
  };
  const openComplete = async (row) => {
    try {
      const { data } = await api.get(`/home-visits/${row.homeVisitId}`);
      setCompleteVisit(data);
      setReport({
        overallImpression: data.overallImpression || "",
        familyEnvironment: data.familyEnvironment || "",
        financialStability: data.financialStability || "",
        familySupport: data.familySupport || "",
        anyConcern: data.anyConcern || "",
        remarks: data.remarks || "",
      });
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    }
  };
  const complete = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(
        `/home-visits/${completeVisit.homeVisitId}/complete`,
        report,
      );
      setToast({
        message: "Home visit completed and application moved under review.",
      });
      setCompleteVisit(null);
      setReport(emptyReport);
      await load();
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };
  const cancel = async (row) => {
    if (!window.confirm(`Cancel ${row.visitCode}?`)) return;
    try {
      await api.put(`/home-visits/${row.homeVisitId}/cancel`);
      setToast({ message: "Home visit cancelled." });
      await load();
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    }
  };

  return (
    <>
      <PageHeader
        title="Home Visits"
        description="Assign social workers, manage schedules, and review family assessment reports."
        actions={
          <Button
            onClick={() => {
              setForm(emptyForm);
              setScheduleOpen(true);
            }}
          >
            <Plus size={17} /> Assign visit
          </Button>
        }
      />
      <div className="home-visit-stats">
        <Card>
          <CalendarDays />
          <div>
            <span>Total visits</span>
            <strong>{stats.total}</strong>
          </div>
        </Card>
        <Card>
          <Clock3 />
          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </Card>
        <Card>
          <ClipboardCheck />
          <div>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
        </Card>
        <Card>
          <XCircle />
          <div>
            <span>Cancelled</span>
            <strong>{stats.cancelled}</strong>
          </div>
        </Card>
      </div>
      <Card>
        <div className="table-tools home-visit-tools">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search visit, application, parent, child..."
          />
          <select
            className="filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            className="filter-select"
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
          >
            <option value="">All workers</option>
            {workers.map((w) => (
              <option key={w.socialWorkerId} value={w.socialWorkerId}>
                {w.firstName} {w.lastName}
              </option>
            ))}
          </select>
          <input
            className="date-chip"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {loading ? (
          <Loading />
        ) : rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Visit</th>
                  <th>Application</th>
                  <th>Parent / Child</th>
                  <th>Social worker</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.homeVisitId}>
                    <td>
                      <b>{r.visitCode}</b>
                    </td>
                    <td>{r.applicationNumber}</td>
                    <td>
                      <b>{r.parentName}</b>
                      <small>{r.childName}</small>
                    </td>
                    <td>{r.socialWorkerName}</td>
                    <td>
                      {new Date(r.scheduledDate).toLocaleDateString("en-IN")}
                      <small>{timeText(r.scheduledTime)}</small>
                    </td>
                    <td>
                      <Status value={r.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title="View"
                          onClick={() => view(r.homeVisitId)}
                        >
                          <Eye size={16} />
                        </button>
                        {r.status === "PENDING" && (
                          <>
                            <button
                              title="Reschedule"
                              onClick={() => openEdit(r)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              title="Complete"
                              onClick={() => openComplete(r)}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              title="Cancel"
                              className="danger-action"
                              onClick={() => cancel(r)}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No home visits found"
            text="Assign a visit to a pending adoption application."
          />
        )}
      </Card>

      <VisitFormModal
        open={scheduleOpen}
        title="Assign home visit"
        form={form}
        setForm={setForm}
        apps={apps}
        workers={workers}
        onClose={closeSchedule}
        onSubmit={submitSchedule}
        saving={saving}
      />
      <VisitFormModal
        open={!!editVisit}
        title={`Reschedule ${editVisit?.visitCode || ""}`}
        form={form}
        setForm={setForm}
        apps={apps}
        workers={workers}
        onClose={() => {
          setEditVisit(null);
          setForm(emptyForm);
        }}
        onSubmit={submitEdit}
        saving={saving}
        editing
      />

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.visitCode} details` : "Home visit"}
        wide
      >
        {detail && (
          <div className="home-visit-detail">
            <div className="application-detail-head">
              <div>
                <span>Application</span>
                <b>{detail.applicationNumber}</b>
              </div>
              <Status value={detail.status} />
            </div>
            <section>
              <h3>Visit schedule</h3>
              <div className="detail-grid">
                <Info
                  label="Date"
                  value={new Date(detail.scheduledDate).toLocaleDateString(
                    "en-IN",
                  )}
                />
                <Info label="Time" value={timeText(detail.scheduledTime)} />
                <Info label="Social worker" value={detail.socialWorkerName} />
                <Info label="Worker phone" value={detail.socialWorkerPhone} />
              </div>
            </section>
            <section>
              <h3>Family and child</h3>
              <div className="detail-grid">
                <Info label="Parent" value={detail.parentName} />
                <Info label="Child" value={detail.childName} />
                <Info label="Parent email" value={detail.parentEmail} />
                <Info label="Parent phone" value={detail.parentPhone} />
                <Info
                  label="Address"
                  value={
                    [
                      detail.parentAddress,
                      detail.parentCity,
                      detail.parentState,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
              </div>
            </section>
            <section>
              <h3>Home visit report</h3>
              {detail.status === "COMPLETED" ? (
                <div className="detail-grid">
                  <Info
                    label="Overall impression"
                    value={detail.overallImpression}
                  />
                  <Info
                    label="Family environment"
                    value={detail.familyEnvironment}
                  />
                  <Info
                    label="Financial stability"
                    value={detail.financialStability}
                  />
                  <Info label="Family support" value={detail.familySupport} />
                  <Info label="Any concern" value={detail.anyConcern} />
                  <Info
                    label="Completed on"
                    value={
                      detail.completedAt
                        ? new Date(detail.completedAt).toLocaleString("en-IN")
                        : "—"
                    }
                  />
                  <Info label="Remarks" value={detail.remarks} />
                </div>
              ) : (
                <p className="muted-text">
                  The report will be available after the social worker completes
                  the visit.
                </p>
              )}
            </section>
          </div>
        )}
      </Modal>

      <Modal
        open={!!completeVisit}
        onClose={() => setCompleteVisit(null)}
        title={
          completeVisit
            ? `Complete ${completeVisit.visitCode}`
            : "Complete visit"
        }
        wide
      >
        {completeVisit && (
          <form onSubmit={complete}>
            <div className="visit-report-note">
              Submitting this report marks the visit as completed and moves
              application <b>{completeVisit.applicationNumber}</b> to{" "}
              <b>UNDER REVIEW</b>.
            </div>
            <div className="form-grid">
              <SelectField
                label="Overall impression"
                value={report.overallImpression}
                onChange={(e) =>
                  setReport({ ...report, overallImpression: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </SelectField>
              <SelectField
                label="Family environment"
                value={report.familyEnvironment}
                onChange={(e) =>
                  setReport({ ...report, familyEnvironment: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </SelectField>
              <SelectField
                label="Financial stability"
                value={report.financialStability}
                onChange={(e) =>
                  setReport({ ...report, financialStability: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option>Stable</option>
                <option>Moderate</option>
                <option>Unstable</option>
              </SelectField>
              <SelectField
                label="Family support"
                value={report.familySupport}
                onChange={(e) =>
                  setReport({ ...report, familySupport: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option>Strong</option>
                <option>Moderate</option>
                <option>Weak</option>
              </SelectField>
              <SelectField
                label="Any child-safety concern?"
                value={report.anyConcern}
                onChange={(e) =>
                  setReport({ ...report, anyConcern: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option>No</option>
                <option>Yes</option>
              </SelectField>
              <div className="full">
                <TextareaField
                  label="Recommendation / remarks"
                  rows="4"
                  value={report.remarks}
                  onChange={(e) =>
                    setReport({ ...report, remarks: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCompleteVisit(null)}
              >
                Cancel
              </Button>
              <Button loading={saving}>Complete visit</Button>
            </div>
          </form>
        )}
      </Modal>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

function VisitFormModal({
  open,
  title,
  form,
  setForm,
  apps,
  workers,
  onClose,
  onSubmit,
  saving,
  editing = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={onSubmit}>
        {!editing && (
          <SelectField
            label="Adoption application"
            value={form.requestId}
            onChange={(e) => setForm({ ...form, requestId: e.target.value })}
            required
          >
            <option value="">Select application</option>
            {apps.map((a) => (
              <option key={a.requestId} value={a.requestId}>
                {a.applicationNumber} · {a.parentName} · {a.childName}
              </option>
            ))}
          </SelectField>
        )}
        <SelectField
          label="Social worker"
          value={form.socialWorkerId}
          onChange={(e) => setForm({ ...form, socialWorkerId: e.target.value })}
          required
        >
          <option value="">Select active worker</option>
          {workers.map((w) => (
            <option key={w.socialWorkerId} value={w.socialWorkerId}>
              {w.firstName} {w.lastName} · {w.district || "No district"}
            </option>
          ))}
        </SelectField>
        <div className="form-grid">
          <Field
            label="Visit date"
            type="date"
            min={today()}
            value={form.scheduledDate}
            onChange={(e) =>
              setForm({ ...form, scheduledDate: e.target.value })
            }
            required
          />
          <Field
            label="Visit time"
            type="time"
            value={form.scheduledTime}
            onChange={(e) =>
              setForm({ ...form, scheduledTime: e.target.value })
            }
          />
          <div className="full">
            <TextareaField
              label="Admin notes"
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving}>
            {editing ? "Save changes" : "Assign visit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value || "—"}</b>
    </div>
  );
}
