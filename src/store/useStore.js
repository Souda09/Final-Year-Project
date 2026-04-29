import { create } from 'zustand'

const useStore = create((set) => ({
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
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }))
}))

export default useStore