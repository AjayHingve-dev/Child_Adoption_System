import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { api, errorMessage } from "../api";
import {
  PageHeader,
  Card,
  SearchBox,
  Status,
  Loading,
  Empty,
  Modal,
  Button,
  Field,
  SelectField,
  Toast,
} from "../components/UI";
const blank = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  district: "",
  area: "",
  status: "ACTIVE",
};
export default function SocialWorkers() {
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState(""),
    [form, setForm] = useState(blank),
    [open, setOpen] = useState(false),
    [editId, setEditId] = useState(null),
    [toast, setToast] = useState(null);
  const load = () =>
    api
      .get("/social-workers", { params: { search: search || undefined } })
      .then((r) => setRows(r.data))
      .catch((e) => setToast({ type: "error", message: errorMessage(e) }))
      .finally(() => setLoading(false));
  useEffect(load, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      editId
        ? await api.put(`/social-workers/${editId}`, {
            firstName: form.firstName,
            lastName: form.lastName,
            district: form.district,
            area: form.area,
            status: form.status,
          })
        : await api.post("/social-workers", form);
      setOpen(false);
      setToast({ message: "Social worker saved" });
      load();
    } catch (e) {
      setToast({ type: "error", message: errorMessage(e) });
    }
  };
  return (
    <>
      <PageHeader
        title="Social workers"
        description="Manage the professionals who support family assessments and home visits."
        actions={
          <Button
            onClick={() => {
              setForm(blank);
              setEditId(null);
              setOpen(true);
            }}
          >
            <Plus /> Add worker
          </Button>
        }
      />
      <Card>
        <div className="table-tools">
          <SearchBox value={search} onChange={setSearch} />
          <Button variant="secondary" onClick={load}>
            Search
          </Button>
        </div>
        {loading ? (
          <Loading />
        ) : rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Code</th>
                  <th>Contact</th>
                  <th>Coverage</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.socialWorkerId}>
                    <td>
                      <div className="person">
                        <div className="avatar">{r.firstName[0]}</div>
                        <b>
                          {r.firstName} {r.lastName}
                        </b>
                      </div>
                    </td>
                    <td>{r.socialWorkerCode}</td>
                    <td>
                      {r.email}
                      <small>{r.phone}</small>
                    </td>
                    <td>
                      {r.district || "—"}
                      <small>{r.area}</small>
                    </td>
                    <td>
                      <Status value={r.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          onClick={() => {
                            setForm({ ...r, password: "" });
                            setEditId(r.socialWorkerId);
                            setOpen(true);
                          }}
                        >
                          <Edit3 />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("Delete worker?")) {
                              await api.delete(
                                `/social-workers/${r.socialWorkerId}`,
                              );
                              load();
                            }
                          }}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit social worker" : "Add social worker"}
      >
        <form onSubmit={save}>
          <div className="form-grid">
            <Field
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Field
              label="Last name"
              value={form.lastName || ""}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            {!editId && (
              <>
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </>
            )}
            <Field
              label="District"
              value={form.district || ""}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
            <Field
              label="Area"
              value={form.area || ""}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
            {editId && (
              <SelectField
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </SelectField>
            )}
          </div>
          <div className="modal-actions">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button>Save</Button>
          </div>
        </form>
      </Modal>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
