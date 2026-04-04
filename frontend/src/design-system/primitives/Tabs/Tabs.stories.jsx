import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'


export default {
  title: 'Primitives/Tabs',
  tags: ['autodocs'],
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultValue: 'account',
  },
  argTypes: {
    defaultValue: {
      control: 'text',
    },
  },
}

export const Default = {
  render: (args) => (
    <div className="w-[420px] rounded-xl border border-zinc-200 bg-white p-4">
      <Tabs {...args}>
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">Account</h3>
            <p className="text-sm text-zinc-600">
              Manage your profile and personal information.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="password" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">Password</h3>
            <p className="text-sm text-zinc-600">
              Update your password and security preferences.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">Notifications</h3>
            <p className="text-sm text-zinc-600">
              Choose how you want to receive updates.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

export const Filled = {
  args: {
    defaultValue: 'overview',
  },
  render: (args) => (
    <div className="w-[420px] rounded-xl border border-zinc-200 bg-white p-4">
      <Tabs {...args}>
        <TabsList variant="filled" className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">Overview</h3>
            <p className="text-sm text-zinc-600">
              Quick summary with general product metrics.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">Analytics</h3>
            <p className="text-sm text-zinc-600">
              Explore performance and engagement data.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">Reports</h3>
            <p className="text-sm text-zinc-600">
              Access exported data and scheduled reports.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

export const Disabled = {
  args: {
    defaultValue: 'general',
  },
  render: (args) => (
    <div className="w-[420px] rounded-xl border border-zinc-200 bg-white p-4">
      <Tabs {...args}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing" disabled>
            Billing
          </TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">General</h3>
            <p className="text-sm text-zinc-600">
              Basic workspace settings and preferences.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="security" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-900">Security</h3>
            <p className="text-sm text-zinc-600">
              Configure authentication and access control.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

export const WithForm = {
  args: {
    defaultValue: 'profile',
  },
  render: (args) => (
    <div className="w-[460px] rounded-xl border border-zinc-200 bg-white p-4">
      <Tabs {...args}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-900">
                Name
              </label>
              <input
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none"
                defaultValue="Erick Ramos"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-900">
                Email
              </label>
              <input
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none"
                defaultValue="erick@email.com"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="rounded-lg border border-zinc-200 p-4">
          <div className="space-y-2 text-sm text-zinc-600">
            <p>Invite and manage collaborators.</p>
            <p>Set permissions for each team member.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}