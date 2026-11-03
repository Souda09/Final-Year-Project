import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      user: null,
      userRole: null,
      userProfile: null,
      notifications: [],
      theme: 'dark',

      setUser: (user) => set({ user }),
      setUserRole: (role) => set({ userRole: role }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearNotifications: () => set({ notifications: [] }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }))
    }),
    {
      name: 'punchtrack-store',
      partialize: (state) => ({
        notifications: state.notifications,
        theme: state.theme,
      }),
    }
  )
)

export default useStore
