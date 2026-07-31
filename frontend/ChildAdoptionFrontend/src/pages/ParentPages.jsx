import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Baby,
  ClipboardList,
  CheckCircle2,
  Bell,
  Eye,
  Upload,
  FileText,
  House,
  CalendarDays,
  Award,
  Send,
  Save,
  LockKeyhole,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  Field,
  SelectField,
  TextareaField,
  SearchBox,
  Status,
  Modal,
  Toast,
  Loading,
} from "../components/UI";
import {
  children as initialChildren,
  parentApplication,
  documents as initialDocs,
} from "../data/mockData";
import { getUser, saveUserProfile } from "../auth";
import { api, errorMessage } from "../api";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
export function ParentDashboard() {
  const nav = useNavigate();
  const u = getUser();
  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title={`Welcome, ${u?.fullName?.split(" ")[0] || "Parent"}`}
        description="Track your profile, documents, applications and adoption journey."
      />
      <div className="stat-grid">
        <Card className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 />
          </div>
          <div>
            <span>Profile completion</span>
            <strong>82%</strong>
            <small>Complete remaining details</small>
          </div>
        </Card>
        <Card className="stat-card tone-1">
          <div className="stat-icon">
            <ClipboardList />
          </div>
          <div>
            <span>Applications</span>
            <strong>1</strong>
            <small>One active application</small>
          </div>
        </Card>
        <Card className="stat-card tone-2">
          <div className="stat-icon">
            <House />
          </div>
          <div>
            <span>Home visit</span>
            <strong>27 Jul</strong>
            <small>Scheduled at 10:30 AM</small>
          </div>
        </Card>
        <Card className="stat-card tone-3">
          <div className="stat-icon">
            <Bell />
          </div>
          <div>
            <span>Notifications</span>
            <strong>3</strong>
            <small>Two require attention</small>
          </div>
        </Card>
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="card-title">
            <div>
              <span className="eyebrow">Current application</span>
              <h2>{parentApplication.applicationNumber}</h2>
            </div>
            <Status value={parentApplication.status} />
          </div>
          <div className="detail-grid compact">
            <div>
              <span>Child</span>
              <b>{parentApplication.childName}</b>
            </div>
            <div>
              <span>Applied date</span>
              <b>{fmt(parentApplication.appliedDate)}</b>
            </div>
            <div>
              <span>Social worker</span>
              <b>{parentApplication.socialWorker}</b>
            </div>
            <div>
              <span>Visit status</span>
              <Status value={parentApplication.visitStatus} />
            </div>
          </div>
          <div className="modal-actions left">
            <Button onClick={() => nav("/parent/applications")}>
              Track application
            </Button>
            <Button variant="secondary" onClick={() => nav("/parent/children")}>
              Browse children
            </Button>
          </div>
        </Card>
        <Card>
          <div className="card-title">
            <div>
              <span className="eyebrow">Next steps</span>
              <h2>Complete your journey</h2>
            </div>
            <Baby />
          </div>
          <div className="activity-list">
            <div>
              <div className="activity-dot" />
              <div>
                <strong>Upload Marriage Certificate</strong>
                <p>Required before final verification.</p>
              </div>
              <Status value="PENDING" />
            </div>
            <div>
              <div className="activity-dot" />
              <div>
                <strong>Prepare for home visit</strong>
                <p>Your assigned social worker will visit on 27 July.</p>
              </div>
              <Status value="SCHEDULED" />
            </div>
            <div>
              <div className="activity-dot" />
              <div>
                <strong>Application under review</strong>
                <p>Admin has verified your initial documents.</p>
              </div>
              <Status value="UNDER_REVIEW" />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export function ParentProfile() {
  const current = getUser();
  const [form, setForm] = useState({
    firstName: current?.firstName || current?.fullName?.split(" ")[0] || "",
    lastName: current?.lastName || current?.fullName?.split(" ").slice(1).join(" ") || "",
    email: current?.email || "",
    phone: current?.phone || "",
    gender: "MALE",
    dob: "",
    aadhaarNumber: "",
    maritalStatus: "MARRIED",
    occupation: "",
    annualIncome: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get("/parents/profile");
        const data = response.data?.data || response.data;
        if (data) {
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            gender: data.gender || "MALE",
            dob: data.dob || "",
            aadhaarNumber: data.aadhaarNumber || "",
            maritalStatus: data.maritalStatus || "MARRIED",
            occupation: data.occupation || "",
            annualIncome: data.annualIncome !== undefined && data.annualIncome !== null ? String(data.annualIncome) : "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
          });
        }
      } catch (e) {
        console.warn("Could not fetch live profile:", errorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put("/parents/profile", form);
      const data = response.data?.data || response.data;
      const updatedUser = {
        ...current,
        fullName: `${data.firstName || form.firstName} ${data.lastName || form.lastName}`.trim(),
        firstName: data.firstName || form.firstName,
        lastName: data.lastName || form.lastName,
        email: data.email || form.email,
        phone: data.phone || form.phone,
        role: "PARENT",
      };
      saveUserProfile(updatedUser);
      setToast({ message: "Profile updated successfully!" });
    } catch (err) {
      setToast({ type: "error", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="My Profile"
        description="Complete and manage your personal and family information."
      />
      <Card>
        <form onSubmit={save}>
          <div className="profile-photo-row">
            <div className="profile-photo-large">{(form.firstName || "P")[0]}</div>
            <div>
              <h3>
                {form.firstName} {form.lastName}
              </h3>
              <label className="btn secondary file-button">
                <Upload size={16} /> Update photo
                <input type="file" accept="image/*" />
              </label>
            </div>
          </div>
          <div className="form-grid">
            <Field
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Field
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <SelectField
              label="Gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option>MALE</option>
              <option>FEMALE</option>
              <option>OTHER</option>
            </SelectField>
            <Field
              label="Date of birth"
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
            <Field
              label="Aadhaar number"
              value={form.aadhaarNumber}
              onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
            />
            <SelectField
              label="Marital status"
              value={form.maritalStatus}
              onChange={(e) =>
                setForm({ ...form, maritalStatus: e.target.value })
              }
            >
              <option>MARRIED</option>
              <option>SINGLE</option>
              <option>DIVORCED</option>
              <option>WIDOWED</option>
            </SelectField>
            <Field
              label="Occupation"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            />
            <Field
              label="Annual income"
              type="number"
              value={form.annualIncome}
              onChange={(e) =>
                setForm({ ...form, annualIncome: e.target.value })
              }
            />
            <Field
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Field
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Field
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <Field
              label="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <Button disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      </Card>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export function ParentDocuments() {
  const [docs, setDocs] = useState(initialDocs);
  const [toast, setToast] = useState(null);
  const upload = (id) => {
    setDocs(
      docs.map((d) =>
        d.id === id
          ? { ...d, status: "PENDING", fileName: "new_upload.pdf" }
          : d,
      ),
    );
    setToast({ message: "Document uploaded for verification" });
  };
  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="Required Documents"
        description="Upload clear PDF or image copies. Admin verification starts after submission."
      />
      <div className="document-grid">
        {docs.map((d) => (
          <Card key={d.id} className="document-card">
            <div className="document-icon">
              <FileText />
            </div>
            <div>
              <h3>{d.name}</h3>
              <p>{d.fileName}</p>
              <Status value={d.status} />
            </div>
            <label className="btn secondary file-button">
              <Upload size={15} /> Upload
              <input type="file" onChange={() => upload(d.id)} />
            </label>
          </Card>
        ))}
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export function ParentChildren() {
  const [childrenList, setChildrenList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [special, setSpecial] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toast, setToast] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchChildren = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get(`/children?page=${page}&size=10`);
      const data = res.data?.content ? res.data.content : (Array.isArray(res.data) ? res.data : []);
      if (res.data?.totalPages !== undefined) {
        setTotalPages(res.data.totalPages);
      }
      setChildrenList(data);
      setIsFetched(true);
    } catch (err) {
      console.warn("Using fallback initial children:", errorMessage(err));
      setChildrenList(initialChildren);
    } finally {
      setLoadingList(false);
    }
  }, [page]);

  React.useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const openDetailModal = async (c) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/children/${c.childId}`);
      setDetail(res.data);
    } catch (err) {
      setDetail(c);
    } finally {
      setLoadingDetail(false);
    }
  };

  const baseList = isFetched ? childrenList : initialChildren;

  const rows = useMemo(
    () =>
      baseList.filter(
        (c) =>
          (!search ||
            (c.name || `${c.firstName || ''} ${c.lastName || ''}`)
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (!gender || c.gender === gender) &&
          (!age || (c.age != null && c.age <= Number(age))) &&
          (!special || (special === "YES" ? c.specialNeeds : !c.specialNeeds)),
      ),
    [baseList, search, gender, age, special],
  );

  const apply = (c) =>
    setToast({
      message: `Application started for ${c.name || c.firstName}. Demo request created.`,
    });

  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="Available Children"
        description="Browse basic information for children currently available for adoption."
      />
      <Card>
        <div className="table-tools child-filters">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by name"
          />
          <select
            className="filter-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">All genders</option>
            <option>MALE</option>
            <option>FEMALE</option>
          </select>
          <select
            className="filter-select"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          >
            <option value="">Any age</option>
            <option value="5">Up to 5</option>
            <option value="8">Up to 8</option>
            <option value="12">Up to 12</option>
          </select>
          <select
            className="filter-select"
            value={special}
            onChange={(e) => setSpecial(e.target.value)}
          >
            <option value="">Special needs: Any</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>
        {loadingList ? (
          <Loading />
        ) : (
          <div className="card-grid">
            {rows.map((c) => (
              <article className="child-card" key={c.childId}>
                <div className="child-photo">
                  <img
                    src={c.image || c.profilePhoto || "https://images.unsplash.com/photo-1595454223600-91fbddbbf255?auto=format&fit=crop&w=600&q=80"}
                    alt={c.name || c.firstName}
                  />
                  <Status value={c.status || "AVAILABLE"} />
                </div>
                <div className="child-body">
                  <h3>
                    {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()}
                  </h3>
                  <p>
                    {c.gender} · {c.age != null ? `${c.age} years` : 'Age N/A'} · {c.education || 'Primary'}
                  </p>
                  <div className="tag-row">
                    {c.hobbies && <span>{c.hobbies}</span>}
                    {c.specialNeeds && <span>Special needs</span>}
                  </div>
                  <div className="card-actions parent-actions">
                    <button onClick={() => openDetailModal(c)}>
                      <Eye /> Details
                    </button>
                    <button onClick={() => apply(c)}>
                      <ClipboardList /> Apply
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Child Details"
        wide
      >
        {detail && (
          <>
            <div className="child-detail-hero">
              <img src={detail.image || detail.profilePhoto} alt={detail.name || detail.firstName} />
              <div>
                <h3>
                  {detail.name || `${detail.firstName || ''} ${detail.lastName || ''}`.trim()}
                </h3>
                <Status value={detail.status || "AVAILABLE"} />
                <p>
                  {detail.gender} · {detail.age != null ? `${detail.age} years` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="detail-grid">
              <div>
                <span>Date of birth</span>
                <b>{detail.dob ? fmt(detail.dob) : 'N/A'}</b>
              </div>
              <div>
                <span>Blood group</span>
                <b>{detail.bloodGroup || 'N/A'}</b>
              </div>
              <div>
                <span>Education</span>
                <b>{detail.education || 'N/A'}</b>
              </div>
              <div>
                <span>Hobbies</span>
                <b>{detail.hobbies || 'N/A'}</b>
              </div>
              <div>
                <span>Special needs</span>
                <b>{detail.specialNeeds ? "Yes" : "No"}</b>
              </div>
              <div>
                <span>Medical summary</span>
                <b>{detail.medicalSummary || detail.medicalNotes || 'Healthy'}</b>
              </div>
            </div>
            {detail.description && <p className="description-box">{detail.description}</p>}
            <div className="modal-actions">
              <Button
                onClick={() => {
                  apply(detail);
                  setDetail(null);
                }}
              >
                Apply for adoption
              </Button>
            </div>
          </>
        )}
      </Modal>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export function ParentApplications() {
  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="Track Application"
        description="View the latest status and home visit details for your adoption request."
      />
      <Card>
        <div className="application-detail-head">
          <div>
            <span>Application number</span>
            <b>{parentApplication.applicationNumber}</b>
          </div>
          <Status value={parentApplication.status} />
        </div>
        <div className="journey-timeline">
          {["PENDING", "UNDER_REVIEW", "HOME_VISIT", "FINAL_DECISION"].map(
            (s, i) => (
              <div
                className={i < 2 ? "done" : i === 2 ? "current" : ""}
                key={s}
              >
                <i>{i < 2 ? "✓" : i + 1}</i>
                <span>{s.replaceAll("_", " ")}</span>
              </div>
            ),
          )}
        </div>
        <div className="detail-grid">
          <div>
            <span>Child name</span>
            <b>{parentApplication.childName}</b>
          </div>
          <div>
            <span>Applied date</span>
            <b>{fmt(parentApplication.appliedDate)}</b>
          </div>
          <div>
            <span>Visit date</span>
            <b>{fmt(parentApplication.visitDate)}</b>
          </div>
          <div>
            <span>Visit time</span>
            <b>{parentApplication.visitTime}</b>
          </div>
          <div>
            <span>Assigned social worker</span>
            <b>{parentApplication.socialWorker}</b>
          </div>
          <div>
            <span>Visit status</span>
            <Status value={parentApplication.visitStatus} />
          </div>
        </div>
        <div className="info-banner card">
          <strong>Admin remark</strong>
          <p>{parentApplication.adminRemark}</p>
        </div>
      </Card>
    </>
  );
}
export function AdoptionRecord() {
  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="Adoption Record"
        description="Your final adoption certificate will appear here after approval."
      />
      <Card>
        <div className="empty">
          <Award size={44} />
          <h3>No adoption record yet</h3>
          <p>
            Your application is currently under review. Approved records include
            child name, adoption date and certificate number.
          </p>
        </div>
      </Card>
    </>
  );
}
export function ParentContact() {
  const [toast, setToast] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    setToast({ message: "Your message has been submitted" });
  };
  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="Contact Us"
        description="Send a question to the adoption support team."
      />
      <Card className="contact-card">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Name" required />
            <Field label="Email" type="email" required />
            <Field label="Phone" required />
            <Field label="Subject" required />
            <div className="full">
              <TextareaField label="Message" required />
            </div>
          </div>
          <div className="modal-actions">
            <Button>
              <Send size={16} /> Submit message
            </Button>
          </div>
        </form>
      </Card>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
export function SecurityPage() {
  const [toast, setToast] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    setToast({ message: "Password changed successfully" });
  };
  return (
    <>
      <PageHeader
        title="Change Password"
        description="Use a strong password with at least eight characters."
      />
      <Card className="security-card">
        <form onSubmit={submit} className="stack-form">
          <Field label="Current password" type="password" required />
          <Field label="New password" type="password" minLength="8" required />
          <Field
            label="Confirm new password"
            type="password"
            minLength="8"
            required
          />
          <Button>
            <LockKeyhole size={16} /> Update password
          </Button>
        </form>
      </Card>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
