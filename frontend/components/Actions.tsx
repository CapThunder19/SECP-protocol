'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { contracts } from '@/config/contracts';
import { SECPVaultABI, SECPBorrowABI, ERC20ABI, RWABI } from '@/config/abi';

export function Actions() {
  const { address } = useAccount();
  const [riskyAmount, setRiskyAmount] = useState('');
  const [safeAmount, setSafeAmount] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [rwaName, setRwaName] = useState('');
  const [rwaDescription, setRwaDescription] = useState('');
  const [rwaValue, setRwaValue] = useState('');
  const [tokenizedRWAs, setTokenizedRWAs] = useState<Array<{name: string, description: string, value: string, id: number}>>([]);
  const [nextRWAId, setNextRWAId] = useState(1);
  const [approvedTokens, setApprovedTokens] = useState<Set<string>>(new Set());
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Auto-advance to next step when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      // Transaction succeeded, could add to approved tokens set
    }
  }, [isSuccess]);

  // Check if we have collateral
  const { data: totalValue } = useReadContract({
    address: contracts.vault as `0x${string}`,
    abi: SECPVaultABI,
    functionName: 'totalValue',
  });

  const handleApproveRisky = async () => {
    if (!riskyAmount) return;
    const amount = parseEther(riskyAmount);
    writeContract({
      address: contracts.riskyToken as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [contracts.vault as `0x${string}`, amount * 2n],
    });
  };

  const handleApproveSafe = async () => {
    if (!safeAmount) return;
    const amount = parseEther(safeAmount);
    writeContract({
      address: contracts.safeToken as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [contracts.vault as `0x${string}`, amount * 2n],
    });
  };

  const handleApproveYield = async () => {
    if (!yieldAmount) return;
    const amount = parseEther(yieldAmount);
    writeContract({
      address: contracts.yieldToken as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [contracts.vault as `0x${string}`, amount * 2n],
    });
  };

  const handleDepositRisky = async () => {
    if (!riskyAmount) return;
    const risky = parseEther(riskyAmount);
    
    writeContract({
      address: contracts.vault as `0x${string}`,
      abi: SECPVaultABI,
      functionName: 'deposit',
      args: [risky, 0n, 0n],
    });
  };

  const handleDepositSafe = async () => {
    if (!safeAmount) return;
    const safe = parseEther(safeAmount);
    
    writeContract({
      address: contracts.vault as `0x${string}`,
      abi: SECPVaultABI,
      functionName: 'deposit',
      args: [0n, safe, 0n],
    });
  };

  const handleDepositYield = async () => {
    if (!yieldAmount) return;
    const yieldVal = parseEther(yieldAmount);
    
    writeContract({
      address: contracts.vault as `0x${string}`,
      abi: SECPVaultABI,
      functionName: 'deposit',
      args: [0n, 0n, yieldVal],
    });
  };

  const handleTakeLoan = async () => {
    if (!loanAmount) return;
    
    const amount = parseEther(loanAmount);
    writeContract({
      address: contracts.borrow as `0x${string}`,
      abi: SECPBorrowABI,
      functionName: 'takeLoan',
      args: [amount],
    });
  };

  const handleProtect = async () => {
    console.log('🛡️ Activating protection...');
    console.log('Contract address:', contracts.borrow);
    console.log('User address:', address);
    
    try {
      const result = writeContract({
        address: contracts.borrow as `0x${string}`,
        abi: SECPBorrowABI,
        functionName: 'checkAndProtect',
      });
      console.log('✅ Protection transaction submitted:', result);
    } catch (error) {
      console.error('❌ Protection failed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const handleTokenizeRWA = async () => {
    if (!rwaName || !rwaDescription || !rwaValue) return;
    
    const value = parseEther(rwaValue);
    const currentId = nextRWAId;
    
    console.log('🏠 Tokenizing RWA with ID:', currentId);
    
    writeContract({
      address: contracts.rwaToken as `0x${string}`,
      abi: RWABI,
      functionName: 'tokenizeAsset',
      args: [rwaDescription, rwaName, value],
    });
    
    // Add to local list with ID
    setTokenizedRWAs([...tokenizedRWAs, { 
      name: rwaName, 
      description: rwaDescription, 
      value: rwaValue,
      id: currentId 
    }]);
    
    // Increment ID for next tokenization
    setNextRWAId(currentId + 1);
    
    // Clear inputs
    setRwaName('');
    setRwaDescription('');
    setRwaValue('');
  };

  const handleRegisterRWAs = async () => {
    if (tokenizedRWAs.length === 0) {
      console.log('⚠️ No RWAs tokenized yet!');
      return;
    }
    
    // Get all RWA IDs that have been tokenized
    const rwaIds = tokenizedRWAs.map(rwa => BigInt(rwa.id));
    
    console.log('🔄 Registering RWA assets:', rwaIds.map(id => id.toString()));
    
    try {
      writeContract({
        address: contracts.borrow as `0x${string}`,
        abi: SECPBorrowABI,
        functionName: 'setRWAAssets',
        args: [rwaIds],
      });
      console.log('✅ Registration transaction submitted with IDs:', rwaIds.map(id => id.toString()));
    } catch (error) {
      console.error('❌ Registration failed:', error);
    }
  };

  const handleResetProtection = async () => {
    console.log('🔄 Resetting protection...');
    try {
      writeContract({
        address: contracts.borrow as `0x${string}`,
        abi: SECPBorrowABI,
        functionName: 'resetProtection',
      });
      console.log('✅ Reset transaction submitted');
    } catch (error) {
      console.error('❌ Reset failed:', error);
    }
  };

  const handleLockRWA = async () => {
    writeContract({
      address: contracts.borrow as `0x${string}`,
      abi: SECPBorrowABI,
      functionName: 'checkAndLockRWA',
    });
  };

  return (
    <div className="space-y-6">
      {/* Transaction Status */}
      {isPending && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-200">⏳ Waiting for wallet confirmation...</p>
        </div>
      )}
      
      {isConfirming && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <p className="text-blue-200">⛏️ Mining transaction... Please wait for confirmation.</p>
          <p className="text-xs text-blue-300 mt-1">This may take 10-30 seconds</p>
        </div>
      )}
      
      {isSuccess && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-200">✅ Transaction confirmed! Data will refresh automatically.</p>
          {hash && (
            <a 
              href={`https://sepolia.mantlescan.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-300 hover:text-green-100 underline mt-1 block"
            >
              View on Explorer →
            </a>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold mb-2">💡 How to Borrow:</h4>
        <ol className="space-y-1 text-gray-300">
          <li>1. Deposit Risky, Safe, and Yield tokens</li>
          <li>2. Borrow up to 66% of your collateral</li>
          <li>3. Maintain 150%+ health factor</li>
        </ol>
      </div>

      {/* Deposit Risky Tokens */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">💎 Deposit Risky Assets</h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Amount (e.g., 400)"
            value={riskyAmount}
            onChange={(e) => setRiskyAmount(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveRisky}
              disabled={isPending || isConfirming || !riskyAmount}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Wait...' : 'Approve'}
            </button>
            <button
              onClick={handleDepositRisky}
              disabled={isPending || isConfirming || !riskyAmount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Wait...' : 'Deposit'}
            </button>
          </div>
          <p className="text-xs text-gray-400">High volatility, high risk assets</p>
        </div>
      </div>

      {/* Deposit Safe Tokens */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🛡️ Deposit Safe Assets</h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Amount (e.g., 200)"
            value={safeAmount}
            onChange={(e) => setSafeAmount(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveSafe}
              disabled={isPending || isConfirming || !safeAmount}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Wait...' : 'Approve'}
            </button>
            <button
              onClick={handleDepositSafe}
              disabled={isPending || isConfirming || !safeAmount}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Wait...' : 'Deposit'}
            </button>
          </div>
          <p className="text-xs text-gray-400">Stablecoins, low volatility assets</p>
        </div>
      </div>

      {/* Deposit Yield Tokens */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">💰 Deposit Yield Assets</h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Amount (e.g., 100)"
            value={yieldAmount}
            onChange={(e) => setYieldAmount(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveYield}
              disabled={isPending || isConfirming || !yieldAmount}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Wait...' : 'Approve'}
            </button>
            <button
              onClick={handleDepositYield}
              disabled={isPending || isConfirming || !yieldAmount}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Wait...' : 'Deposit'}
            </button>
          </div>
          <p className="text-xs text-gray-400">Revenue generating tokens, used as buffer</p>
        </div>
      </div>

      {/* Deposit Preview */}
      {(riskyAmount || safeAmount || yieldAmount) && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-blue-200">📋 Preview Deposit</h4>
          <p className="text-xs text-blue-300 mb-3">⬇️ Click "Approve & Deposit" buttons above to deposit these amounts</p>
          <div className="space-y-2 text-sm">
            {riskyAmount && (
              <div className="flex justify-between">
                <span className="text-gray-300">💎 Risky:</span>
                <span className="font-semibold text-red-300">{riskyAmount} tokens</span>
              </div>
            )}
            {safeAmount && (
              <div className="flex justify-between">
                <span className="text-gray-300">🛡️ Safe:</span>
                <span className="font-semibold text-green-300">{safeAmount} tokens</span>
              </div>
            )}
            {yieldAmount && (
              <div className="flex justify-between">
                <span className="text-gray-300">💰 Yield:</span>
                <span className="font-semibold text-purple-300">{yieldAmount} tokens</span>
              </div>
            )}
            <div className="border-t border-blue-500/30 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-blue-200">Total to Deposit:</span>
                <span className="text-blue-100">
                  {(Number(riskyAmount || 0) + Number(safeAmount || 0) + Number(yieldAmount || 0)).toFixed(2)} tokens
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {(totalValue && totalValue > 0n) && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 text-center">
          <p className="text-green-400 font-semibold">✅ Collateral deposited! You can borrow now.</p>
        </div>
      )}

      {/* RWA Tokenization Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🏠 Tokenize Real-World Assets</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Asset Name (e.g., Miami Condo)"
            value={rwaName}
            onChange={(e) => setRwaName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Description (e.g., Real Estate)"
            value={rwaDescription}
            onChange={(e) => setRwaDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="number"
            placeholder="Value in tokens (e.g., 100)"
            value={rwaValue}
            onChange={(e) => setRwaValue(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleTokenizeRWA}
            disabled={isPending || isConfirming || !rwaName || !rwaDescription || !rwaValue}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isPending || isConfirming ? 'Tokenizing...' : 'Tokenize Asset'}
          </button>
          <p className="text-xs text-gray-400">Create RWA tokens for emergency collateral (property, gold, etc.)</p>
          
          {/* Display Tokenized RWAs */}
          {tokenizedRWAs.length > 0 && (
            <div className="mt-4 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-300 mb-2">📋 Your RWA Assets:</h4>
              <div className="space-y-2">
                {tokenizedRWAs.map((rwa, index) => (
                  <div key={index} className="flex justify-between items-center text-xs bg-gray-700/50 px-3 py-2 rounded">
                    <div>
                      <span className="text-orange-400 font-bold">#{rwa.id}</span>
                      <span className="font-semibold text-orange-200 ml-2">{rwa.name}</span>
                      <span className="text-gray-400 ml-2">({rwa.description})</span>
                    </div>
                    <span className="text-green-400 font-medium">{rwa.value} tokens</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleRegisterRWAs}
                disabled={isPending || isConfirming}
                className="w-full mt-3 px-3 py-2 bg-orange-700 hover:bg-orange-800 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isPending || isConfirming ? 'Registering...' : '🔒 Register for Protection'}
              </button>
              <p className="text-xs text-gray-400 mt-2">⚠️ Click to register RWAs before activating protection!</p>
            </div>
          )}
        </div>
      </div>

      {/* Loan Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">💵 Take Loan</h3>
        <div className="space-y-3">
          {totalValue && totalValue > 0n && (
            <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3 text-sm mb-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Collateral:</span>
                <span className="font-semibold text-blue-200">{(Number(totalValue) / 1e18).toFixed(2)} tokens</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-300">Max Borrowable (150% min health):</span>
                <span className="font-semibold text-green-300">{(Number(totalValue) / 1.5 / 1e18).toFixed(2)} tokens</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">💡 You need 150% health factor minimum to borrow</p>
            </div>
          )}
          <input
            type="number"
            placeholder="Amount to borrow (e.g., 200)"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleTakeLoan}
            disabled={isPending || isConfirming || !loanAmount || !totalValue || totalValue === 0n}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isPending || isConfirming ? 'Processing...' : 'Borrow'}
          </button>
          {(!totalValue || totalValue === 0n) && (
            <p className="text-sm text-yellow-400">⚠️ Deposit collateral first!</p>
          )}
        </div>
      </div>

      {/* Protection Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🛡️ Emergency Protection</h3>
        <div className="space-y-3">
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-3 text-sm mb-3">
            <p className="text-yellow-200">⚡ When you trigger protection:</p>
            <ul className="mt-2 space-y-1 text-gray-300 text-xs">
              <li>1. Debt increases 100% (simulates crash)</li>
              <li>2. 50% Risky → Safe assets</li>
              <li>3. Yield reduces debt by 10%</li>
              <li>4. RWA assets locked automatically</li>
              <li>5. Position becomes protected!</li>
            </ul>
          </div>
          <button
            onClick={handleProtect}
            disabled={isPending || isConfirming}
            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50 text-lg"
          >
            {isPending || isConfirming ? 'Processing...' : '⚡ Activate Protection & Lock RWA'}
          </button>
          <button
            onClick={handleResetProtection}
            disabled={isPending || isConfirming}
            className="w-full px-4 py-2 mt-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isPending || isConfirming ? 'Resetting...' : '🔄 Reset Protection (Test Again)'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Watch assets rebalance and RWA lock automatically!
          </p>
        </div>
      </div>
    </div>
  );
}
