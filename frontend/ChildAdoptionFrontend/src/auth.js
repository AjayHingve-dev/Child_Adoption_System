export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export const saveSession = (data) => {
  localStorage.setItem('token', data.token || 'demo-jwt-token');
  localStorage.setItem(
    'user',
    JSON.stringify({
      fullName: data.fullName || 'User',
      email: data.email || 'user@aashray.org',
      role: data.role || 'ADMIN',
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
      fullName: fullName || current.fullName,
      email: data.email || current.email,
      role: data.role || current.role,
    })
  );
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!localStorage.getItem('token') && !!getUser();

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
