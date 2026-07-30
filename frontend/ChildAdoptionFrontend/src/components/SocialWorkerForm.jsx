import React, { useState, useEffect, useMemo } from 'react';

export default function SocialWorkerForm({
  show,
  onClose,
  onSave,
  editWorker = null, // null for Add mode, worker object for Edit mode
  existingWorkers = [],
}) {
  const isEdit = Boolean(editWorker);

  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    district: '',
    area: '',
    password: '',
    confirmPassword: '',
    status: 'ACTIVE',
  };

  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form on editWorker change or modal show
  useEffect(() => {
    if (show) {
      if (editWorker) {
        setForm({
          firstName: editWorker.firstName || '',
          lastName: editWorker.lastName || '',
          email: editWorker.email || '',
          phone: editWorker.phone || '',
          district: editWorker.district || '',
          area: editWorker.area || '',
          password: '',
          confirmPassword: '',
          status: editWorker.status || 'ACTIVE',
        });
      } else {
        setForm(initialForm);
      }
      setTouched({});
    }
  }, [show, editWorker]);

  // Synchronous validation using useMemo (prevents infinite re-render loop)
  const errors = useMemo(() => {
    if (!show) return {};

    const newErrors = {};

    // First Name
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First Name is required.';
    }

    // Last Name
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last Name is required.';
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    } else {
      // Check duplicate email
      const isDuplicateEmail = (existingWorkers || []).some(
        (w) =>
          (!isEdit || String(w.id) !== String(editWorker?.id)) &&
          w.email &&
          w.email.toLowerCase() === form.email.trim().toLowerCase()
      );
      if (isDuplicateEmail) {
        newErrors.email = 'Email already exists. Use a unique email.';
      }
    }

    // Phone
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    } else {
      // Check duplicate phone
      const isDuplicatePhone = (existingWorkers || []).some(
        (w) =>
          (!isEdit || String(w.id) !== String(editWorker?.id)) &&
          w.phone &&
          w.phone.trim() === form.phone.trim()
      );
      if (isDuplicatePhone) {
        newErrors.phone = 'Phone number already exists. Use a unique phone.';
      }
    }

    // District
    if (!form.district.trim()) {
      newErrors.district = 'District is required.';
    }

    // Area
    if (!form.area.trim()) {
      newErrors.area = 'Area is required.';
    }

    // Password validation (Only for Add Mode)
    if (!isEdit) {
      const pass = form.password;
      if (!pass) {
        newErrors.password = 'Password is required.';
      } else {
        const passwordIssues = [];
        if (pass.length < 8) passwordIssues.push('Min 8 characters');
        if (!/[A-Z]/.test(pass)) passwordIssues.push('1 Uppercase letter');
        if (!/[a-z]/.test(pass)) passwordIssues.push('1 Lowercase letter');
        if (!/[0-9]/.test(pass)) passwordIssues.push('1 Number');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass))
          passwordIssues.push('1 Special character');

        if (passwordIssues.length > 0) {
          newErrors.password = `Password needs: ${passwordIssues.join(', ')}.`;
        }
      }

      // Confirm Password
      if (!form.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (form.confirmPassword !== form.password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return newErrors;
  }, [form, show, isEdit, editWorker, existingWorkers]);

  if (!show) return null;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    if (!isFormValid) return;

    try {
      setSubmitting(true);
      await onSave(form, isEdit);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white py-3">
            <h5 className="modal-title fw-bold">
              {isEdit ? 'Edit Social Worker' : 'Add New Social Worker'}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body p-4">
              <div className="row g-3">
                {/* First Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      touched.firstName && errors.firstName ? 'is-invalid' : ''
                    } ${touched.firstName && !errors.firstName ? 'is-valid' : ''}`}
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                  />
                  {touched.firstName && errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>

                {/* Last Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      touched.lastName && errors.lastName ? 'is-invalid' : ''
                    } ${touched.lastName && !errors.lastName ? 'is-valid' : ''}`}
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                  />
                  {touched.lastName && errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    disabled={isEdit}
                    className={`form-control ${
                      touched.email && errors.email ? 'is-invalid' : ''
                    } ${touched.email && !errors.email ? 'is-valid' : ''}`}
                    placeholder="example@aashray.org"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                  />
                  {touched.email && errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Phone (10 Digits) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    className={`form-control ${
                      touched.phone && errors.phone ? 'is-invalid' : ''
                    } ${touched.phone && !errors.phone ? 'is-valid' : ''}`}
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('phone')}
                  />
                  {touched.phone && errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>

                {/* District */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    District <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      touched.district && errors.district ? 'is-invalid' : ''
                    } ${touched.district && !errors.district ? 'is-valid' : ''}`}
                    placeholder="e.g. Mumbai"
                    value={form.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    onBlur={() => handleBlur('district')}
                  />
                  {touched.district && errors.district && (
                    <div className="invalid-feedback">{errors.district}</div>
                  )}
                </div>

                {/* Area */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Area <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      touched.area && errors.area ? 'is-invalid' : ''
                    } ${touched.area && !errors.area ? 'is-valid' : ''}`}
                    placeholder="e.g. Andheri West"
                    value={form.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    onBlur={() => handleBlur('area')}
                  />
                  {touched.area && errors.area && (
                    <div className="invalid-feedback">{errors.area}</div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select fw-semibold"
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                {/* Password Fields - Only for Add Mode */}
                {!isEdit && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${
                          touched.password && errors.password ? 'is-invalid' : ''
                        } ${touched.password && !errors.password ? 'is-valid' : ''}`}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                      />
                      {touched.password && errors.password ? (
                        <div className="invalid-feedback">{errors.password}</div>
                      ) : (
                        <div className="form-text text-muted small">
                          Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char.
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${
                          touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''
                        } ${
                          touched.confirmPassword && !errors.confirmPassword ? 'is-valid' : ''
                        }`}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                      />
                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="modal-footer bg-light py-3">
              <button
                type="button"
                className="btn btn-secondary px-4 fw-semibold"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 fw-bold"
                disabled={!isFormValid || submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save Worker'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
