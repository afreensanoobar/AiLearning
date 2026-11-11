import { useEffect, useRef, useState } from "react";
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
  Shield,
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
  const [accountOpen, setAccountOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuPanelRef = useRef(null);
  const wasMenuOpen = useRef(false);
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
  const menuItems = [
    ...navigation,
    ...(user?.role === "admin" ? [{ name: "Admin", path: "/admin", icon: Shield }] : []),
  ];

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpen.current) menuButtonRef.current?.focus();
      wasMenuOpen.current = false;
      return undefined;
    }

    wasMenuOpen.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuPanelRef.current?.querySelector("button:not(:disabled)")?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const controls = menuPanelRef.current?.querySelectorAll(
        "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled)"
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const navigateTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[2px] lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false);
          }}
        >
          <aside
            ref={menuPanelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="h-full w-[min(20rem,85vw)] border-r border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-sm font-bold tracking-tight">LearnAI</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const selected = activePage === item.name;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  aria-current={selected ? "page" : undefined}
                  className={`mb-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    selected
                      ? "bg-violet-50 text-violet-800"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon aria-hidden="true" size={19} />
                  {item.name}
                </button>
              );
            })}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white/90 p-5 lg:flex">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="rounded-xl bg-violet-600 p-2.5 text-white shadow-sm shadow-violet-200">
              <BrainCircuit aria-hidden="true" size={22} />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">LearnAI</p>
              <p className="text-xs text-slate-500">Learn at your pace</p>
            </div>
          </div>

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Learning
          </p>
          <nav aria-label="Main navigation" className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const selected = activePage === item.name;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  aria-current={selected ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? "bg-violet-50 text-violet-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-violet-700"
                  }`}
                >
                  <Icon aria-hidden="true" size={19} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
            <Sparkles aria-hidden="true" className="mb-3 text-violet-600" size={22} />
            <h3 className="text-sm font-semibold">Need a hand?</h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Get personalized guidance and improve your learning.
            </p>
            <button
              type="button"
              onClick={() => navigateTo("/tutor")}
              className="mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
            >
              Ask AI Tutor <ArrowUpRight aria-hidden="true" size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateTo("/settings")}
            aria-current={activePage === "Settings" ? "page" : undefined}
            className="mt-4 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-violet-700"
          >
            <Settings aria-hidden="true" size={19} /> Settings
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9">
          <header className="mb-8 flex items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                ref={menuButtonRef}
                type="button"
                aria-label="Open navigation"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
                onClick={() => setMenuOpen(true)}
              >
                <Menu aria-hidden="true" size={20} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-violet-700">
                  {activePage}
                </p>
                <h2 className="mt-1 max-w-[calc(100vw-13rem)] truncate text-xl font-bold tracking-tight text-slate-800 sm:max-w-none sm:text-2xl">
                  {activePage === "Dashboard"
                    ? `Welcome back, ${user?.name?.split(" ")[0] || "learner"}`
                    : activePage}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  type="button"
                  aria-label="Search courses"
                  aria-controls="course-search-panel"
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    setSearchQuery("");
                  }}
                  aria-expanded={searchOpen}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  <Search aria-hidden="true" size={19} />
                </button>
                {searchOpen && (
                  <div
                    id="course-search-panel"
                    className="absolute right-0 top-14 z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                  >
                    <label className="sr-only" htmlFor="course-search">
                      Search courses
                    </label>
                    <input
                      id="course-search"
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
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                  aria-controls="notifications-panel"
                  onClick={() => {
                    setNotificationOpen((open) => !open);
                    if (!notificationOpen) void notificationsQuery.refetch();
                  }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  <Bell aria-hidden="true" size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div
                    id="notifications-panel"
                    className="absolute right-0 top-14 z-50 w-80 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
                  >
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

              <div
                className="relative"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setAccountOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-controls="account-menu"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-800 transition hover:bg-violet-200"
                >
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </button>
                {accountOpen && (
                  <div
                    id="account-menu"
                    className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    <p className="px-3 py-2 text-sm font-semibold text-slate-800">
                      {user?.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigateTo("/settings");
                      }}
                      className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-violet-50"
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void logout()
                          .then(() => setAccountOpen(false))
                          .catch((error) => console.error("Unable to log out:", error))
                      }
                      className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-sm text-red-700 transition hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
