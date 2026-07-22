import React,{useEffect,useState} from 'react';
import {UserRound,Save,KeyRound} from 'lucide-react';
import {api,errorMessage} from '../api';
import {clearSession,saveUserProfile} from '../auth';
import {useNavigate} from 'react-router-dom';

export default function Profile(){
  const nav=useNavigate();
  const [profile,setProfile]=useState(null);
  const [edit,setEdit]=useState({firstName:'',lastName:'',phone:''});
  const [password,setPassword]=useState({currentPassword:'',newPassword:'',confirmPassword:''});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [changing,setChanging]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  useEffect(()=>{(async()=>{try{const {data}=await api.get('/admins/me');setProfile(data);setEdit({firstName:data.firstName||'',lastName:data.lastName||'',phone:data.phone||''});}catch(e){setError(errorMessage(e));}finally{setLoading(false);}})();},[]);

  const updateProfile=async e=>{e.preventDefault();setSaving(true);setError('');setMessage('');try{const {data}=await api.put('/admins/me',{firstName:edit.firstName,lastName:edit.lastName||null,phone:edit.phone||null});setProfile(data);saveUserProfile(data);setMessage('Profile updated successfully.');}catch(e){setError(errorMessage(e));}finally{setSaving(false);}};
  const changePassword=async e=>{e.preventDefault();setError('');setMessage('');if(password.newPassword!==password.confirmPassword){setError('New password and confirm password do not match.');return;}setChanging(true);try{const {data}=await api.put('/admins/me/password',{currentPassword:password.currentPassword,newPassword:password.newPassword});setMessage(data.message||'Password changed successfully.');clearSession();setTimeout(()=>nav('/login',{replace:true}),800);}catch(e){setError(errorMessage(e));}finally{setChanging(false);}};

  if(loading)return <div className="page-card">Loading profile...</div>;
  return <div><div className="page-heading"><div><span className="eyebrow">Admin account</span><h1>My Profile</h1><p>View and update your administrator details or change your password.</p></div></div>{error&&<div className="form-error">{String(error)}</div>}{message&&<div className="form-success">{message}</div>}<div className="profile-grid"><section className="page-card"><div className="section-title"><UserRound/><div><h2>Profile details</h2><p>Email and role are managed by the system.</p></div></div><form onSubmit={updateProfile} className="stack-form"><div className="form-grid"><label className="field"><span>First name *</span><input value={edit.firstName} onChange={e=>setEdit({...edit,firstName:e.target.value})} required/></label><label className="field"><span>Last name</span><input value={edit.lastName} onChange={e=>setEdit({...edit,lastName:e.target.value})}/></label><label className="field full"><span>Email</span><input value={profile?.email||''} disabled/></label><label className="field"><span>Phone</span><input inputMode="numeric" maxLength="15" value={edit.phone} onChange={e=>setEdit({...edit,phone:e.target.value.replace(/\D/g,'')})}/></label><label className="field"><span>Role</span><input value={profile?.role||''} disabled/></label><label className="field"><span>Status</span><input value={profile?.status||''} disabled/></label></div><button className="btn primary" disabled={saving}>{saving?'Saving...':<><Save/> Save profile</>}</button></form></section><section className="page-card"><div className="section-title"><KeyRound/><div><h2>Change password</h2><p>You will need to sign in again after changing it.</p></div></div><form onSubmit={changePassword} className="stack-form"><label className="field"><span>Current password *</span><input type="password" value={password.currentPassword} onChange={e=>setPassword({...password,currentPassword:e.target.value})} required/></label><label className="field"><span>New password *</span><input type="password" minLength="8" value={password.newPassword} onChange={e=>setPassword({...password,newPassword:e.target.value})} required/></label><label className="field"><span>Confirm new password *</span><input type="password" minLength="8" value={password.confirmPassword} onChange={e=>setPassword({...password,confirmPassword:e.target.value})} required/></label><p className="password-hint">At least 8 characters with uppercase, lowercase, number, and special character.</p><button className="btn primary" disabled={changing}>{changing?'Changing...':<><KeyRound/> Change password</>}</button></form></section></div></div>;
}
