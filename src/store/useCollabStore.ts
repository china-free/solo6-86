import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyMember } from '@/types';
import { generateId } from '@/utils/date';

interface CollabState {
  members: FamilyMember[];
  currentMemberId: string;
  collabCode: string;
  isCollaborating: boolean;
  channel: BroadcastChannel | null;
  initChannel: () => void;
  addMember: (name: string, avatar: string, color: string, isAdmin?: boolean) => void;
  removeMember: (id: string) => void;
  setCurrentMember: (id: string) => void;
  generateCollabCode: () => string;
  resetCollabCode: () => void;
  startCollaboration: () => void;
  stopCollaboration: () => void;
  broadcastUpdate: (type: string, payload: unknown) => void;
  updateMemberActive: (id: string) => void;
}

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: 'member-1',
    name: '我',
    avatar: '🧑',
    color: '#2D5A27',
    isAdmin: true,
    isOnline: true,
    lastActive: Date.now(),
  },
];

export const useCollabStore = create<CollabState>()(
  persist(
    (set, get) => ({
      members: DEFAULT_MEMBERS,
      currentMemberId: 'member-1',
      collabCode: '',
      isCollaborating: false,
      channel: null,

      initChannel: () => {
        if (typeof window === 'undefined' || get().channel) return;

        const channel = new BroadcastChannel('family-meal-planner');

        channel.onmessage = (event) => {
          const { type, payload, memberId } = event.data;

          switch (type) {
            case 'MEMBER_JOIN':
              set((state) => {
                const exists = state.members.some((m) => m.id === memberId);
                if (exists) {
                  return {
                    members: state.members.map((m) =>
                      m.id === memberId
                        ? { ...m, isOnline: true, lastActive: Date.now() }
                        : m
                    ),
                  };
                }
                return {
                  members: [
                    ...state.members,
                    {
                      ...payload,
                      id: memberId,
                      isOnline: true,
                      lastActive: Date.now(),
                    },
                  ],
                };
              });
              break;
            case 'MEMBER_HEARTBEAT':
              set((state) => ({
                members: state.members.map((m) =>
                  m.id === memberId
                    ? { ...m, isOnline: true, lastActive: Date.now() }
                    : m
                ),
              }));
              break;
            case 'MEMBER_LEAVE':
              set((state) => ({
                members: state.members.map((m) =>
                  m.id === memberId ? { ...m, isOnline: false } : m
                ),
              }));
              break;
          }
        };

        set({ channel });
      },

      addMember: (name, avatar, color, isAdmin = false) => {
        const newMember: FamilyMember = {
          id: generateId(),
          name,
          avatar,
          color,
          isAdmin,
          isOnline: false,
          lastActive: 0,
        };
        set((state) => ({
          members: [...state.members, newMember],
        }));
      },

      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
      },

      setCurrentMember: (id) => {
        set({ currentMemberId: id });
      },

      generateCollabCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        set({ collabCode: code });
        return code;
      },

      resetCollabCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        set({ collabCode: code });
      },

      startCollaboration: () => {
        const { initChannel, channel, currentMemberId, members } = get();
        initChannel();

        const current = members.find((m) => m.id === currentMemberId);
        if (channel && current) {
          channel.postMessage({
            type: 'MEMBER_JOIN',
            memberId: currentMemberId,
            payload: current,
          });
        }

        set({ isCollaborating: true });

        const heartbeat = setInterval(() => {
          const { channel, currentMemberId, isCollaborating } = get();
          if (!isCollaborating) {
            clearInterval(heartbeat);
            return;
          }
          if (channel) {
            channel.postMessage({
              type: 'MEMBER_HEARTBEAT',
              memberId: currentMemberId,
            });
          }
        }, 10000);
      },

      stopCollaboration: () => {
        const { channel, currentMemberId } = get();
        if (channel) {
          channel.postMessage({
            type: 'MEMBER_LEAVE',
            memberId: currentMemberId,
          });
        }
        set({ isCollaborating: false });
      },

      broadcastUpdate: (type, payload) => {
        const { channel, currentMemberId } = get();
        if (channel) {
          channel.postMessage({
            type,
            memberId: currentMemberId,
            payload,
          });
        }
      },

      updateMemberActive: (id) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, lastActive: Date.now() } : m
          ),
        }));
      },
    }),
    {
      name: 'collab-storage',
      partialize: (state) => ({
        members: state.members,
        currentMemberId: state.currentMemberId,
        collabCode: state.collabCode,
      }),
    }
  )
);
