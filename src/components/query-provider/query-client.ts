import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient 单例，配置全局默认选项
 * 基于移动端 H5 场景进行优化配置
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 实时性优先：数据立即过期，每次组件挂载都重新请求
      staleTime: 0,
      // 非活跃查询在 5 分钟后从缓存中移除
      gcTime: 5 * 60 * 1000,
      // 移动端网络不稳定，失败后重试 1 次
      retry: 1,
      // 移动端禁用窗口聚焦时自动重新请求
      refetchOnWindowFocus: false,
      // 网络恢复时自动重新请求
      refetchOnReconnect: true,
    },
  },
});
