import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const navigate = useNavigate();

  return (
    <div className="index-wrap">
      <div>首页</div>
      <div onClick={() => {
        navigate({
          to: '/about',
          search: { type: 'c' },
        });
      }}
      >
        去关于的页面
      </div>
    </div>
  );
}
