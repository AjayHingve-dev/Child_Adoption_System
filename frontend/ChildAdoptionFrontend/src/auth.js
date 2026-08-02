export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export const saveSession = (data) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
  } else {
    localStorage.setItem('token', 'demo-jwt-token');
  }

  const userId = data.userId || data.id || null;
  const firstName = data.firstName || '';
  const lastName = data.lastName || '';
  const fullName = data.fullName || `${firstName} ${lastName}`.trim() || 'Parent User';

  localStorage.setItem(
    'user',
    JSON.stringify({
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'PARENT',
    })
  );
};

export const saveUserProfile = (data) => {
  const current = getUser() || {};
  const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  localStorage.setItem(
    'user',
    JSON.stringify({
      ...current,
      ...data,
      fullName: fullName || current.fullName,
      email: data.email || current.email,
      role: data.role || current.role,
      profilePhoto: data.profilePhoto !== undefined ? data.profilePhoto : current.profilePhoto,
    })
  );
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getUser();
  return Boolean(
    token &&
    token !== 'null' &&
    token !== 'undefined' &&
    token.trim() !== '' &&
    user &&
    typeof user === 'object' &&
    user.role
  );
};

export const roleHome = (role) => {
  if (["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return "/dashboard";
  }

  if (role === "SOCIAL_WORKER") {
    return "/worker/dashboard";
  }

  return "/parent/dashboard";
};

export const isAdminSession = () => {
  const user = getUser();

  return (
    isAuthenticated() &&
    ["ADMIN", "SUPER_ADMIN"].includes(user?.role)
  );
};
