import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { CreditCard, User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    bvnNin: '',
    phoneNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Register.jsx
const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Hits http://localhost:2000/api/v1/onboard
    await axiosInstance.post('/onboard', {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      bvnOrNin: formData.bvnNin // Maps your form field to 'bvnOrNin' expected by controller
    });

    toast.success('Account created successfully! Please log in.');
    navigate('/login');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden antialiased">
      <Toaster position="top-right" />

      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 mb-3 shadow-inner">
            <CreditCard size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            DIVINE BANK
          </h1>
          <p className="text-xs text-slate-400 mt-1">Open a New Account</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-950/50 space-y-5">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-lg font-bold text-white tracking-wide">Create Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Fill in your details to get started with instant banking</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500/80 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition placeholder:text-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500/80 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition placeholder:text-slate-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">BVN / NIN</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  name="bvnNin"
                  required
                  value={formData.bvnNin}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500/80 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition placeholder:text-slate-600"
                  placeholder="12345678901"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500/80 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition duration-200"
            >
              {loading ? 'Creating Account...' : <>Register Account <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Footer link to Login */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Protected by Divine Bank Core Security API</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
