'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Dashboard } from '@/components/Dashboard';
import { Actions } from '@/components/Actions';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🛡️ SECP Protocol</h1>
            <p className="text-sm text-gray-400">Anti-Liquidation DeFi with RWA</p>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard - 2 columns */}
          <div className="lg:col-span-2">
            <Dashboard />
          </div>

          {/* Actions - 1 column */}
          <div>
            <Actions />
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-semibold mb-2">Auto-Rebalancing</h3>
            <p className="text-sm text-gray-400">
              Automatically converts risky assets to safe assets when health drops
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-2">Yield Protection</h3>
            <p className="text-sm text-gray-400">
              Diverts yield tokens to buffer your debt during market crashes
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-semibold mb-2">RWA Collateral</h3>
            <p className="text-sm text-gray-400">
              Lock real-world assets as emergency collateral to save your position
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
