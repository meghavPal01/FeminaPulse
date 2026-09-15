import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrandMarkOnDark, Wordmark, SideNavIcons } from "./Icons";
import { useApp } from "../context/AppContext";

const navItems = [
  { to: "dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "log", label: "Daily log", icon: "log" },
  { to: "risk", label: "Risk Assesment", icon: "risk" },
  { to: "recommendations", label: "Recommendations", icon: "recommendations" },
  { to: "knowledge", label: "Knowledge centre", icon: "knowledge" },
  { to: "profile", label: "Profile", icon: "profile" },
];

export default function AppLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const displayName = user?.name || "Guest";
  const initials =
    displayName
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="grid md:grid-cols-[240px_1fr] min-h-screen">
      <div className="hidden md:flex flex-col gap-1.5 bg-wine-dark text-white p-[26px_18px] sticky top-0 h-screen">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-serif text-[19px] font-semibold text-white px-2.5 pb-6 hover:opacity-90"
        >
          <BrandMarkOnDark />
          <Wordmark />
        </Link>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14.5px] font-medium ${
                isActive
                  ? "bg-white/[0.14] text-white"
                  : "text-white/70 hover:bg-white/[0.06] hover:text-white"
              }`
            }
          >
            <span className="w-[18px] h-[18px] flex-none">
              {SideNavIcons[item.icon]}
            </span>
            {item.label}
          </NavLink>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="w-[34px] h-[34px] rounded-full bg-rose flex items-center justify-center font-semibold text-[13px] text-white flex-none">
              {initials}
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-white">
                {displayName}
              </div>
              <div className="text-[11.5px] text-white/55">
                {user?.email || "guest@feminapulse.app"}
              </div>
            </div>
          </div>
          <a
            className="text-[13px] text-white/55 hover:text-white px-2.5 pt-2 block cursor-pointer"
            onClick={handleLogout}
          >
            Log out
          </a>
        </div>
      </div>

      <div className="p-6 md:p-[34px_44px_60px] max-w-[1180px]">
        <Outlet />
      </div>
    </div>
  );
}
