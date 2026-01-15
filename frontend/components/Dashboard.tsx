'use client';

import { useAccount, useReadContract } from 'wagmi';
import { contracts } from '@/config/contracts';
import { SECPVaultABI, SECPBorrowABI } from '@/config/abi';
import { formatEther } from 'viem';

export function Dashboard() {
  const { address, isConnected } = useAccount();

  // Read vault data with auto-refresh
  const { data: riskyBal } = useReadContract({
    address: contracts.vault as `0x${string}`,
    abi: SECPVaultABI,
    functionName: 'riskyBal',
    query: {
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });

  const { data: safeBal } = useReadContract({
    address: contracts.vault as `0x${string}`,
    abi: SECPVaultABI,
    functionName: 'safeBal',
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: yieldBal } = useReadContract({
    address: contracts.vault as `0x${string}`,
    abi: SECPVaultABI,
    functionName: 'yieldBal',
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: rwaLocked } = useReadContract({
    address: contracts.vault as `0x${string}`,
    abi: SECPVaultABI,
    functionName: 'rwaLockedValue',
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: mode } = useReadContract({
    address: contracts.vault as `0x${string}`,
    abi: SECPVaultABI,
    functionName: 'mode',
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: debt } = useReadContract({
    address: contracts.borrow as `0x${string}`,
    abi: SECPBorrowABI,
    functionName: 'debt',
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: healthFactor } = useReadContract({
    address: contracts.borrow as `0x${string}`,
    abi: SECPBorrowABI,
    functionName: 'healthFactor',
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: protectedMode } = useReadContract({
    address: contracts.borrow as `0x${string}`,
    abi: SECPBorrowABI,
    functionName: 'protectedMode',
    query: {
      refetchInterval: 3000,
    },
  });

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Connect your wallet to view your position</p>
      </div>
    );
  }

  const totalValue = (riskyBal || 0n) + (safeBal || 0n) + (yieldBal || 0n) + (rwaLocked || 0n);
  const healthNum = Number(healthFactor || 0n);

  return (
    <div className="space-y-6">
      {/* Health Factor */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Health Factor</h3>
        <div className="flex items-end gap-4">
          <div className="text-4xl font-bold">
            {healthNum}%
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            healthNum >= 150 ? 'bg-green-500/20 text-green-400' :
            healthNum >= 120 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {healthNum >= 150 ? '✅ Healthy' : healthNum >= 120 ? '⚠️ Warning' : '🚨 Critical'}
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all ${
              healthNum >= 150 ? 'bg-green-500' :
              healthNum >= 120 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(healthNum, 200)}%` }}
          />
        </div>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Collateral</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Risky Assets</span>
              <span className="font-medium">{formatEther(riskyBal || 0n)} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Safe Assets</span>
              <span className="font-medium">{formatEther(safeBal || 0n)} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Yield Assets</span>
              <span className="font-medium">{formatEther(yieldBal || 0n)} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">🏠 RWA Locked</span>
              <span className="font-medium">{formatEther(rwaLocked || 0n)} tokens</span>
            </div>
            <div className="pt-3 border-t border-gray-700 flex justify-between">
              <span className="font-semibold">Total Value</span>
              <span className="font-bold text-lg">{formatEther(totalValue)} tokens</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Loan Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Debt</span>
              <span className="font-medium">{formatEther(debt || 0n)} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mode</span>
              <span className={`font-medium ${mode === 1 ? 'text-red-400' : 'text-green-400'}`}>
                {mode === 1 ? '🔴 CRASH' : '🟢 NORMAL'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Protected</span>
              <span className="font-medium">{protectedMode ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
