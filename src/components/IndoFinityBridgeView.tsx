import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Activity,
  Play,
  Square,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  MessageSquare,
  Heart,
  Gift,
  HelpCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  Radio,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { IndoFinityConnectionStatus, IndoFinityLogItem } from '../types';
import { IndoFinityClient } from '../services/indofinityService';

interface IndoFinityBridgeViewProps {
  client: IndoFinityClient;
  status: IndoFinityConnectionStatus;
  logs: IndoFinityLogItem[];
  onClearLogs: () => void;
  onConnect: (url: string) => void;
  onDisconnect: () => void;
}

export const IndoFinityBridgeView: React.FC<IndoFinityBridgeViewProps> = ({
  client,
  status,
  logs,
  onClearLogs,
  onConnect,
  onDisconnect,
}) => {
  const [wsUrl, setWsUrl] = useState(client.getUrl() || 'ws://localhost:62024');
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'chat' | 'like' | 'gift' | 'other'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const handleToggleConnect = () => {
    if (status === 'connected' || status === 'connecting') {
      onDisconnect();
    } else {
      onConnect(wsUrl);
    }
  };

  const handleAutoReconnectToggle = () => {
    const next = !autoReconnect;
    setAutoReconnect(next);
    client.setAutoReconnect(next);
  };

  const copyJson = (item: IndoFinityLogItem) => {
    const payload = JSON.stringify({ event: item.event, data: item.rawData }, null, 2);
    navigator.clipboard.writeText(payload).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    if (filterType === 'chat') return log.event === 'chat' || log.event === 'comment';
    if (filterType === 'like') return log.event === 'like';
    if (filterType === 'gift') return log.event === 'gift';
    if (filterType === 'other') return !['chat', 'comment', 'like', 'gift'].includes(log.event);
    return true;
  });

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>เชื่อมต่อสำเร็จ (CONNECTED)</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>กำลังพยายามเชื่อมต่อ (CONNECTING...)</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>ข้อผิดพลาด (CONNECTION ERROR)</span>
          </div>
        );
      case 'disconnected':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>ออฟไลน์ / ยังไม่ได้เชื่อมต่อ (DISCONNECTED)</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Radio className="w-5 h-5 text-slate-950 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    IndoFinity TikTok Live WebSocket Bridge
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Port 62024
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  เชื่อมต่อตรงกับโปรแกรม IndoFinity ในเครื่องคอมพิวเตอร์ของคุณ รับข้อความแชท ไลก์เคาะจอ และของขวัญ TikTok Live แบบเรียลไทม์
                </p>
              </div>
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* WebSocket Connection Control Box */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-6 space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>WebSocket Server URL:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://localhost:62024"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 shadow-inner"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                DEFAULT: 62024
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center gap-3 flex-wrap lg:justify-end pt-2 lg:pt-5">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950/70 border border-white/10 px-3 py-2 rounded-xl">
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={handleAutoReconnectToggle}
                className="rounded accent-cyan-400 cursor-pointer"
              />
              <span>เชื่อมต่อใหม่อัตโนมัติ (Auto-reconnect)</span>
            </label>

            <button
              onClick={handleToggleConnect}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                status === 'connected'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              }`}
            >
              {status === 'connected' ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>ตัดการเชื่อมต่อ (Disconnect)</span>
                </>
              ) : status === 'connecting' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังเชื่อมต่อ...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>เชื่อมต่อ IndoFinity (Connect)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Simulator / Event Tester + Live Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Injector & Instructions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Test Event Injector Card */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>จำลองส่งข้อมูล IndoFinity Format</span>
              </h3>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                Test Event
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ทดสอบระบบรับส่งข้อมูลรูปแบบ{' '}
              <code className="text-cyan-300 font-mono">
                {`{ event, data: eventData }`}
              </code>{' '}
              ของ IndoFinity โดยไม่ต้องเปิดไลฟ์จริง
            </p>

            <div className="space-y-2">
              <button
                onClick={() => client.simulateEvent('chat')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>1. ยิงข้อความแชท (Chat Event)</span>
                </div>
                <span className="text-[10px] text-cyan-300 opacity-60 group-hover:opacity-100">
                  @user: ข้อความ &rarr;
                </span>
              </button>

              <button
                onClick={() => client.simulateEvent('like')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-pink-400 hover:bg-pink-500/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform fill-current" />
                  <span>2. ยิงยอดไลก์เคาะจอ (Like Event)</span>
                </div>
                <span className="text-[10px] text-pink-300 opacity-60 group-hover:opacity-100">
                  +25 ไลก์ &rarr;
                </span>
              </button>

              <button
                onClick={() => client.simulateEvent('gift')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-amber-400 hover:bg-amber-500/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>3. ยิงของขวัญ (Gift Event)</span>
                </div>
                <span className="text-[10px] text-amber-300 opacity-60 group-hover:opacity-100">
                  Combo Alert &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* Quick Setup Guide Card */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>วิธีเชื่อมต่อกับโปรแกรม IndoFinity</span>
            </h3>
            <ol className="text-xs text-slate-400 space-y-2.5 list-decimal pl-4 leading-relaxed">
              <li>
                เปิดโปรแกรม <strong>IndoFinity</strong> บนคอมพิวเตอร์ของคุณ
              </li>
              <li>
                พิมพ์ชื่อบัญชี <strong>@TikTokUsername</strong> ของคุณแล้วกด Connect / Start ใน IndoFinity
              </li>
              <li>
                IndoFinity จะเปิด WebSocket Server ที่{' '}
                <code className="text-cyan-300 font-mono">ws://localhost:62024</code>{' '}
                โดยอัตโนมัติ
              </li>
              <li>
                StreamPulse จะเชื่อมต่ออัตโนมัติ และแสดงสถานะสีเขียว (CONNECTED)
              </li>
              <li>
                เมื่อใส่ Browser Source ใน OBS Studio ตัว Overlay ใน OBS จะเชื่อมต่อไปยัง{' '}
                <code className="text-cyan-300 font-mono">ws://localhost:62024</code>{' '}
                บนเครื่องของคุณโดยตรง ไม่ผ่านเซิร์ฟเวอร์ภายนอก ทำให้เร็วและลื่นไหล 100%
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Live Terminal Event Monitor */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Live Event Monitor (Incoming WebSocket Feed)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                ({filteredLogs.length} events)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
                {(['all', 'chat', 'like', 'gift', 'other'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                      filterType === type
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Clear button */}
              <button
                onClick={onClearLogs}
                className="p-1.5 rounded-lg bg-slate-950 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                title="ล้างรายการ Log ทั้งหมด"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Log Stream Window */}
          <div className="flex-1 min-h-[380px] max-h-[500px] overflow-y-auto bg-slate-950 rounded-2xl border border-white/10 p-3 space-y-2 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                <Activity className="w-8 h-8 opacity-40 animate-pulse" />
                <p>ยังไม่มีข้อความเข้าจาก WebSocket</p>
                <p className="text-[11px] text-slate-600">
                  รอโปรแกรม IndoFinity ส่งข้อมูล หรือกดปุ่ม &quot;จำลองส่งข้อมูล&quot; ด้านซ้ายเพื่อทดสอบ
                </p>
              </div>
            ) : (
              filteredLogs.map((item) => {
                const isExpanded = expandedLogId === item.id;
                const timeStr = new Date(item.timestamp).toLocaleTimeString();

                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-white/15 transition-all text-[11px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-slate-500 shrink-0">{timeStr}</span>
                        {/* Event Tag */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                            item.event === 'chat' || item.event === 'comment'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : item.event === 'like'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                              : item.event === 'gift'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.event === 'connect'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.event === 'error'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {item.event}
                        </span>
                        <span className="text-slate-200 truncate font-sans">
                          {item.summary}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => copyJson(item)}
                          className="px-2 py-1 rounded bg-slate-950 border border-white/10 hover:border-cyan-400 text-[10px] text-slate-400 hover:text-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
                          title="คัดลอก JSON"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>JSON</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : item.id)}
                          className="p-1 text-slate-400 hover:text-white rounded bg-slate-950 border border-white/10 cursor-pointer"
                          title={isExpanded ? 'ย่อโค้ด' : 'ดูข้อมูลดิบ'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable JSON viewer */}
                    {isExpanded && (
                      <pre className="mt-2 p-2.5 rounded-lg bg-black/70 border border-white/10 text-[10px] text-emerald-400 overflow-x-auto">
                        {JSON.stringify({ event: item.event, data: item.rawData }, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
