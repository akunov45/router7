import { Suspense } from 'react';
import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  useLoaderData,
  useRouteError,
} from 'react-router-dom';

const isAuthenticated = () => {
  return localStorage.getItem("auth") === "true";
};

const LoginPage = () => {
  const handleLogin = () => {
    localStorage.setItem("auth", "true");
    window.location.href = "/users";
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/users">Users</Link></li>
        </ul>
      </nav>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
      <hr />
    </>
  );
};

async function usersLoader() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Response(error.message, { status: 500 });
  }
}

const ErrorPage = () => {
  const error = useRouteError();
  return (
    <div>
      <h1>Ошибка!</h1>
      <p>{error?.message || "Что-то пошло не так"}</p>
    </div>
  );
};

export default function UsersPage() {
  const users = useLoaderData();

  return (
    <div>
      <h1>Пользователи</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/user/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const UserDetailPage = () => {
  const user = useLoaderData();

  return (
    <div>
      <h3>User Detail</h3>
      <pre>
        {JSON.stringify(user, null, 4)}
      </pre>
    </div>
  );
};

async function userLoader({ params }) {
  if (!params.id) throw new Error("ID пользователя не указан");
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${params.id}`);
  if (!res.ok) throw new Error("Ошибка загрузки пользователя");
  return res.json();
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <h3>Home</h3>, errorElement: <ErrorPage />, },
      { path: "about", element: <h3>About</h3>, errorElement: <ErrorPage />, },
      { path: "login", element: <LoginPage />, errorElement: <ErrorPage />, },
      {
        path: "users", element: (
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        loader: usersLoader
      },
      {
        path: "user/:id", element: (
          <PrivateRoute>
            <UserDetailPage />
          </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        loader: userLoader
      },
      { path: "*", element: <h3>Not Found</h3> },
    ],
  },
]);

