import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login({ username, password })
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة')
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      direction: 'rtl',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '20px'
    }}>
      <style>{`
        .login-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 32px 40px;
          border-radius: 24px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          width: 100%;
          max-width: 400px;
          color: #1e293b;
        }
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          text-align: right;
        }
        .input-group input {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          color: #1e293b;
          font-size: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .toggle-password {
          position: absolute;
          left: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .toggle-password:hover {
          color: #2c4782;
        }
        .input-group input::placeholder {
          color: #94a3b8;
          opacity: 1;
        }
        .input-group input:focus {
          background: #ffffff;
          border-color: #2c4782;
          box-shadow: 0 0 0 4px rgba(44, 71, 130, 0.1);
        }
        .login-button {
          width: 100%;
          padding: 12px;
          background: #2c4782;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          box-shadow: 0 4px 6px -1px rgba(44, 71, 130, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
        }
        .login-button:hover:not(:disabled) {
          background: #1e3a8a;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(44, 71, 130, 0.3);
        }
        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '76px',
            height: '76px',
            background: '#2c4782',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '38px',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(44, 71, 130, 0.3)'
          }}>🛒</div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>
            نظام المبيعات الذكي
          </h2>
          <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
            يرجى إدخال بياناتك للدخول إلى لوحة التحكم
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              background: '#fff1f2', 
              color: '#be123c', 
              padding: '12px', 
              borderRadius: '12px', 
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px',
              border: '1px solid #ffe4e6',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          <div className="input-group" style={{ marginBottom: '18px' }}>
            <label>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label>كلمة المرور</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                style={{ paddingLeft: '45px' }}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  /* Eye Open (Professional) */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  /* Eye Off (Professional Standard) */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner" />
                <span>جاري التحميل...</span>
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px', 
          fontSize: '12px', 
          color: '#94a3b8',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '16px',
          fontWeight: '500'
        }}>
          جميع الحقوق محفوظة © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
