import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const VerificationSuccess = () => {
    const [searchParams] = useSearchParams();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const processed = React.useRef(false);

    useEffect(() => {
        if (processed.current) return;
        const data = searchParams.get('data');
        if (data) {
            try {
                const userData = JSON.parse(decodeURIComponent(data));
                login(userData);
                processed.current = true;
                setTimeout(() => navigate('/'), 3000);
            } catch {
                processed.current = true;
            }
        }
    }, [searchParams, login, navigate]);

    return (
        <div style={{ display:'flex', minHeight:'100vh' }}>
            <div style={{ width:'6px', background:'var(--forest)', flexShrink:0 }} />

            <div className="flex-center" style={{ flex:1, background:'var(--cream)', padding:'40px' }}>
                <div style={{ width:'100%', maxWidth:'420px', textAlign:'center' }}>
                    <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                        <CheckCircle size={36} color="var(--forest)" />
                    </div>

                    <h1 style={{ fontSize:'1.7rem', fontWeight:800, color:'var(--charcoal)', letterSpacing:'-0.02em', marginBottom:'10px' }}>
                        Email Verified!
                    </h1>
                    <p style={{ color:'var(--stone-500)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:'28px' }}>
                        Your account is active. We're securely logging you in and taking you to your workspace now.
                    </p>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', background:'#D1FAE5', color:'#166534', padding:'12px 20px', borderRadius:'var(--r-md)', fontSize:'0.85rem', fontWeight:600 }}>
                        <span className="spin" style={{ width:'16px', height:'16px', border:'2px solid rgba(22,163,74,0.3)', borderTopColor:'#16a34a', borderRadius:'50%' }} />
                        Redirecting to Dashboard…
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationSuccess;
