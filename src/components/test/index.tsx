import type { SupportedLng } from '@/i18n';
import { useTranslation } from 'react-i18next';
import { changeLng, SUPPORTED_LNGS } from '@/i18n';

/**
 * i18n 功能演示组件：
 * - 展示默认命名空间 common 的嵌套 key 取值
 * - 一键切换语言，自动写入 localStorage（跨页面保持）
 * - querystring ?lang=en-us 也能强制切换
 */
export default function I18nDemo() {
  const { t, i18n } = useTranslation();
  // 第二个命名空间：user
  const { t: tUser } = useTranslation('user');
  const currentLng = i18n.language as SupportedLng;

  return (
    <div style={{ padding: 16, border: '1px dashed #ccc', margin: 12 }}>
      <h3>🌐 i18n Demo</h3>
      <p>
        当前语言：
        <strong>{currentLng}</strong>
      </p>
      <p>
        common:lang.label →
        {t('common:lang.label')}
      </p>
      <p>
        common:loading →
        {t('common:loading')}
      </p>
      <p>
        common:confirm →
        {t('common:confirm')}
      </p>
      <p>
        common:error.network →
        {t('common:error.network')}
      </p>

      <h4 style={{ marginTop: 12 }}>user 命名空间</h4>
      <p>
        user:title →
        {tUser('title')}
      </p>
      <p>
        user:name →
        {tUser('name')}
      </p>
      <p>
        user:profile.avatar →
        {tUser('profile.avatar')}
      </p>
      <p>
        user:profile.bio（跨命名空间写法）→
        {t('user:profile.bio')}
      </p>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {SUPPORTED_LNGS.map(lng => (
          <button
            key={lng}
            onClick={() => changeLng(lng)}
            style={{
              padding: '6px 12px',
              background: currentLng === lng ? '#1677ff' : '#eee',
              color: currentLng === lng ? '#fff' : '#000',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {t(`common:lang.${lng}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
