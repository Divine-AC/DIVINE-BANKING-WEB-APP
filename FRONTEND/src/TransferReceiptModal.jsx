import React from 'react';

const TransferReceiptModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) return alert('Please allow popups for printing.');

    const formattedAmount = Number(transaction.amount).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
    });
    const formattedDate = new Date(transaction.createdAt || Date.now()).toLocaleString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Receipt - ${transaction.reference}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 40px;
              color: #1e293b;
              background-color: #ffffff;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              max-width: 450px;
              margin: 0 auto;
            }
            .title {
              color: #059669;
              font-size: 20px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 4px;
            }
            .amount {
              font-size: 28px;
              font-weight: 800;
              text-align: center;
              margin-bottom: 20px;
              color: #0f172a;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dashed #f1f5f9;
              font-size: 14px;
            }
            .label { font-weight: 500; color: #64748b; }
            .value { color: #0f172a; font-family: monospace; }
            .status {
              background-color: #d1fae5;
              color: #047857;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            @media print {
              body { padding: 0; }
              .card { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">Transfer Successful</div>
            <div class="amount">₦${formattedAmount}</div>
            <div class="row"><span class="label">Reference:</span><span class="value">${transaction.reference}</span></div>
            <div class="row"><span class="label">Recipient Account:</span><span class="value">${transaction.recipientAccountId}</span></div>
            <div class="row"><span class="label">Narration:</span><span class="value">${transaction.narration || 'N/A'}</span></div>
            <div class="row"><span class="label">Date & Time:</span><span class="value">${formattedDate}</span></div>
            <div class="row"><span class="label">Status:</span><span class="status">${transaction.status || 'SUCCESS'}</span></div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold text-emerald-600">Transfer Successful</h2>
          <p className="text-3xl font-extrabold text-slate-800 mt-2">
            ₦{Number(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="py-4 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between">
            <span className="font-medium">Reference:</span>
            <span className="font-mono text-slate-800">{transaction.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Recipient Account:</span>
            <span className="text-slate-800">{transaction.recipientAccountId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Narration:</span>
            <span className="text-slate-800">{transaction.narration || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date & Time:</span>
            <span className="text-slate-800">
              {new Date(transaction.createdAt || Date.now()).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-700">
              {transaction.status || 'SUCCESS'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition"
          >
            Download / Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferReceiptModal;