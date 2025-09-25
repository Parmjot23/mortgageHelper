import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserGroupIcon, ClipboardDocumentListIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getDashboardStats() {
  try {
    const [totalLeads, activeTasks, incompleteChecklists] = await Promise.all([
      prisma.lead.count(),
      prisma.task.count({ where: { status: 'OPEN' } }),
      prisma.checklist.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } })
    ])

    return {
      totalLeads,
      activeTasks,
      incompleteChecklists
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return {
      totalLeads: 0,
      activeTasks: 0,
      incompleteChecklists: 0
    }
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats()

  const dashboardStats = [
    {
      name: 'Total Leads',
      value: stats.totalLeads.toString(),
      icon: UserGroupIcon,
      href: '/leads',
      description: 'All mortgage leads'
    },
    {
      name: 'Active Tasks',
      value: stats.activeTasks.toString(),
      icon: ClockIcon,
      href: '/leads',
      description: 'Tasks to complete'
    },
    {
      name: 'Incomplete Checklists',
      value: stats.incompleteChecklists.toString(),
      icon: ClipboardDocumentListIcon,
      href: '/leads',
      description: 'Document checklists to complete'
    }
  ]

  const quickActions = [
    { name: 'Add New Lead', href: '/leads/new', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Create Task', href: '/tasks/new', color: 'bg-green-600 hover:bg-green-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your mortgage helper dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.name} href={action.href}>
                <Button className={`${action.color} text-white`}>
                  {action.name}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity yet.</p>
            <p className="text-sm">Start by adding your first lead!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
