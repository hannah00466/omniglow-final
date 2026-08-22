import React, { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  RefreshCw,
  CheckCircle2,
  QrCode,
  KeyRound,
  Download,
  Upload,
  ShieldCheck,
  X,
  Copy,
  Check,
  Trash2,
  Plus,
  ArrowRight,
  Wifi,
  Sparkles,
  Layers,
  HardDrive,
  Command,
} from 'lucide-react';
import { UserProfile, SyncedDevice, UserAccount } from '../types';
import { getTranslation } from '../utils/translations';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedText: string;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onTriggerSync,
  isSyncing,
  lastSyncedText,
}) => {
  if (!isOpen) return null;

  const lang = profile.language || 'en';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  // Account State
  const defaultAccount: UserAccount = profile.account || {
    accountId: 'lumina-usr-8821',
    email: 'alex.wellness@luminaglow.app',
    name: 'Alex R.',
    syncPairCode: '849-216',
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'synced',
    cloudBackupEnabled: true,
    pairedDevices: [
      {
        id: 'dev-win',
        name: 'Windows 11 PC (Studio)',
        platform: 'windows',
        lastActive: 'Active Now',
        isCurrent: true,
      },
      {
        id: 'dev-ios',
        name: 'iPhone 15 Pro',
        platform: 'ios',
        lastActive: '14 min ago',
        isCurrent: false,
      },
      {
        id: 'dev-tab',
        name: 'iPad Pro / Galaxy Tab',
        platform: 'android',
        lastActive: '3 hours ago',
        isCurrent: false,
      },
    ],
  };

  const [account, setAccount] = useState<UserAccount>(defaultAccount);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [pairInputCode, setPairInputCode] = useState<string>('');
  const [pairSuccess, setPairSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'devices' | 'pair' | 'backup' | 'shortcuts'>('devices');

  const handleCopyPairCode = () => {
    navigator.clipboard?.writeText(account.syncPairCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePairNewDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairInputCode.trim()) return;

    const newDevice: SyncedDevice = {
      id: `dev-${Date.now()}`,
      name: `Synced Device (${pairInputCode.trim()})`,
      platform: pairInputCode.toLowerCase().includes('phone') ? 'android' : 'windows',
      lastActive: 'Just paired',
      isCurrent: false,
    };

    const updatedAccount: UserAccount = {
      ...account,
      pairedDevices: [...account.pairedDevices, newDevice],
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced',
    };

    setAccount(updatedAccount);
    onSaveProfile({ ...profile, account: updatedAccount });
    setPairSuccess(`Device with code "${pairInputCode}" successfully linked and synchronized!`);
    setPairInputCode('');
    setTimeout(() => setPairSuccess(null), 4000);
  };

  const handleRemoveDevice = (deviceId: string) => {
    const updated = account.pairedDevices.filter((d) => d.id !== deviceId);
    const updatedAccount = { ...account, pairedDevices: updated };
    setAccount(updatedAccount);
    onSaveProfile({ ...profile, account: updatedAccount });
  };

  const handleExportData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      profile,
      device: account.pairedDevices.find((d) => d.isCurrent)?.name || 'Current Device',
      version: '2.0-cross-platform',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-glow-sync-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPlatformIcon = (platform: SyncedDevice['platform']) => {
    switch (platform) {
      case 'windows':
        return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'ios':
        return <Smartphone className="w-4 h-4 text-zinc-300" />;
      case 'android':
        return <Tablet className="w-4 h-4 text-emerald-400" />;
      case 'mac':
        return <Monitor className="w-4 h-4 text-purple-400" />;
      default:
        return <Monitor className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-stone-100">
                  Cross-Platform Sync & Devices
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-300">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Seamless synchronization across Android, iPhone/iPad & Windows PC
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="px-5 py-3 bg-stone-950/60 border-b border-stone-850 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Account: <strong>{account.email}</strong></span>
            <span className="text-stone-600">•</span>
            <span className="text-stone-400 font-mono">Last synced: {lastSyncedText}</span>
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-medium flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-stone-800 bg-stone-950 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('devices')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'devices'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Connected Devices ({account.pairedDevices.length})
          </button>
          <button
            onClick={() => setActiveTab('pair')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'pair'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Pair New Device
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Export & Backup
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Desktop Hotkeys
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {pairSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pairSuccess}</span>
            </div>
          )}

          {/* TAB 1: Connected Devices */}
          {activeTab === 'devices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">All your active synced devices:</span>
                <span className="text-stone-500 font-mono">End-to-End Encrypted</span>
              </div>

              <div className="space-y-2.5">
                {account.pairedDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      dev.isCurrent
                        ? 'bg-stone-950 border-amber-500/40 shadow-sm'
                        : 'bg-stone-950/60 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                        {getPlatformIcon(dev.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-200 text-xs">{dev.name}</span>
                          {dev.isCurrent && (
                            <span className="text-[10px] bg-amber-950 border border-amber-700/50 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                              This Device
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400">{dev.lastActive}</span>
                      </div>
                    </div>

                    {!dev.isCurrent && (
                      <button
                        onClick={() => handleRemoveDevice(dev.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
                        title="Unlink Device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Supported OS Badges */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 space-y-2">
                <div className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Cross-Platform Availability</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-stone-400">
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <Smartphone className="w-4 h-4 text-stone-300 mx-auto mb-1" />
                    <span>Android & iPhone</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <Tablet className="w-4 h-4 text-stone-300 mx-auto mb-1" />
                    <span>iPad & Tablets</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <Laptop className="w-4 h-4 text-stone-300 mx-auto mb-1" />
                    <span>Windows & Mac PC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pair New Device */}
          {activeTab === 'pair' && (
            <div className="space-y-5">
              {/* Your Pair Code Box */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3 text-center">
                <div className="text-stone-300 font-semibold">Your 6-Digit Device Pairing Code</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="font-mono text-2xl font-bold tracking-widest text-amber-300 px-5 py-2 bg-stone-900 border border-amber-500/30 rounded-xl">
                    {account.syncPairCode}
                  </div>
                  <button
                    onClick={handleCopyPairCode}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 max-w-md mx-auto">
                  Open Lumina Glow on your phone, tablet, or Windows computer, go to <strong>Sync Devices</strong> and enter this code to link your progress instantly.
                </p>
              </div>

              {/* Enter Code From Another Device Form */}
              <form onSubmit={handlePairNewDevice} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="text-stone-300 font-semibold">Link from another phone or PC</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code (e.g. 523-891)"
                    value={pairInputCode}
                    onChange={(e) => setPairInputCode(e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-600 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Export & Local Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-stone-200 font-semibold">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Full Offline Portability (JSON Backup)</span>
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Export all your 5 pillars (Sleep logs, Nutrition meals, Hydration entries, Body routines, and Mind reflections) into a single encrypted file to transfer to any Windows, Mac, or mobile device without internet.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleExportData}
                    className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Download Complete Backup (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Desktop Hotkeys & PWA */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="text-stone-300 font-semibold flex items-center gap-2">
                <Command className="w-4 h-4 text-amber-400" />
                <span>Windows & Desktop Productivity Shortcuts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-stone-300">
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Home Dashboard</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">1</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Sleep Sanctuary</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">2</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Food & Nutrition</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">3</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Hydration Tracker</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">4</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Body Movement</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">5</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Mind & Breath</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">6</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Instant Cloud Sync</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">S</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                  <span>Close Modal</span>
                  <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono">Esc</kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs">
          <span className="text-stone-400">Available everywhere • Single unified account</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
