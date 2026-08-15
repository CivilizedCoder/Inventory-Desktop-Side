import React from 'react';
import { User } from 'firebase/auth';
import {
  Boxes,
  ClipboardList,
  PackageCheck,
  LogIn,
  LogOut,
  Database,
  RefreshCw,
  PlusCircle,
  ShieldAlert,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { signInWithGoogle, logoutUser } from '../lib/firebase';

interface HeaderProps {
  user: User | null;
  activeTab: 'dashboard' | 'pick-list' | 'orders' | 'inventory';
  setActiveTab: (tab: 'dashboard' | 'pick-list' | 'orders' | 'inventory') => void;
  itemsCount: number;
  pendingOrdersCount: number;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  itemsCount,
  pendingOrdersCount,
  onSeedData,
  isSeeding,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">StockTrack Pro</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Firebase Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Inventory & Material Pick List Management
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="tab-dashboard-btn"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              id="tab-pick-list-btn"
              onClick={() => setActiveTab('pick-list')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'pick-list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Pick List</span>
            </button>

            <button
              id="tab-orders-btn"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Orders & Fulfillment</span>
              {pendingOrdersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-xs rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              id="tab-inventory-btn"
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Items Catalog</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300">
                {itemsCount}
              </span>
            </button>
          </nav>

          {/* Actions & User Profile */}
          <div className="flex items-center space-x-3">
            {itemsCount === 0 && (
              <button
                id="seed-data-btn"
                onClick={onSeedData}
                disabled={isSeeding}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 transition-all disabled:opacity-50"
                title="Populate sample inventory items & pick lists into Firestore"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
              </button>
            )}

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Manager'}
                    className="w-7 h-7 rounded-full ring-2 ring-indigo-500/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Manager Authenticated
                  </p>
                </div>
                <button
                  id="google-logout-btn"
                  onClick={logoutUser}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors"
                  title="Sign out of Google Auth"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="google-login-btn"
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center text-xs py-1 px-2 ${
              activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Boxes className="w-4 h-4 mb-0.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('pick-list')}
            className={`flex flex-col items-center text-xs py-1 px-2 ${
              activeTab === 'pick-list' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <PlusCircle className="w-4 h-4 mb-0.5" />
            <span>New Pick List</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center text-xs py-1 px-2 ${
              activeTab === 'orders' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ClipboardList className="w-4 h-4 mb-0.5" />
            <span>Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center text-xs py-1 px-2 ${
              activeTab === 'inventory' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <PackageCheck className="w-4 h-4 mb-0.5" />
            <span>Items</span>
          </button>
        </div>
      </div>
    </header>
  );
};
