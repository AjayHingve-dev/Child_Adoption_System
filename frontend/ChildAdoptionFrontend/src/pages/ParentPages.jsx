import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Trash2,
  ExternalLink,
  Download,
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
  const [homeVisits, setHomeVisits] = useState([]);

  React.useEffect(() => {
    const fetchVisits = async () => {
      try {
        const userIdParam = (u?.userId || u?.id) ? `?userId=${u.userId || u.id}` : "";
        const res = await api.get(`/home-visits/my${userIdParam}`);
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          setHomeVisits(data);
        }
      } catch (err) {
        console.warn("Failed to fetch home visits:", errorMessage(err));
      }
    };
    fetchVisits();
  }, [u?.userId, u?.id]);

  const latestVisit = homeVisits.length > 0 ? homeVisits[0] : null;

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
            <strong>{latestVisit?.visitDate ? fmt(latestVisit.visitDate) : "27 Jul"}</strong>
            <small>{latestVisit?.visitTime ? `At ${latestVisit.visitTime}` : latestVisit?.status ? `Status: ${latestVisit.status}` : "Scheduled at 10:30 AM"}</small>
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
              <h2>{latestVisit?.applicationNumber || parentApplication.applicationNumber}</h2>
            </div>
            <Status value={latestVisit?.status || parentApplication.status} />
          </div>
          <div className="detail-grid compact">
            <div>
              <span>Child</span>
              <b>{latestVisit?.childName || parentApplication.childName}</b>
            </div>
            <div>
              <span>Applied date</span>
              <b>{fmt(parentApplication.appliedDate)}</b>
            </div>
            <div>
              <span>Social worker</span>
              <b>{latestVisit?.assignedSocialWorker || parentApplication.socialWorker}</b>
            </div>
            <div>
              <span>Visit status</span>
              <Status value={latestVisit?.status || parentApplication.visitStatus} />
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
                <p>{latestVisit ? `Scheduled for ${fmt(latestVisit.visitDate)} with ${latestVisit.assignedSocialWorker}` : "Your assigned social worker will visit on 27 July."}</p>
              </div>
              <Status value={latestVisit?.status || "SCHEDULED"} />
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

const REQUIRED_DOCUMENTS = [
  { type: "Aadhaar", name: "Aadhaar Card", description: "Government issued identity proof (PDF, JPG, PNG)" },
  { type: "PAN", name: "PAN Card", description: "Permanent Account Number card (PDF, JPG, PNG)" },
  { type: "Income Certificate", name: "Income Certificate", description: "Proof of annual income / salary slip (PDF, JPG, PNG)" },
  { type: "Marriage Certificate", name: "Marriage Certificate", description: "Legal marriage certificate (PDF, JPG, PNG)" },
  { type: "Medical Certificate", name: "Medical Certificate", description: "Medical fitness certificate (PDF, JPG, PNG)" },
];

export function ParentDocuments() {
  const currentUser = getUser();
  const isRegisteredParent = Boolean(currentUser && currentUser.role === "PARENT" && (currentUser.userId || currentUser.email));
  const [userDocs, setUserDocs] = useState([]);
  const [loading, setLoading] = useState(isRegisteredParent);
  const [uploadingType, setUploadingType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchDocuments = useCallback(async () => {
    if (!isRegisteredParent) return;
    setLoading(true);
    try {
      const userIdParam = (currentUser?.userId || currentUser?.id) ? `?userId=${currentUser.userId || currentUser.id}` : "";
      const res = await api.get(`/documents${userIdParam}`);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setUserDocs(data);
      } else {
        setUserDocs([]);
      }
    } catch (err) {
      console.warn("Failed to fetch documents from API:", errorMessage(err));
      setUserDocs([]);
    } finally {
      setLoading(false);
    }
  }, [isRegisteredParent, currentUser?.userId, currentUser?.id]);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (docType, file) => {
    if (!isRegisteredParent) {
      setToast({ type: "error", message: "Only registered parent users can upload documents. Please register or sign in." });
      return;
    }

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "File size exceeds maximum allowed limit of 5MB." });
      return;
    }

    const validExtensions = ["pdf", "jpg", "jpeg", "png"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setToast({ type: "error", message: "Invalid file format. Only PDF, JPG, and PNG files are allowed." });
      return;
    }

    setUploadingType(docType);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", docType);
    if (currentUser?.userId || currentUser?.id) {
      formData.append("userId", currentUser.userId || currentUser.id);
    }

    try {
      await api.post("/documents/upload", formData);
      setToast({ message: `${docType} uploaded successfully!` });
      fetchDocuments();
    } catch (err) {
      setToast({ type: "error", message: `Upload failed: ${errorMessage(err)}` });
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (docId, docType) => {
    if (!window.confirm(`Are you sure you want to delete your ${docType}?`)) return;
    setDeletingId(docId);
    try {
      const currentUser = getUser();
      const userIdParam = (currentUser?.userId || currentUser?.id) ? `?userId=${currentUser.userId || currentUser.id}` : "";
      await api.delete(`/documents/${docId}${userIdParam}`);
      setToast({ message: `${docType} deleted successfully!` });
      fetchDocuments();
    } catch (err) {
      setToast({ message: `Delete failed: ${errorMessage(err)}` });
    } finally {
      setDeletingId(null);
    }
  };

  const getDocForType = (type) => {
    return userDocs.find(
      (d) => d.documentType && d.documentType.toLowerCase() === type.toLowerCase()
    );
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http")) return filePath;
    const parentApiHost = import.meta.env.VITE_PARENT_API_URL
      ? import.meta.env.VITE_PARENT_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:8082";
    return `${parentApiHost}/${filePath.startsWith("/") ? filePath.slice(1) : filePath}`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="Required Documents"
        description="Upload clear PDF, JPG, or PNG copies (max 5MB each). Admin verification starts after submission."
      />

      {!isRegisteredParent && (
        <Card style={{ marginBottom: "1.5rem", borderLeft: "4px solid #ef4444", background: "#fef2f2" }}>
          <h4 style={{ margin: 0, color: "#991b1b" }}>Registration Required</h4>
          <p style={{ margin: "0.25rem 0 0.75rem 0", color: "#b91c1c", fontSize: "0.9rem" }}>
            Only registered parent candidates can upload and manage documents. Please register a parent account or log in to continue.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button onClick={() => nav("/parent/register")}>Register Parent Account</Button>
            <Button variant="secondary" onClick={() => nav("/login")}>Sign In</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Loading label="Loading documents..." />
      ) : (
        <div className="document-grid">
          {REQUIRED_DOCUMENTS.map((reqDoc) => {
            const uploaded = getDocForType(reqDoc.type);
            const isUploading = uploadingType === reqDoc.type;
            const isDeleting = uploaded && deletingId === uploaded.documentId;

            return (
              <Card key={reqDoc.type} className="document-card">
                <div className="document-icon">
                  <FileText />
                </div>
                <div>
                  <h3>{reqDoc.name}</h3>
                  <p>{uploaded ? uploaded.fileName : reqDoc.description}</p>
                  <Status value={uploaded ? uploaded.verificationStatus : "NOT_UPLOADED"} />
                  {uploaded?.uploadedAt && (
                    <small style={{ display: "block", marginTop: "0.25rem", color: "#6b7280" }}>
                      Uploaded on {fmt(uploaded.uploadedAt)}
                    </small>
                  )}
                </div>

                <div className="document-actions" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {uploaded && (
                    <>
                      <a
                        href={getFileUrl(uploaded.filePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn secondary square"
                        title="View / Download Document"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {uploaded.verificationStatus !== "VERIFIED" && (
                        <button
                          type="button"
                          className="btn secondary square danger"
                          onClick={() => handleDelete(uploaded.documentId, reqDoc.name)}
                          disabled={isDeleting}
                          title="Delete Document"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </>
                  )}

                  {(!uploaded || uploaded.verificationStatus !== "VERIFIED") && (
                    <label className={`btn ${uploaded ? "secondary" : "primary"} file-button`}>
                      <Upload size={15} /> {isUploading ? "Uploading..." : uploaded ? "Re-upload" : "Upload"}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isUploading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUpload(reqDoc.type, e.target.files[0]);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export function ParentChildren() {
  const nav = useNavigate();
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

  const apply = async (c) => {
    const user = getUser();
    if (!user || user.role !== "PARENT") {
      setToast({ type: "error", message: "Only registered parent candidates can submit adoption requests. Please sign in or create an account." });
      return;
    }

    try {
      const payload = {
        userId: user.userId || user.id,
        childId: c.childId,
      };
      const res = await api.post("/adoption-requests", payload);
      const data = res.data?.data || res.data;
      setToast({ message: data?.message || `Adoption request submitted successfully for ${c.name || c.firstName}!` });
      fetchChildren();
    } catch (err) {
      setToast({ type: "error", message: errorMessage(err) });
    }
  };

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
                    <button onClick={() => nav(`/parent/children/${c.childId}`)}>
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
  const nav = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const fetchMyRequests = useCallback(async () => {
    setLoading(true);
    try {
      const user = getUser();
      const userIdParam = (user?.userId || user?.id) ? `?userId=${user.userId || user.id}` : "";
      const res = await api.get(`/adoption-requests/my${userIdParam}`);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.warn("Failed to fetch adoption requests:", errorMessage(err));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const viewTracking = async (requestId) => {
    nav(`/parent/track-application/${requestId}`);
  };

  const TRACKING_STEPS = ["PENDING", "UNDER_REVIEW", "HOME_VISIT", "APPROVED", "COMPLETED"];

  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title="Track Application"
        description="View step-by-step status updates, home visit details, and decision timeline for your adoption requests."
      />

      {loading ? (
        <Loading label="Loading applications..." />
      ) : requests.length === 0 ? (
        <Card>
          <div className="empty">
            <ClipboardList size={44} />
            <h3>No adoption applications found</h3>
            <p>You haven't submitted any adoption applications yet. Browse available children to apply.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {requests.map((req) => (
            <Card key={req.requestId}>
              <div className="application-detail-head">
                <div>
                  <span>Application number</span>
                  <b>{req.applicationNumber}</b>
                </div>
                <Status value={req.status} />
              </div>

              <div className="journey-timeline">
                {TRACKING_STEPS.map((s, i) => {
                  const statusOrder = req.status === "REJECTED"
                    ? ["PENDING", "UNDER_REVIEW", "HOME_VISIT", "REJECTED"]
                    : TRACKING_STEPS;
                  const currentIndex = statusOrder.indexOf(req.status);
                  const stepIndex = statusOrder.indexOf(s);
                  const isDone = stepIndex !== -1 && stepIndex <= currentIndex;
                  const isCurrent = req.status === s;

                  return (
                    <div className={isDone ? "done" : isCurrent ? "current" : ""} key={s}>
                      <i>{isDone ? "✓" : i + 1}</i>
                      <span>{s === "REJECTED" ? "REJECTED" : s.replaceAll("_", " ")}</span>
                    </div>
                  );
                })}
              </div>

              <div className="detail-grid">
                <div>
                  <span>Child name</span>
                  <b>{req.childName}</b>
                </div>
                <div>
                  <span>Applied date</span>
                  <b>{fmt(req.requestDate)}</b>
                </div>
                <div>
                  <span>Status</span>
                  <Status value={req.status} />
                </div>
              </div>

              <div className="modal-actions left" style={{ marginTop: "1rem" }}>
                <Button onClick={() => viewTracking(req.requestId)}>
                  <Eye size={15} /> Track Detailed Timeline
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!trackingData}
        onClose={() => setTrackingData(null)}
        title={`Application Tracking (${trackingData?.applicationNumber || ''})`}
        wide
      >
        {trackingData && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div className="detail-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <span>Application Number</span>
                <b>{trackingData.applicationNumber}</b>
              </div>
              <div>
                <span>Child Name</span>
                <b>{trackingData.childName}</b>
              </div>
              <div>
                <span>Current Status</span>
                <Status value={trackingData.status} />
              </div>
            </div>

            {/* Detailed Timeline Steps with Updated Dates */}
            <div style={{ marginTop: "0.5rem" }}>
              <h4 style={{ marginBottom: "0.75rem" }}>Timeline Updates</h4>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {trackingData.timeline?.map((step) => (
                  <div
                    key={step.stepKey}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      background: step.current ? "#eff6ff" : step.completed ? "#f9fafb" : "#ffffff",
                      border: step.current ? "1px solid #3b82f6" : "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: step.completed ? "#10b981" : step.current ? "#3b82f6" : "#e5e7eb",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {step.completed ? "✓" : "•"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ color: step.current ? "#1d4ed8" : "#111827" }}>{step.label}</strong>
                        {step.updatedAt && (
                          <small style={{ color: "#6b7280" }}>Updated: {fmt(step.updatedAt)}</small>
                        )}
                      </div>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#4b5563" }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Home Visit Section if present */}
            {trackingData.socialWorkerName && (
              <div className="info-banner card" style={{ marginTop: "0.5rem" }}>
                <strong>Home Visit Assessment Details</strong>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
                  Assigned Worker: <b>{trackingData.socialWorkerName}</b>
                  {trackingData.visitDate && <> · Date: <b>{fmt(trackingData.visitDate)}</b></>}
                  {trackingData.visitTime && <> · Time: <b>{trackingData.visitTime}</b></>}
                  {trackingData.visitStatus && <> · Status: <b>{trackingData.visitStatus}</b></>}
                </p>
              </div>
            )}

            {/* Admin Remark */}
            {trackingData.adminRemark && (
              <div className="info-banner card" style={{ background: "#fffbe6", borderColor: "#ffe58f" }}>
                <strong>Admin Remark</strong>
                <p style={{ margin: "0.25rem 0 0 0" }}>{trackingData.adminRemark}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
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

export function ParentChildDetails() {
  const { childId } = useParams();
  const nav = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchChildDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/children/${childId}`);
      const data = res.data?.data || res.data;
      if (data) {
        setChild(data);
      } else {
        setError("Child details not found.");
      }
    } catch (err) {
      console.warn("Error fetching child details, checking fallback data:", err);
      const found = initialChildren.find((c) => String(c.childId) === String(childId));
      if (found) {
        setChild(found);
      } else {
        setError(errorMessage(err) || "Failed to load child details.");
      }
    } finally {
      setLoading(false);
    }
  }, [childId]);

  React.useEffect(() => {
    fetchChildDetails();
  }, [fetchChildDetails]);

  const apply = async (c) => {
    const user = getUser();
    if (!user || user.role !== "PARENT") {
      setToast({ type: "error", message: "Only registered parent candidates can submit adoption requests." });
      return;
    }
    try {
      const payload = {
        userId: user.userId || user.id,
        childId: c.childId,
      };
      const res = await api.post("/adoption-requests", payload);
      const data = res.data?.data || res.data;
      setToast({ message: data?.message || `Adoption request submitted successfully for ${c.name || c.firstName}!` });
    } catch (err) {
      setToast({ type: "error", message: errorMessage(err) });
    }
  };

  if (loading) {
    return <Loading label="Loading child details..." />;
  }

  if (error || !child) {
    return (
      <Card>
        <div className="empty">
          <Baby size={44} />
          <h3>Child Not Found</h3>
          <p>{error || "Unable to retrieve child information."}</p>
          <Button onClick={() => nav("/parent/children")}>Back to Available Children</Button>
        </div>
      </Card>
    );
  }

  const childName = child.name || `${child.firstName || ''} ${child.lastName || ''}`.trim();
  const photo = child.image || child.profilePhoto || "https://images.unsplash.com/photo-1595454223600-91fbddbbf255?auto=format&fit=crop&w=600&q=80";

  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title={childName}
        description="Detailed profile and background information for adoption request."
      />
      <div style={{ marginBottom: "1rem" }}>
        <Button variant="secondary" onClick={() => nav("/parent/children")}>
          ← Back to Available Children
        </Button>
      </div>

      <Card>
        <div className="child-detail-hero" style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--line)" }}>
          <img
            src={photo}
            alt={childName}
            style={{ width: "160px", height: "160px", objectFit: "cover", borderRadius: "16px" }}
          />
          <div>
            <h2 style={{ fontSize: "1.75rem", margin: "0 0 0.5rem 0" }}>{childName}</h2>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <Status value={child.status || "AVAILABLE"} />
              {child.specialNeeds && <Status value="Special Needs" />}
            </div>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Gender: <b>{child.gender || 'N/A'}</b> · Age: <b>{child.age != null ? `${child.age} years` : 'N/A'}</b>
            </p>
          </div>
        </div>

        <h3 style={{ marginBottom: "1rem" }}>Complete Child Information</h3>
        <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <div>
            <span>Photo / Avatar</span>
            <b>{photo ? "Available" : "N/A"}</b>
          </div>
          <div>
            <span>Full Name</span>
            <b>{childName}</b>
          </div>
          <div>
            <span>Age</span>
            <b>{child.age != null ? `${child.age} years` : 'N/A'}</b>
          </div>
          <div>
            <span>Gender</span>
            <b>{child.gender || 'N/A'}</b>
          </div>
          <div>
            <span>Blood Group</span>
            <b>{child.bloodGroup || 'N/A'}</b>
          </div>
          <div>
            <span>Date of Birth</span>
            <b>{child.dob ? fmt(child.dob) : 'N/A'}</b>
          </div>
          <div>
            <span>Education</span>
            <b>{child.education || 'Primary Education'}</b>
          </div>
          <div>
            <span>Medical Condition</span>
            <b>{child.medicalSummary || child.medicalNotes || 'Healthy / Good condition'}</b>
          </div>
          <div>
            <span>Hobbies</span>
            <b>{child.hobbies || 'Drawing, Music'}</b>
          </div>
          <div>
            <span>Special Needs</span>
            <b>{child.specialNeeds ? "Yes (Requires special care)" : "No"}</b>
          </div>
          <div>
            <span>Availability Status</span>
            <b>{child.status || "AVAILABLE"}</b>
          </div>
        </div>

        {child.description && (
          <div style={{ marginBottom: "1.5rem" }}>
            <span>Description</span>
            <div className="description-box" style={{ marginTop: "0.5rem" }}>
              {child.description}
            </div>
          </div>
        )}

        <div className="modal-actions left" style={{ marginTop: "1rem" }}>
          <Button onClick={() => apply(child)}>
            <ClipboardList size={16} /> Submit Adoption Application
          </Button>
          <Button variant="secondary" onClick={() => nav("/parent/children")}>
            Back to Available Children
          </Button>
        </div>
      </Card>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export function ParentTrackApplication() {
  const { applicationId } = useParams();
  const nav = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTracking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/adoption-requests/status/${applicationId}`);
      const data = res.data?.data || res.data;
      if (data) {
        setTrackingData(data);
      } else {
        setError("Application tracking data not found.");
      }
    } catch (err) {
      console.warn("Failed to fetch status tracking by ID, trying details endpoint:", err);
      try {
        const resDetails = await api.get(`/adoption-requests/${applicationId}`);
        const dataDetails = resDetails.data?.data || resDetails.data;
        if (dataDetails) {
          setTrackingData(dataDetails);
        } else {
          setError(errorMessage(err) || "Failed to load application details.");
        }
      } catch (err2) {
        setError(errorMessage(err2) || "Failed to load tracking data.");
      }
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  React.useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const TRACKING_STEPS = ["PENDING", "UNDER_REVIEW", "HOME_VISIT", "APPROVED", "COMPLETED"];

  if (loading) {
    return <Loading label="Loading application tracking details..." />;
  }

  if (error || !trackingData) {
    return (
      <Card>
        <div className="empty">
          <ClipboardList size={44} />
          <h3>Application Not Found</h3>
          <p>{error || "Unable to retrieve tracking information."}</p>
          <Button onClick={() => nav("/parent/applications")}>Back to Applications</Button>
        </div>
      </Card>
    );
  }

  const currentStatus = trackingData.status || "PENDING";
  const isRejected = currentStatus === "REJECTED";

  return (
    <>
      <PageHeader
        eyebrow="Parent portal"
        title={`Application Tracking: ${trackingData.applicationNumber || applicationId}`}
        description="Step-by-step progress tracking, live timeline, and home visit assessment status."
      />
      <div style={{ marginBottom: "1rem" }}>
        <Button variant="secondary" onClick={() => nav("/parent/applications")}>
          ← Back to My Applications
        </Button>
      </div>

      <Card>
        <div className="card-title">
          <div>
            <span className="eyebrow">Application Number</span>
            <h2>{trackingData.applicationNumber || `APP-${applicationId}`}</h2>
          </div>
          <Status value={currentStatus} />
        </div>

        <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", margin: "1.25rem 0" }}>
          <div>
            <span>Application Number</span>
            <b>{trackingData.applicationNumber || applicationId}</b>
          </div>
          <div>
            <span>Child Name</span>
            <b>{trackingData.childName || "N/A"}</b>
          </div>
          <div>
            <span>Applied Date</span>
            <b>{fmt(trackingData.requestDate || trackingData.appliedDate)}</b>
          </div>
          <div>
            <span>Current Status</span>
            <b><Status value={currentStatus} /></b>
          </div>
          {trackingData.socialWorkerName && (
            <div>
              <span>Assigned Social Worker</span>
              <b>{trackingData.socialWorkerName}</b>
            </div>
          )}
          {trackingData.visitDate && (
            <div>
              <span>Home Visit Date</span>
              <b>{fmt(trackingData.visitDate)} {trackingData.visitTime ? `at ${trackingData.visitTime}` : ""}</b>
            </div>
          )}
        </div>

        {/* Live Timeline Display */}
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Application Progress Timeline</h3>
          <div className="journey-timeline">
            {(isRejected ? ["PENDING", "UNDER_REVIEW", "HOME_VISIT", "REJECTED"] : TRACKING_STEPS).map((s, i) => {
              const statusOrder = isRejected
                ? ["PENDING", "UNDER_REVIEW", "HOME_VISIT", "REJECTED"]
                : TRACKING_STEPS;
              const currentIndex = statusOrder.indexOf(currentStatus);
              const stepIndex = statusOrder.indexOf(s);
              const isDone = stepIndex !== -1 && stepIndex <= currentIndex;
              const isCurrent = currentStatus === s;

              return (
                <div className={isDone ? "done" : isCurrent ? "current" : ""} key={s}>
                  <i>{isDone ? "✓" : i + 1}</i>
                  <span>{s === "REJECTED" ? "REJECTED" : s.replaceAll("_", " ")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Stage Log if available */}
        {trackingData.timeline && trackingData.timeline.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ marginBottom: "0.75rem" }}>Detailed Stage Log</h4>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {trackingData.timeline.map((step) => (
                <div
                  key={step.stepKey}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: step.current ? "#eff6ff" : step.completed ? "#f9fafb" : "#ffffff",
                    border: step.current ? "1px solid #3b82f6" : "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: step.completed ? "#10b981" : step.current ? "#3b82f6" : "#e5e7eb",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    {step.completed ? "✓" : "•"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: step.current ? "#1d4ed8" : "#111827" }}>{step.label}</strong>
                      {step.updatedAt && (
                        <small style={{ color: "#6b7280" }}>Updated: {fmt(step.updatedAt)}</small>
                      )}
                    </div>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#4b5563" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Home Visit Assessment Details banner if available */}
        {trackingData.socialWorkerName && (
          <div className="info-banner card" style={{ marginTop: "1.5rem" }}>
            <strong>Home Visit Assessment Details</strong>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
              Assigned Worker: <b>{trackingData.socialWorkerName}</b>
              {trackingData.visitDate && <> · Date: <b>{fmt(trackingData.visitDate)}</b></>}
              {trackingData.visitTime && <> · Time: <b>{trackingData.visitTime}</b></>}
              {trackingData.visitStatus && <> · Status: <b>{trackingData.visitStatus}</b></>}
            </p>
          </div>
        )}

        {/* Admin Remark if available */}
        {trackingData.adminRemark && (
          <div className="info-banner card" style={{ background: "#fffbe6", borderColor: "#ffe58f", marginTop: "1rem" }}>
            <strong>Admin Remark</strong>
            <p style={{ margin: "0.25rem 0 0 0" }}>{trackingData.adminRemark}</p>
          </div>
        )}

        <div className="modal-actions left" style={{ marginTop: "1.5rem" }}>
          <Button variant="secondary" onClick={() => nav("/parent/applications")}>
            Back to Applications
          </Button>
        </div>
      </Card>
    </>
  );
}
