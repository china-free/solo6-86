import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyMember } from '@/types';
import type { SyncEvent, SyncRequestPayload, SyncResponsePayload } from '@/types/sync';
import { generateId } from '@/utils/date';
import { collaboration } from '@/utils/collaboration';
import { useMealStore } from './useMealStore';
import { useShoppingStore } from './useShoppingStore';

interface CollabState {
  members: FamilyMember[];
  currentMemberId: string;
  collabCode: string;
  isCollaborating: boolean;
  addMember: (name: string, avatar: string, color: string, isAdmin?: boolean) => void;
  removeMember: (id: string) => void;
  setCurrentMember: (id: string) => void;
  generateCollabCode: () => string;
  resetCollabCode: () => void;
  startCollaboration: () => void;
  stopCollaboration: () => void;
  broadcastEvent: (type: string, payload: unknown) => void;
  updateMemberActive: (id: string) => void;
  registerListener: (type: string, listener: (event: SyncEvent) => void) => () => void;
  requestSync: () => void;
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
        const { currentMemberId, members } = get();

        collaboration.init(currentMemberId);

        const current = members.find((m) => m.id === currentMemberId);

        if (current) {
          get().broadcastEvent('MEMBER_JOIN', { member: current });
        }

        get().broadcastEvent('SYNC_REQUEST', { requestMemberId: currentMemberId });

        collaboration.on('MEMBER_JOIN', (event) => {
          const payload = event.payload as { member: FamilyMember };
          const member = payload.member;
          set((state) => {
            const exists = state.members.some((m) => m.id === event.memberId);
            if (exists) {
              return {
                members: state.members.map((m) =>
                  m.id === event.memberId
                    ? { ...m, isOnline: true, lastActive: Date.now() }
                    : m
                ),
              };
            }
            return {
              members: [
                ...state.members,
                {
                  ...member,
                  id: event.memberId,
                  isOnline: true,
                  lastActive: Date.now(),
                },
              ],
            };
          });
        });

        collaboration.on('MEMBER_HEARTBEAT', (event) => {
          set((state) => ({
            members: state.members.map((m) =>
              m.id === event.memberId
                ? { ...m, isOnline: true, lastActive: Date.now() }
                : m
            ),
          }));
        });

        collaboration.on('MEMBER_LEAVE', (event) => {
          set((state) => ({
            members: state.members.map((m) =>
              m.id === event.memberId ? { ...m, isOnline: false } : m
            ),
          }));
        });

        collaboration.on('SYNC_REQUEST', (event) => {
          const payload = event.payload as unknown as SyncRequestPayload;
          const { requestMemberId } = payload;
          const { currentMemberId } = get();

          if (requestMemberId !== currentMemberId) {
            const mealState = useMealStore.getState();
            const shoppingState = useShoppingStore.getState();

            const payload: SyncResponsePayload = {
              memberId: currentMemberId,
              mealState: {
                currentDate: mealState.currentDate.toISOString(),
                weekKey: mealState.weekKey,
                days: mealState.days,
              },
              shoppingState: {
                items: shoppingState.items,
                activeCategory: shoppingState.activeCategory,
              },
            };

            get().broadcastEvent('SYNC_RESPONSE', payload);
          }
        });

        collaboration.on('SYNC_RESPONSE', (event) => {
          const payload = event.payload as unknown as SyncResponsePayload;
          const { currentMemberId } = get();

          if (payload.memberId !== currentMemberId) {
            useMealStore.getState().syncFromRemote(
              new Date(payload.mealState.currentDate),
              payload.mealState.weekKey,
              payload.mealState.days
            );
            useShoppingStore.getState().syncFromRemote(
              payload.shoppingState.items,
              payload.shoppingState.activeCategory
            );
          }
        });

        set({ isCollaborating: true });

        const heartbeat = setInterval(() => {
          const { isCollaborating } = get();
          if (!isCollaborating) {
            clearInterval(heartbeat);
            return;
          }
          get().broadcastEvent('MEMBER_HEARTBEAT', {});
        }, 10000);

        const offlineCheck = setInterval(() => {
          const { members } = get();
          const now = Date.now();
          set({
            members: members.map((m) => ({
              ...m,
              isOnline: now - m.lastActive < 30000,
            })),
          });
        }, 15000);
      },

      stopCollaboration: () => {
        const { currentMemberId } = get();
        get().broadcastEvent('MEMBER_LEAVE', { memberId: currentMemberId });
        collaboration.close();
        set({ isCollaborating: false });
      },

      broadcastEvent: (type, payload) => {
        collaboration.broadcast(type as never, payload);
      },

      updateMemberActive: (id) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, lastActive: Date.now() } : m
          ),
        }));
      },

      registerListener: (type, listener) => {
        return collaboration.on(type as never, listener);
      },

      requestSync: () => {
        const { currentMemberId } = get();
        get().broadcastEvent('SYNC_REQUEST', { requestMemberId: currentMemberId });
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
