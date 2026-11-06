import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import I18nDemo from '@/components/test';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="index-wrap">
      <h2>🏠 Home</h2>
      <p>
        loading:
        {t('loading')}
      </p>
      <p>
        confirm:
        {t('confirm')}
      </p>

      <div
        onClick={() => {
          navigate({
            to: '/about',
            search: { type: 'c' },
          });
        }}
      >
        → Go to About
      </div>

      <I18nDemo />
    </div>
  );
}
