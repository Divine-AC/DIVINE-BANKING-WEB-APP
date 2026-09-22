import html2pdf from 'html2pdf.js';
import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../API/axiosInstance';
import { 
  LogOut, Wallet, Send, Search, History, Shield, X, 
  ArrowUpRight, ArrowDownLeft, Printer, Eye, EyeOff, 
  TrendingUp, CreditCard, Bell, ChevronRight 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  const [activeModal, setActiveModal] = useState(null);

  // Transfer State
  const [recipientAcc, setRecipientAcc] = useState('');
  const [resolvedName, setResolvedName] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [pin, setPin] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Enquiry State
  const [enquiryAcc, setEnquiryAcc] = useState('');
  const [enquiryResult, setEnquiryResult] = useState(null);

  // History & Filtering State
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Set PIN State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState(null);

  // Auto-Logout Timer Setup (5 Minutes of inactivity)
  const timerRef = useRef(null);
  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      toast.error('Session expired due to inactivity');
      logout();
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
    };
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await axiosInstance.get('/accounts/balance');
      setAccount(res.data);
    } catch (err) {
      toast.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await axiosInstance.get('/banking/transactions');
      setTransactions(res.data.history || []);
    } catch (err) {
      // Quiet fail for preview list
    }
  };

  useEffect(() => {
    fetchAccount();
    fetchRecentTransactions();
  }, []);

  const verifyRecipient = async (accNum) => {
    setRecipientAcc(accNum);
    setResolvedName('');
    if (accNum.length === 10) {
      try {
        const res = await axiosInstance.post('/banking/name-enquiry', { accountNumber: accNum });
        setResolvedName(res.data.fullName || res.data.accountName);
      } catch (err) {
        setResolvedName('Account not found');
      }
    }
  };

  const handleStandaloneEnquiry = async (e) => {
    e.preventDefault();
    setEnquiryResult(null);
    try {
      const res = await axiosInstance.post('/banking/name-enquiry', { accountNumber: enquiryAcc });
      setEnquiryResult({ success: true, name: res.data.fullName || res.data.accountName });
    } catch (err) {
      setEnquiryResult({ success: false, name: 'Account not found' });
    }
  };

  const fetchTransactionHistory = async () => {
    setActiveModal('history');
    setLoadingHistory(true);
    try {
      const res = await axiosInstance.get('/banking/transactions');
      setTransactions(res.data.history || []);
    } catch (err) {
      toast.error('Failed to load transaction history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fixed handlePrintReceipt using html2pdf.js
  const handlePrintReceipt = (data) => {
    const formattedAmount = Number(data.amount).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
    });
    const formattedDate = new Date(data.date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; width: 380px; margin: auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">
          <h2 style="color: #2563eb; margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Divine Bank</h2>
          <p style="color: #059669; font-size: 13px; font-weight: 600; margin: 6px 0 0 0;">✓ Transfer Successful</p>
          <h1 style="font-size: 26px; font-weight: 800; margin: 10px 0 0 0; color: #0f172a;">₦${formattedAmount}</h1>
        </div>
        <div style="margin-top: 20px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
            <span style="color: #64748b;">Reference:</span> <strong style="font-family: monospace;">${data.reference}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
            <span style="color: #64748b;">Recipient Account:</span> <strong>${data.recipientAcc}</strong>
          </div>
          ${data.recipientName ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;"><span style="color: #64748b;">Recipient Name:</span> <strong>${data.recipientName}</strong></div>` : ''}
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
            <span style="color: #64748b;">Narration:</span> <span>${data.narration || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
            <span style="color: #64748b;">Date & Time:</span> <span>${formattedDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
            <span style="color: #64748b;">Status:</span> <strong style="color: #059669;">SUCCESS</strong>
          </div>
        </div>
        <div style="margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          Thank you for banking with Divine Bank.<br/>This is a system-generated receipt.
        </div>
      </div>
    `;

    const opt = {
      margin:       0.2,
      filename:     `Receipt-${data.reference}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferring(true);

    if (Number(amount) > (account?.balance ?? 0)) {
      toast.error('Transfer amount exceeds available balance.');
      setTransferring(false);
      return;
    }

    try {
      const res = await axiosInstance.post('/banking/transfer', {
        recipientAccountId: recipientAcc,
        amount: Number(amount),
        narration: narration || 'Funds Transfer',
        pin
      });

      toast.success('Transfer Successful!');
      setReceiptData({
        reference: res.data.transaction?.reference || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        recipientAcc,
        recipientName: resolvedName,
        amount: Number(amount),
        narration: narration || 'Funds Transfer',
        date: new Date().toISOString()
      });

      fetchAccount();
      fetchRecentTransactions();

      setActiveModal('receipt');
      setRecipientAcc('');
      setResolvedName('');
      setAmount('');
      setNarration('');
      setPin('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  const openHistoryReceipt = (tx) => {
    setReceiptData({
      reference: tx.reference || tx._id || 'TXN-HISTORY',
      recipientAcc: tx.accountRef || tx.recipientAccountId || 'N/A',
      recipientName: tx.recipientName || '',
      amount: Number(tx.amount),
      narration: tx.narration || 'Transaction',
      date: tx.date || tx.createdAt || new Date().toISOString()
    });
    setActiveModal('receipt');
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    setPinSubmitting(true);

    try {
      const res = await axiosInstance.post('/banking/set-pin', { newPin, currentPassword });
      toast.success(res.data.message || 'PIN updated successfully!');
      setActiveModal(null);
      setCurrentPassword('');
      setNewPin('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update PIN');
    } finally {
      setPinSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.narration?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.accountRef?.includes(searchQuery);
    const matchesType = filterType === 'ALL' || tx.txType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      <Toaster position="top-right" />

      {/* Top Navbar */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 border border-blue-500/30 p-2 rounded-xl text-blue-400">
              <CreditCard size={20} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                DIVINE BANK
              </span>
              <span className="hidden md:inline-block text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full ml-2 font-mono">
                PROD v1.2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-700/40 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.fullName || 'Customer'}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-6 space-y-8 flex-1">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-blue-400">{user?.fullName?.split(' ')[0] || 'User'}</span> 👋
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Here is what is happening with your financial overview today.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Account Balance Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-7 text-white shadow-2xl shadow-blue-900/30 border border-blue-400/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-200 font-medium tracking-wide uppercase">Available Balance</span>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-blue-200 hover:text-white transition"
                  >
                    {showBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white">
                  {loading 
                    ? '₦...' 
                    : showBalance 
                      ? `₦${(account?.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}` 
                      : '₦••••••••'}
                </h2>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <Wallet size={28} className="text-blue-100" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase">Account Number</p>
                <p className="text-sm font-mono font-bold tracking-widest text-white mt-0.5">
                  {loading ? 'Fetching...' : account?.accountNumber || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase">Account Status</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-6 flex flex-col justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Quick Operations</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveModal('transfer')}
                className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl transition group"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition duration-200">
                  <Send size={20} />
                </div>
                <span className="text-xs font-medium text-slate-200 mt-2">Transfer</span>
              </button>

              <button
                onClick={() => setActiveModal('enquiry')}
                className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl transition group"
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition duration-200">
                  <Search size={20} />
                </div>
                <span className="text-xs font-medium text-slate-200 mt-2">Lookup</span>
              </button>

              <button
                onClick={fetchTransactionHistory}
                className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl transition group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition duration-200">
                  <History size={20} />
                </div>
                <span className="text-xs font-medium text-slate-200 mt-2">History</span>
              </button>

              <button
                onClick={() => setActiveModal('set-pin')}
                className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl transition group"
              >
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition duration-200">
                  <Shield size={20} />
                </div>
                <span className="text-xs font-medium text-slate-200 mt-2">Security</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Transaction Preview Section */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Recent Activity</h3>
            <button 
              onClick={fetchTransactionHistory}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No recent transactions to display.</p>
            ) : (
              transactions.slice(0, 3).map((tx) => (
                <div key={tx._id} className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-2xl flex justify-between items-center text-xs transition">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${tx.txType === 'DEBIT' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {tx.txType === 'DEBIT' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{tx.narration}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {tx.accountRef}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${tx.txType === 'DEBIT' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {tx.txType === 'DEBIT' ? `-₦${Number(tx.amount).toLocaleString()}` : `+₦${Number(tx.amount).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Transfer Modal */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Transfer Funds</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Recipient Account Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={recipientAcc}
                  onChange={(e) => verifyRecipient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-blue-500 font-mono text-sm"
                  placeholder="Enter 10-digit account number"
                />
                {resolvedName && (
                  <p className={`text-xs mt-1 font-semibold ${resolvedName === 'Account not found' ? 'text-red-400' : 'text-blue-400'}`}>
                    Recipient: {resolvedName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-blue-500 text-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Narration
                </label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-blue-500 text-sm"
                  placeholder="Payment description"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Transaction PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-blue-500 font-mono text-center tracking-widest text-sm"
                  placeholder="••••"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 text-xs hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring || recipientAcc.length !== 10 || pin.length !== 4}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition"
                >
                  {transferring ? 'Processing...' : 'Send Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Transaction History</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
                <input
                  type="text"
                  placeholder="Search narration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-blue-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="CREDIT">Credits</option>
                <option value="DEBIT">Debits</option>
              </select>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {loadingHistory ? (
                <p className="text-center text-xs text-slate-500 py-4">Loading transactions...</p>
              ) : filteredTransactions.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-4">No matching transactions found.</p>
              ) : (
                filteredTransactions.map((tx) => (
                  <div key={tx._id} className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.txType === 'DEBIT' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {tx.txType === 'DEBIT' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{tx.narration}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {tx.accountRef}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`font-bold ${tx.txType === 'DEBIT' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tx.txType === 'DEBIT' ? `-₦${Number(tx.amount).toLocaleString()}` : `+₦${Number(tx.amount).toLocaleString()}`}
                      </span>
                      <button
                        onClick={() => openHistoryReceipt(tx)}
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        <Printer size={11} /> Receipt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Name Lookup Modal */}
      {activeModal === 'enquiry' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Account Name Lookup</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStandaloneEnquiry} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={enquiryAcc}
                  onChange={(e) => setEnquiryAcc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-blue-500 font-mono text-sm"
                  placeholder="Enter 10-digit account number"
                />
              </div>

              {enquiryResult && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${enquiryResult.success ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {enquiryResult.success ? `Account Holder: ${enquiryResult.name}` : enquiryResult.name}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set PIN Modal */}
      {activeModal === 'set-pin' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Set Transaction PIN</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSetPin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-blue-500 text-sm"
                  placeholder="Enter account password"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-blue-500 font-mono text-center tracking-widest text-base"
                  placeholder="••••"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pinSubmitting || newPin.length !== 4 || !currentPassword}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition"
                >
                  {pinSubmitting ? 'Saving...' : 'Set PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {activeModal === 'receipt' && receiptData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900">
            <div className="text-center border-b pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
                <Send size={22} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Divine Bank</p>
              <h3 className="text-lg font-bold text-slate-800">Transfer Successful</h3>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">
                ₦{receiptData.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-500 font-medium shrink-0">Reference</span>
                <span className="font-mono text-slate-800 font-bold text-right break-all">
                  {receiptData.reference}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4 border-t border-slate-100 pt-2">
                <span className="text-slate-500 font-medium shrink-0">Recipient Account</span>
                <span className="text-slate-800 font-semibold text-right">
                  {receiptData.recipientAcc}
                </span>
              </div>

              {receiptData.recipientName && (
                <div className="flex justify-between items-start gap-4 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Recipient Name</span>
                  <span className="text-slate-800 font-semibold text-right">
                    {receiptData.recipientName}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start gap-4 border-t border-slate-100 pt-2">
                <span className="text-slate-500 font-medium shrink-0">Narration</span>
                <span className="text-slate-800 font-medium text-right">
                  {receiptData.narration || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4 border-t border-slate-100 pt-2">
                <span className="text-slate-500 font-medium shrink-0">Date & Time</span>
                <span className="text-slate-800 font-medium text-right">
                  {new Date(receiptData.date).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handlePrintReceipt(receiptData)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Printer size={15} /> Download PDF
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;