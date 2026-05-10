import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // 用户认证状态
      user: null,
      isAuthenticated: false,
      users: [], // 模拟用户存储

      // 登录方法
      login: (email, password) => {
        const { users } = get();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          set({
            user,
            isAuthenticated: true
          });
          return true;
        }
        return false;
      },

      // 注册方法
      register: (email, password) => {
        const { users } = get();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          return false;
        }
        const newUser = {
          id: Date.now(),
          email,
          password
        };
        set({
          users: [...users, newUser]
        });
        return true;
      },

      // 登出方法
      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      },

      // 关卡进度状态
      currentLevel: 1,
      completedLevels: [],
      completeLevel: () => {
        const { currentLevel, completedLevels } = get();
        if (!completedLevels.includes(currentLevel)) {
          set({
            completedLevels: [...completedLevels, currentLevel],
            currentLevel: currentLevel + 1
          });
        }
      },
      resetProgress: () => {
        set({
          currentLevel: 1,
          completedLevels: []
        });
      }
    }),
    {
      name: 'releaseweb-storage'
    }
  )
);

export { useStore };