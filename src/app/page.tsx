import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserGroupIcon, ClipboardDocumentListIcon, ClockIcon, ExclamationCircleIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getDashboardStats() {
  try {
    const [applicationStats, activeTasks, incompleteChecklists] = await Promise.all([
      // Get counts by application status
      prisma.lead.groupBy({
        by: ['applicationStatus'],
        _count: {
          applicationStatus: true,
        },
      }),
      prisma.task.count({ where: { status: 'OPEN' } }),
      prisma.checklist.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } })
    ])

    // Transform the grouped data into a more usable format
    const statusCounts = {
      NOT_CONTACTED: 0,
      CONTACTED: 0,
      IN_PROGRESS: 0,
      CONDITIONAL_APPROVED: 0,
      APPROVED: 0,
    }

    applicationStats.forEach(stat => {
      statusCounts[stat.applicationStatus as keyof typeof statusCounts] = stat._count.applicationStatus
    })

    const totalLeads = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

    return {
      totalLeads,
      statusCounts,
      activeTasks,
      incompleteChecklists
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return {
      totalLeads: 0,
      statusCounts: {
        NOT_CONTACTED: 0,
        CONTACTED: 0,
        IN_PROGRESS: 0,
        CONDITIONAL_APPROVED: 0,
        APPROVED: 0,
      },
      activeTasks: 0,
      incompleteChecklists: 0
    }
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats()

  const applicationStatusCards = [
    {
      name: 'Not Contacted',
      value: stats.statusCounts.NOT_CONTACTED.toString(),
      icon: QuestionMarkCircleIcon,
      href: '/leads?status=NOT_CONTACTED',
      description: 'Leads not yet contacted',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    },
    {
      name: 'Contacted',
      value: stats.statusCounts.CONTACTED.toString(),
      icon: UserGroupIcon,
      href: '/leads?status=CONTACTED',
      description: 'Leads that have been contacted',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      name: 'In Progress',
      value: stats.statusCounts.IN_PROGRESS.toString(),
      icon: ClockIcon,
      href: '/leads?status=IN_PROGRESS',
      description: 'Applications currently in progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Conditional Approved',
      value: stats.statusCounts.CONDITIONAL_APPROVED.toString(),
      icon: ExclamationCircleIcon,
      href: '/leads?status=CONDITIONAL_APPROVED',
      description: 'Applications conditionally approved',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Approved',
      value: stats.statusCounts.APPROVED.toString(),
      icon: CheckCircleIcon,
      href: '/leads?status=APPROVED',
      description: 'Applications fully approved',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
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

      {/* Application Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {applicationStatusCards.map((status) => (
          <Link key={status.name} href={status.href}>
            <Card className={`${status.bgColor} hover:shadow-md transition-shadow cursor-pointer border-0`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {status.name}
                </CardTitle>
                <status.icon className={`h-5 w-5 ${status.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{status.value}</div>
                <p className="text-xs text-gray-500">{status.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Leads
            </CardTitle>
            <UserGroupIcon className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
            <p className="text-xs text-gray-500">All mortgage leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Tasks
            </CardTitle>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.activeTasks}</div>
            <p className="text-xs text-gray-500">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Incomplete Checklists
            </CardTitle>
            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.incompleteChecklists}</div>
            <p className="text-xs text-gray-500">Document checklists to complete</p>
          </CardContent>
        </Card>
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
