import { useState, useEffect, useRef, useCallback } from 'react';
import API from '@/config/api';

const ONLINE_MOVE_URL = API.onlineMove;

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export type P2PQuality = 'excellent' | 'good' | 'poor' | 'disconnected';

export interface PeerMessage {
  type: 'move' | 'time_sync' | 'resign' | 'draw' | 'timeout' | 'ping' | 'pong';
  data?: unknown;
  ts?: number;
}

interface UsePeerConnectionOptions {
  gameId: number;
  userId: string;
  isWhite: boolean;
  onMessage: (msg: PeerMessage) => void;
  enabled: boolean;
}

export const usePeerConnection = ({ gameId, userId, isWhite, onMessage, enabled }: UsePeerConnectionOptions) => {
  const [p2pConnected, setP2pConnected] = useState(false);
  const [p2pAttempted, setP2pAttempted] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [quality, setQuality] = useState<P2PQuality>('disconnected');
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const onMessageRef = useRef(onMessage);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPongRef = useRef<number>(Date.now());
  onMessageRef.current = onMessage;

  const updateQuality = useCallback((ms: number | null) => {
    if (ms === null) { setQuality('disconnected'); return; }
    if (ms < 80) setQuality('excellent');
    else if (ms < 200) setQuality('good');
    else setQuality('poor');
  }, []);

  const sendSignal = useCallback(async (signalType: string, signalData: string) => {
    try {
      await fetch(ONLINE_MOVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signal',
          game_id: gameId,
          user_id: userId,
          signal_type: signalType,
          signal_data: signalData
        })
      });
    } catch {
      console.warn('[P2P] Failed to send signal');
    }
  }, [gameId, userId]);

  const setupDataChannel = useCallback((dc: RTCDataChannel) => {
    dcRef.current = dc;
    dc.onopen = () => {
      setP2pConnected(true);
      lastPongRef.current = Date.now();
      console.log('[P2P] DataChannel open');
    };
    dc.onclose = () => {
      setP2pConnected(false);
      setLatency(null);
      setQuality('disconnected');
      console.log('[P2P] DataChannel closed');
    };
    dc.onmessage = (e) => {
      try {
        const msg: PeerMessage = JSON.parse(e.data);
        if (msg.type === 'ping') {
          dcRef.current?.send(JSON.stringify({ type: 'pong', ts: msg.ts }));
          return;
        }
        if (msg.type === 'pong' && msg.ts) {
          const rtt = Date.now() - msg.ts;
          lastPongRef.current = Date.now();
          setLatency(rtt);
          updateQuality(rtt);
          return;
        }
        lastPongRef.current = Date.now();
        onMessageRef.current(msg);
      } catch {
        console.warn('[P2P] Bad message:', e.data);
      }
    };
  }, [updateQuality]);

  useEffect(() => {
    if (!p2pConnected) {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      return;
    }

    const sendPing = () => {
      if (dcRef.current?.readyState === 'open') {
        dcRef.current.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        if (Date.now() - lastPongRef.current > 8000) {
          setQuality('poor');
        }
      }
    };

    sendPing();
    pingIntervalRef.current = setInterval(sendPing, 3000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [p2pConnected]);

  const processSignals = useCallback(async (signals: { from: string; type: string; data: string }[]) => {
    const pc = pcRef.current;
    if (!pc) return;

    for (const sig of signals) {
      try {
        if (sig.type === 'offer') {
          const offer = JSON.parse(sig.data);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal('answer', JSON.stringify(answer));
        } else if (sig.type === 'answer') {
          const answer = JSON.parse(sig.data);
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } else if (sig.type === 'ice') {
          const candidate = JSON.parse(sig.data);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.warn('[P2P] Signal processing error:', e);
      }
    }
  }, [sendSignal]);

  const initConnection = useCallback(async () => {
    if (pcRef.current) return;
    setP2pAttempted(true);

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal('ice', JSON.stringify(e.candidate.toJSON()));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setP2pConnected(false);
        setLatency(null);
        setQuality('disconnected');
        console.log('[P2P] Connection state:', pc.connectionState);
      }
    };

    if (isWhite) {
      const dc = pc.createDataChannel('chess', { ordered: true });
      setupDataChannel(dc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal('offer', JSON.stringify(offer));
    } else {
      pc.ondatachannel = (e) => {
        setupDataChannel(e.channel);
      };
    }
  }, [isWhite, sendSignal, setupDataChannel]);

  useEffect(() => {
    if (!enabled || !gameId || !userId) return;

    const timer = setTimeout(() => {
      initConnection();
    }, 1000);

    return () => clearTimeout(timer);
  }, [enabled, gameId, userId, initConnection]);

  useEffect(() => {
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (dcRef.current) {
        dcRef.current.close();
        dcRef.current = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  const sendPeerMessage = useCallback((msg: PeerMessage) => {
    if (dcRef.current?.readyState === 'open') {
      dcRef.current.send(JSON.stringify({ ...msg, ts: Date.now() }));
      return true;
    }
    return false;
  }, []);

  return {
    p2pConnected,
    p2pAttempted,
    latency,
    quality,
    sendPeerMessage,
    processSignals,
  };
};
