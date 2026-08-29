import React from 'react';

// 📊 ফুল ডাইনামিক ট্রানজ্যাকশন টেবিল (জিরো হার্ডকোড ডেটা)
export default function TransactionTable({ transactions = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700/50">
            <th className="py-4 px-6 font-medium uppercase text-xs tracking-wider">ID</th>
            <th className="py-4 px-6 font-medium uppercase text-xs tracking-wider">User</th>
            <th className="py-4 px-6 font-medium uppercase text-xs tracking-wider">Amount</th>
            <th className="py-4 px-6 font-medium uppercase text-xs tracking-wider">Status</th>
            <th className="py-4 px-6 font-medium uppercase text-xs tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700/30">
          {(!transactions || transactions.length === 0) ? (
            <tr>
              <td colSpan="5" className="text-center py-8 text-gray-400 italic text-xs">
                No recent transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((txn, index) => {
              const amountVal = Number(txn.amount) || 0;
              const isPositive = amountVal >= 0;
              const statusStr = (txn.status || 'Pending').toLowerCase();
              const isCompleted = statusStr === 'completed' || statusStr === 'success' || statusStr === 'approved' || statusStr === 'successful';

              return (
                <tr key={txn.id || index} className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors duration-200">
                  {/* ID টেক্সট */}
                  <td className="py-4 px-6 text-sm font-mono text-indigo-400">
                    #{txn.id || 'TXN'}
                  </td>
                  
                  {/* Username টেক্সট */}
                  <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">
                    {txn.user || txn.sellerName || 'User'}
                  </td>
                  
                  {/* Amount */}
                  <td className={`py-4 px-6 text-sm font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? `+$${amountVal.toFixed(2)}` : `-$${Math.abs(amountVal).toFixed(2)}`} USD
                  </td>
                  
                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      isCompleted 
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                    }`}>
                      {txn.status || 'Pending'}
                    </span>
                  </td>
                  
                  {/* Date */}
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                    {txn.date || new Date().toLocaleDateString()}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}