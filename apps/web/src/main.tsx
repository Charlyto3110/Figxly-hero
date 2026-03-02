import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './index.css';
import { Layout } from './components/Layout';
import { api } from './lib/api';

function Landing() {
  return <section className="rounded-3xl bg-white p-10 shadow-soft"><h1 className="text-5xl font-bold text-slateInk">El talento que necesitas, a tu servicio</h1><p className="mt-4 text-slateInk">Conservamos el hero Figxly y lo conectamos con el MVP.</p><Link to="/explorar" className="btn-coral inline-block mt-6">Buscar servicios</Link></section>;
}

function Explorar() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api('/providers').then(setItems).catch(() => setItems([])); }, []);
  return <div><h2 className="text-3xl font-semibold mb-4">Explorar servicios</h2><div className="grid md:grid-cols-3 gap-4">{items.map((p) => <Link key={p.id} to={`/servicio/${p.id}`} className="card"><div className="h-24 rounded-2xl bg-gradient-to-r from-haze2 to-white" /><h3 className="font-semibold mt-3">{p.user?.name}</h3><p>{p.city}</p></Link>)}</div></div>;
}

function Servicio() {
  const { id } = useParams(); const [p, setP] = useState<any>(); const [date, setDate] = useState('');
  useEffect(() => { api(`/providers/${id}`).then(setP); }, [id]);
  const book = async () => { await api('/bookings', { method: 'POST', body: JSON.stringify({ providerId: p.userId, categoryId: p.services[0]?.categoryId, date, duration: 60, city: p.city, notes: 'MVP booking' }) }); alert('Agendado'); };
  if (!p) return null;
  return <div className="card"><h2 className="text-2xl font-semibold">{p.user.name}</h2><p>{p.bio}</p><input aria-label="Fecha" className="input mt-3" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /><button className="btn-primary mt-3" onClick={book}>Agendar cita</button></div>;
}

function Login() { const nav = useNavigate(); const [email,setEmail]=useState('cliente@figxly.com'); const [password,setPassword]=useState('secret123');
return <div className="card max-w-md"><h2>Login</h2><input className="input mt-2" value={email} onChange={e=>setEmail(e.target.value)} /><input className="input mt-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><button className="btn-primary mt-3" onClick={async()=>{await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})}); nav('/perfil');}}>Entrar</button></div>; }

const Stub = ({ title }: { title: string }) => <div className="card"><h2 className="text-2xl">{title}</h2></div>;

function App() {
  return <BrowserRouter><Layout><Routes><Route path="/" element={<Landing />} /><Route path="/landing" element={<Landing />} /><Route path="/explorar" element={<Explorar />} /><Route path="/servicio/:id" element={<Servicio />} /><Route path="/login" element={<Login />} /><Route path="/registro" element={<Stub title="Registro" />} /><Route path="/perfil" element={<Stub title="Perfil cliente" />} /><Route path="/panel-tecnico" element={<Stub title="Panel técnico" />} /><Route path="/admin" element={<Stub title="Admin" />} /><Route path="/ayuda" element={<Stub title="FAQ + soporte" />} /></Routes></Layout></BrowserRouter>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
