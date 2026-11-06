import type { ComponentType } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import ReactDOM from 'react-dom/client';
import { QueryProvider } from '@/components/query-provider';
import { initI18n } from '@/i18n';
import '../../global.scss';

const mode = import.meta.env.PUBLIC_ENV;
console.log('PUBLIC_ENV', mode);

/**
 * 创建应用入口函数
 * 初始化 i18n → 挂载 React，i18n 资源懒加载完成后再渲染，
 * 保证页面首次 render 时 t() 已经能拿到正确文案。
 *
 * @param {ComponentType} PageComponent - 页面组件
 */
export default async function createEntry(PageComponent: ComponentType) {
  await initI18n();

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
