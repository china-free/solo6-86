import { NavLink, Outlet } from 'react-router-dom';
import { CalendarCheck, ShoppingCart, BookTemplate, FileDown, Users, UtensilsCrossed } from 'lucide-react';
import { useCollabStore } from '@/store/useCollabStore';

const navItems = [
  { path: '/', label: '菜单计划', icon: CalendarCheck },
  { path: '/shopping-list', label: '购物清单', icon: ShoppingCart },
  { path: '/templates', label: '菜单模板', icon: BookTemplate },
  { path: '/export', label: '导出打印', icon: FileDown },
  { path: '/collaboration', label: '家庭协作', icon: Users },
];

const Layout = () => {
  const { members, currentMemberId, isCollaborating } = useCollabStore();
  const currentMember = members.find((m) => m.id === currentMemberId);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-50 glass border-b border-cream-200 no-print">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl shadow-card">
                <UtensilsCrossed size={22} />
              </div>
              <div>
                <h1 className="font-display text-xl text-primary-700 leading-tight">
                  家庭菜单
                </h1>
                <p className="text-xs text-primary-600/60">每周饮食好帮手</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-primary-600/70 hover:bg-primary-50 hover:text-primary-700'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isCollaborating && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-700 font-medium">协作中</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {members
                  .filter((m) => m.isOnline)
                  .slice(0, 3)
                  .map((member, index) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-sm"
                      style={{
                        backgroundColor: member.color + '20',
                        color: member.color,
                        marginLeft: index > 0 ? '-8px' : '0',
                      }}
                      title={member.name}
                    >
                      {member.avatar}
                    </div>
                  ))}
              </div>
              {currentMember && (
                <span className="hidden sm:text-sm text-primary-700 font-medium">
                  {currentMember.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-cream-200 md:hidden no-print">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-primary-600/50'
                }`
              }
            >
              <item.icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default Layout;
