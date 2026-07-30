import type { ComponentType } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import ReactDOM from 'react-dom/client';
import { QueryProvider } from '@/components/query-provider';
import '../../global.scss';

const mode = import.meta.env.PUBLIC_ENV;
console.log('PUBLIC_ENV', mode);

/**
 * 创建应用入口函数
 * @param {ComponentType} PageComponent - 页面组件
 */
export default function createEntry(PageComponent: ComponentType) {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    // <React.StrictMode>
    <QueryProvider>
      <NiceModal.Provider>
        <PageComponent />
      </NiceModal.Provider>
    </QueryProvider>,
    // </React.StrictMode>,
  );
}
