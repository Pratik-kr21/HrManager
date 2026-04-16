import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async (res) => {
        try {
            const payload = JSON.parse(atob(res.credential.split('.')[1]));
            const r = await api.post('/auth/google', { googleId: payload.sub, email: payload.email, name: payload.name });
            login(r.data);
            navigate('/');
        } catch { setError('Google sign-in failed. Please try again.'); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* ── Left Panel ── */}
            <div style={{
                width: '42%', minWidth: '340px',
                background: 'var(--forest)',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '48px 52px',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
                <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
                <div style={{ position:'absolute', top:'40%', right:'20px', width:'140px', height:'140px', borderRadius:'50%', background:'rgba(245,158,11,0.08)' }} />

                {/* Logo */}
                <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#fff', letterSpacing:'-0.04em' }}>
                        OneClick<span style={{ color:'var(--amber-light)' }}>.</span>
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.45)', marginTop:'4px', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:500 }}>
                        HR Intelligence Platform
                    </div>
                </div>

                {/* Quote */}
                <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ width:'40px', height:'3px', background:'var(--amber)', borderRadius:'2px', marginBottom:'20px' }} />
                    <blockquote style={{ fontSize:'1.25rem', fontWeight:600, color:'#fff', lineHeight:1.5, letterSpacing:'-0.01em', marginBottom:'16px' }}>
                        "Modern HR for the meticulous executive."
                    </blockquote>
                    <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
                        Complexity is the enemy of execution. We design for clarity, speed, and the power of a single decision.
                    </p>
                </div>

                {/* Footer */}
                <div style={{ position:'relative', zIndex:1, fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>
                    © {new Date().getFullYear()} OneClick Inc. All rights reserved.
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div style={{ flex:1, background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px' }}>
                <div style={{ width:'100%', maxWidth:'400px' }}>
                    <h1 style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--charcoal)', letterSpacing:'-0.03em', marginBottom:'6px' }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize:'0.88rem', color:'var(--stone-500)', marginBottom:'32px' }}>
                        Enter your credentials to access your workspace.
                    </p>

                    {error && (
                        <div style={{ background:'var(--danger-bg)', color:'var(--danger)', padding:'11px 14px', borderRadius:'var(--r-md)', fontSize:'0.85rem', fontWeight:500, marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
                            ⚠ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                        <div>
                            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--stone-700)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Email</label>
                            <input
                                type="email" className="input" placeholder="you@company.com"
                                value={email} onChange={e => setEmail(e.target.value)} required
                            />
                        </div>

                        <div>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                                <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--stone-700)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Password</label>
                            </div>
                            <div style={{ position:'relative' }}>
                                <input
                                    type={showPw ? 'text' : 'password'} className="input" placeholder="••••••••"
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                    style={{ paddingRight:'44px' }}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--stone-500)', display:'flex', padding:'2px' }}>
                                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', marginTop:'4px' }}>
                            {loading
                                ? <span className="spin" style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%' }} />
                                : 'Sign In'
                            }
                        </button>
                    </form>

                    <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'24px 0' }}>
                        <div style={{ flex:1, height:'1px', background:'var(--stone-200)' }} />
                        <span style={{ fontSize:'0.75rem', color:'var(--stone-500)', fontWeight:500, whiteSpace:'nowrap' }}>or continue with</span>
                        <div style={{ flex:1, height:'1px', background:'var(--stone-200)' }} />
                    </div>

                    <div style={{ display:'flex', justifyContent:'center' }}>
                        <GoogleLogin onSuccess={handleGoogle} onError={() => setError('Google sign-in failed')} />
                    </div>

                    <p style={{ textAlign:'center', marginTop:'28px', fontSize:'0.85rem', color:'var(--stone-500)' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color:'var(--forest)', fontWeight:700 }}>Sign up for OneClick →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
