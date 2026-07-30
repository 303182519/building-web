import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';

interface IQueryProviderProps {
  /** 子组件 */
  children: ReactNode;
}

/**
 * 全局 QueryProvider 组件
 * 为应用提供 TanStack Query 的数据缓存与状态管理能力
 * 所有页面入口的根组件必须包裹此 Provider
 */
export function QueryProvider({ children }: IQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
