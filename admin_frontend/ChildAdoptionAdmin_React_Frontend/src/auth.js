export const getUser=()=>{try{return JSON.parse(localStorage.getItem('user'))}catch{return null}};
export const saveSession=(data)=>{
  localStorage.setItem('token',data.token);
  localStorage.setItem('user',JSON.stringify({fullName:data.fullName,email:data.email,role:data.role}));
};
export const saveUserProfile=(data)=>{
  const current=getUser()||{};
  const fullName=`${data.firstName||''} ${data.lastName||''}`.trim();
  localStorage.setItem('user',JSON.stringify({...current,fullName,email:data.email,role:data.role}));
};
export const clearSession=()=>{localStorage.removeItem('token');localStorage.removeItem('user')};
export const isAdminSession=()=>{const user=getUser();return !!localStorage.getItem('token')&&['ADMIN','SUPER_ADMIN'].includes(user?.role)};
