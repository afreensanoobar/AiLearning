import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCourses } from "../hooks/useCourses";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", path: "/courses", icon: BookOpen },
  { name: "Assessment", path: "/assessment", icon: ClipboardCheck },
  { name: "AI Tutor", path: "/tutor", icon: BrainCircuit },
  { name: "My Progress", path: "/progress", icon: ChartNoAxesColumnIncreasing },
];

function courseSlug(course) {
  return course.slug || course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function AppShell({ activePage, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data } = useCourses();
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const courses = data?.courses ?? [];
  const matches = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const navigateTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <aside className="h-full w-72 bg-white p-6">
            <button onClick={() => setMenuOpen(false)} className="mb-8">
              <X />
            </button>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className="mb-3 flex w-full items-center gap-3 rounded-xl p-3 hover:bg-violet-50"
                >
                  <Icon size={19} />
                  {item.name}
                </button>
              );
            })}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl bg-violet-600 p-3 text-white">
              <BrainCircuit size={25} />
            </div>
            <div>
              <h1 className="text-lg font-bold">LearnAI</h1>
              <p className="text-xs text-slate-400">Personalized Learning</p>
            </div>
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const selected = activePage === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                      : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-12 rounded-2xl bg-violet-50 p-4">
            <Sparkles className="mb-3 text-violet-600" size={24} />
            <h3 className="font-semibold">AI Learning Assistant</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Get personalized guidance and improve your learning.
            </p>
            <button
              onClick={() => navigateTo("/tutor")}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-700"
            >
              Ask AI Tutor <ArrowUpRight size={16} />
            </button>
          </div>

          <button
            onClick={() => navigateTo("/settings")}
            className="mt-10 flex items-center gap-3 text-sm text-slate-500 hover:text-violet-700"
          >
            <Settings size={19} /> Settings
          </button>
        </aside>

        <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="mb-9 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setMenuOpen(true)}>
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-bold">
                  {activePage === "Dashboard" ? "Dashboard" : activePage}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Welcome back! Continue your learning journey.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  aria-label="Search courses"
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    setSearchQuery("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <Search size={19} />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-14 z-50 w-72 rounded-xl border bg-white p-3 shadow-xl">
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search courses or topics..."
                      className="w-full rounded-lg border p-3 text-sm outline-none focus:border-violet-500"
                    />
                    {searchQuery.trim() && (
                      <div className="mt-2 space-y-1">
                        {matches.map((course) => (
                          <button
                            key={course._id}
                            onClick={() => {
                              navigateTo(`/courses/${courseSlug(course)}`);
                              setSearchOpen(false);
                            }}
                            className="block w-full rounded-lg p-2 text-left text-sm hover:bg-violet-50"
                          >
                            {course.title}
                          </button>
                        ))}
                        {matches.length === 0 && (
                          <p className="p-2 text-sm text-slate-500">
                            {data ? "No results found." : "Courses are unavailable."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                  onClick={() => {
                    setNotificationOpen((open) => !open);
                    if (!notificationOpen) void notificationsQuery.refetch();
                  }}
                  className="relative rounded-xl border border-slate-200 bg-white p-3"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 top-14 z-50 w-80 max-w-[90vw] rounded-2xl border bg-white p-4 shadow-xl">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <h3 className="font-bold">Notifications</h3>
                      <button
                        type="button"
                        disabled={unreadCount === 0 || markAllRead.isPending}
                        onClick={() => markAllRead.mutate()}
                        className="text-xs font-semibold text-violet-700 disabled:text-slate-400"
                      >
                        Mark all read
                      </button>
                    </div>
                    {(markRead.error || markAllRead.error) && (
                      <p role="alert" className="mb-3 text-xs text-red-700">
                        {(markRead.error || markAllRead.error).message}
                      </p>
                    )}
                    {notificationsQuery.isPending ? (
                      <p
                        role="status"
                        className="py-5 text-center text-sm text-slate-500"
                      >
                        Loading notifications...
                      </p>
                    ) : notificationsQuery.isError ? (
                      <p role="alert" className="py-5 text-center text-sm text-red-700">
                        {notificationsQuery.error.message}
                      </p>
                    ) : notifications.length === 0 ? (
                      <p className="py-5 text-center text-sm text-slate-500">
                        No notifications yet.
                      </p>
                    ) : (
                      <div className="max-h-80 space-y-2 overflow-y-auto">
                        {notifications.map((notification) => (
                          <button
                            type="button"
                            key={notification.id}
                            disabled={notification.read || markRead.isPending}
                            onClick={() => markRead.mutate(notification.id)}
                            className={`w-full rounded-xl p-3 text-left ${
                              notification.read ? "bg-white" : "bg-violet-50"
                            }`}
                          >
                            <span className="flex items-start justify-between gap-2">
                              <span className="text-sm font-semibold">
                                {notification.title}
                              </span>
                              {!notification.read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                              )}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              {notification.message}
                            </span>
                            <span className="mt-2 block text-[10px] text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  aria-label="Account menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700"
                >
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </button>
                <div className="absolute right-0 top-12 z-50 hidden w-48 rounded-xl border bg-white p-2 shadow-lg group-hover:block">
                  <p className="px-3 py-2 text-sm font-semibold">{user?.name}</p>
                  <button
                    onClick={() => navigateTo("/settings")}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-violet-50"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() =>
                      void logout().catch((error) =>
                        console.error("Unable to log out:", error)
                      )
                    }
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
