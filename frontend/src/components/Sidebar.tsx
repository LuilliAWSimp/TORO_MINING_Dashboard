import { NavLink } from 'react-router-dom'
import { navigation } from '../config/navigation'

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="sidebar-brand">
        <img src="toro-mining-mark.png" alt="TORO MINING" />
      </div>
      <nav className="sidebar-nav">
        {navigation.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            aria-label={label}
            data-tooltip={label}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer" data-tooltip="MVP local">
        <span>MVP</span>
      </div>
    </aside>
  )
}
