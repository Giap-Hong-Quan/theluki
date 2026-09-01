import { NavLink } from "react-router-dom";
import logoImg from "../../assets/image/logo.png";
import { SIDEBAR_MENU } from "../../constants/navigation";

const Sidebar = () => {
  return (
    <aside className="w-64 min-w-64 h-screen bg-[#111110] text-[#e4e4e4]  flex flex-col select-none border-r border-[#222220] rounded-none">
      {/* 1. Header Brand */}
      <div className="px-6 py-5 flex flex-col items-start border-b border-[#222220]">
        <img
          src={logoImg}
          alt="THE LUKI Logo"
          className="h-8 w-auto object-contain brightness-0 invert"
        />
      </div>

      {/* 2. Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {SIDEBAR_MENU.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {/* Tiêu đề nhóm */}
            <h2 className="px-3 text-[11px] font-mono font-semibold tracking-widest text-[#666258] uppercase mb-2">
              {group.groupTitle}
            </h2>

            {/* Danh sách items con */}
            <div className="space-y-0.5">
              {group.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2 text-[13.5px] rounded-none transition-colors duration-150 ${
                      isActive
                        ? "bg-[#1c1c1a] text-white font-medium border-l-2 border-white pl-2.5 shadow-sm"
                        : "text-[#969288] hover:text-white hover:bg-[#171715] border-l-2 border-transparent pl-2.5"
                    }`
                  }
                >
                  <span className="truncate">{item.title}</span>

                  {/* Badge số lượng thông báo */}
                  {item.badge !== undefined && (
                    <span className="text-xs font-mono text-[#d9532f] font-semibold ml-2 group-hover:brightness-125 transition-all">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;