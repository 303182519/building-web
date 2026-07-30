import {
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="page--wrap">
      <div className="page--header">
        导航
      </div>

      <div className="page--body">
        <Outlet />
      </div>
    </div>
  );
}
