import React,{useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {HeartHandshake,LockKeyhole,Mail,ArrowRight,Sparkles} from 'lucide-react';
import {api,errorMessage} from '../api';
import {saveSession} from '../auth';

export default function Login(){
  const nav=useNavigate();
  const [form,setForm]=useState({email:'',password:''});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const submit=async e=>{
    e.preventDefault();setLoading(true);setError('');
    try{const {data}=await api.post('/auth/login',form);saveSession(data);nav('/dashboard',{replace:true});}
    catch(e){setError(errorMessage(e));}
    finally{setLoading(false);}
  };
  return <div className="auth-page"><section className="auth-visual"><div className="glow one"/><div className="glow two"/><div className="visual-content"><div className="logo-large"><HeartHandshake/></div><span className="eyebrow light">A secure bridge to brighter futures</span><h1>Every child deserves a loving home.</h1><p>Manage adoption journeys with compassion, clarity, and confidence through one organized administration platform.</p><div className="feature-pills"><span><Sparkles/> Thoughtful workflows</span><span><LockKeyhole/> Secure records</span></div></div></section><section className="auth-panel"><div className="auth-box"><div className="mobile-brand"><HeartHandshake/><b>Aashray</b></div><span className="eyebrow">Administrator access</span><h2>Sign in to the admin portal</h2><p>Use your active administrator account.</p>{error&&<div className="form-error">{String(error)}</div>}<form onSubmit={submit}><label className="auth-field"><span>Email address</span><div><Mail/><input type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div></label><label className="auth-field"><span>Password</span><div><LockKeyhole/><input type="password" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div></label><button className="auth-submit" disabled={loading}>{loading?'Signing in...':<>Sign in <ArrowRight/></>}</button></form><div className="auth-link">Need an administrator account? <Link to="/register">Register admin</Link></div></div></section></div>;
}
