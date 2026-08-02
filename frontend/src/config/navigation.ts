import {
  Activity,
  AlertTriangle,
  BarChart3,
  Droplets,
  FileText,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Zap,
} from 'lucide-react'

export const navigation = [
  { path: '/', label: 'Resumen', icon: Gauge },
  { path: '/ejecutivo', label: 'Ejecutivo', icon: LayoutDashboard },
  { path: '/proceso', label: 'Proceso', icon: GitBranch },
  { path: '/energia', label: 'Energía', icon: Zap },
  { path: '/produccion', label: 'Producción', icon: BarChart3 },
  { path: '/agua-jales', label: 'Agua y jales', icon: Droplets },
  { path: '/alarmas', label: 'Alarmas', icon: AlertTriangle },
  { path: '/reportes', label: 'Reportes', icon: FileText },
] as const

export const statusIcon = Activity
