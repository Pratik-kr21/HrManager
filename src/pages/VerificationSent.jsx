import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const VerificationSent = () => (
    <div style={{ display:'flex', minHeight:'100vh' }}>
        {/* Left decorative strip */}
        <div style={{ width:'6px', background:'var(--forest)', flexShrink:0 }} />

        <div className="flex-center" style={{ flex:1, background:'var(--cream)', padding:'40px' }}>
            <div style={{ width:'100%', maxWidth:'420px', textAlign:'center' }}>
                {/* Icon */}
                <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                    <Mail size={32} color="var(--forest)" />
                </div>

                <h1 style={{ fontSize:'1.7rem', fontWeight:800, color:'var(--charcoal)', letterSpacing:'-0.02em', marginBottom:'10px' }}>
                    Check your inbox
                </h1>
                <p style={{ color:'var(--stone-500)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:'28px' }}>
                    We've sent a secure verification link to your email address. Click it to activate your OneClick account.
                </p>

                <div style={{ background:'var(--amber-pale)', border:'1px solid #FDE68A', borderRadius:'var(--r-md)', padding:'12px 16px', fontSize:'0.82rem', color:'#92400E', marginBottom:'28px', textAlign:'left' }}>
                    💡 <strong>Tip:</strong> If you don't see it in a few minutes, check your spam or junk folder.
                </div>

                <Link to="/login" className="btn btn-secondary" style={{ width:'100%', padding:'11px', textDecoration:'none', justifyContent:'center', display:'flex', gap:'6px' }}>
                    <ArrowLeft size={15} /> Back to Login
                </Link>

                <p style={{ marginTop:'20px', fontSize:'0.75rem', color:'var(--stone-500)' }}>
                    Wrong email? <Link to="/signup" style={{ color:'var(--forest)', fontWeight:600 }}>Start over →</Link>
                </p>
            </div>
        </div>
    </div>
);

export default VerificationSent;
