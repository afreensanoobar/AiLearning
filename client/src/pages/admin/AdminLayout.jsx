import { NavLink, Outlet } from "react-router-dom";
import AppShell from "../../layout/AppShell";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/questions", label: "Questions" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  return (
    <AppShell activePage="Admin">
      <nav className="mb-6 flex flex-wrap gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </AppShell>
  );
}
