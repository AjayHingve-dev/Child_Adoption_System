import React from 'react';
import {Navigate,Route,Routes} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';import Register from './pages/Register';import Dashboard from './pages/Dashboard';import Parents from './pages/Parents';import Children from './pages/Children';import Applications from './pages/Applications';import HomeVisits from './pages/HomeVisits';import SocialWorkers from './pages/SocialWorkers';import Admins from './pages/Admins';import Reports from './pages/Reports';import Settings from './pages/Settings';import Profile from './pages/Profile';
import {isAdminSession} from './auth';
const Protected=({children})=>isAdminSession()?<Layout>{children}</Layout>:<Navigate to="/login" replace/>;
export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/" element={<Navigate to="/dashboard" replace/>}/>{[['dashboard',<Dashboard/>],['profile',<Profile/>],['parents',<Parents/>],['children',<Children/>],['applications',<Applications/>],['home-visits',<HomeVisits/>],['social-workers',<SocialWorkers/>],['admins',<Admins/>],['reports',<Reports/>],['settings',<Settings/>]].map(([p,e])=><Route key={p} path={`/${p}`} element={<Protected>{e}</Protected>}/>) }<Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>}
