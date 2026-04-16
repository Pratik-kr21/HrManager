import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) return setError('Passwords do not match.');
        if (password.length < 6) return setError('Password must be at least 6 characters.');
        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            navigate('/verify-sent');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display:'flex', minHeight:'100vh' }}>
            {/* ── Left Panel ── */}
            <div style={{ width:'38%', minWidth:'320px', background:'var(--forest)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 44px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
                <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(245,158,11,0.07)' }} />

                <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff', letterSpacing:'-0.04em' }}>
                        OneClick<span style={{ color:'var(--amber-light)' }}>.</span>
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', marginTop:'4px', letterSpacing:'0.08em', textTransform:'uppercase' }}>HR Intelligence Platform</div>
                </div>

                <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ width:'32px', height:'3px', background:'var(--amber)', borderRadius:'2px', marginBottom:'16px' }} />
                    <p style={{ fontSize:'1.1rem', fontWeight:600, color:'#fff', lineHeight:1.5, marginBottom:'12px' }}>
                        Join thousands of HR teams who made the switch.
                    </p>
                    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'10px' }}>
                        {['Automated attendance tracking', 'Smart leave management', 'Real-time team analytics'].map(f => (
                            <li key={f} style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'0.83rem', color:'rgba(255,255,255,0.6)' }}>
                                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--amber)', flexShrink:0 }} />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ position:'relative', zIndex:1, fontSize:'0.7rem', color:'rgba(255,255,255,0.25)' }}>
                    © {new Date().getFullYear()} OneClick Inc.
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div style={{ flex:1, background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px' }}>
                <div style={{ width:'100%', maxWidth:'400px' }}>
                    <h1 style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--charcoal)', letterSpacing:'-0.03em', marginBottom:'6px' }}>
                        Create your account
                    </h1>
                    <p style={{ fontSize:'0.88rem', color:'var(--stone-500)', marginBottom:'32px' }}>
                        Get started with OneClick HR today.
                    </p>

                    {error && (
                        <div style={{ background:'var(--danger-bg)', color:'var(--danger)', padding:'11px 14px', borderRadius:'var(--r-md)', fontSize:'0.85rem', fontWeight:500, marginBottom:'20px' }}>
                            ⚠ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                        {[
                            { label:'Full Name', type:'text', placeholder:'Pratik Kumar', value:name, onChange:e=>setName(e.target.value) },
                            { label:'Email Address', type:'email', placeholder:'you@company.com', value:email, onChange:e=>setEmail(e.target.value) },
                        ].map(f => (
                            <div key={f.label}>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--stone-700)', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</label>
                                <input type={f.type} className="input" placeholder={f.placeholder} value={f.value} onChange={f.onChange} required />
                            </div>
                        ))}

                        <div>
                            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--stone-700)', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Set Password</label>
                            <div style={{ position:'relative' }}>
                                <input type={showPw?'text':'password'} className="input" placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required style={{ paddingRight:'44px' }} />
                                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--stone-500)', display:'flex', padding:'2px' }}>
                                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--stone-700)', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Confirm Password</label>
                            <input type="password" className="input" placeholder="Re-enter your password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', marginTop:'6px' }}>
                            {loading
                                ? <span className="spin" style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%' }} />
                                : 'Create Account →'
                            }
                        </button>
                    </form>

                    <p style={{ textAlign:'center', marginTop:'24px', fontSize:'0.85rem', color:'var(--stone-500)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color:'var(--forest)', fontWeight:700 }}>Sign in →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
