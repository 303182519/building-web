import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/about/')({
  component: AboutComponent,
});

function AboutComponent() {
  const navigate = useNavigate();

  return (
    <div className="p-2">
      <div>about页面</div>
      <h3 onClick={() => {
        navigate({
          to: '/',
        });
      }}
      >
        返回
      </h3>
    </div>
  );
}
