import { useState } from 'react';
import {
  Users,
  Shield,
  BarChart3,
  UserPlus,
  Settings,
  Crown,
  User,
  UserCheck,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
  permissions: string[];
}

interface TeamRole {
  name: string;
  permissions: string[];
  memberCount: number;
  description: string;
}

const ROLES: TeamRole[] = [
  {
    name: 'Owner',
    permissions: ['all'],
    memberCount: 1,
    description: 'Full access to all team features and settings',
  },
  {
    name: 'Admin',
    permissions: [
      'manage_subscriptions',
      'manage_members',
      'view_analytics',
      'export_data',
    ],
    memberCount: 2,
    description: 'Can manage subscriptions, members, and view analytics',
  },
  {
    name: 'Member',
    permissions: ['view_subscriptions', 'edit_subscriptions', 'view_analytics'],
    memberCount: 5,
    description: 'Can view and edit subscriptions, view analytics',
  },
  {
    name: 'Viewer',
    permissions: ['view_subscriptions', 'view_analytics'],
    memberCount: 3,
    description: 'Read-only access to subscriptions and analytics',
  },
];

const PERMISSIONS = [
  { id: 'view_subscriptions', label: 'View Subscriptions' },
  { id: 'edit_subscriptions', label: 'Edit Subscriptions' },
  { id: 'manage_subscriptions', label: 'Manage Subscriptions' },
  { id: 'view_analytics', label: 'View Analytics' },
  { id: 'export_data', label: 'Export Data' },
  { id: 'manage_members', label: 'Manage Team Members' },
  { id: 'billing_access', label: 'Billing Access' },
  { id: 'settings_access', label: 'Settings Access' },
];

export function AdvancedTeamFeatures() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      status: 'active',
      joinedAt: '2024-01-15',
      lastActive: '2024-01-27',
      permissions: ['all'],
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-01-20',
      lastActive: '2024-01-26',
      permissions: [
        'manage_subscriptions',
        'manage_members',
        'view_analytics',
        'export_data',
      ],
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'member',
      status: 'active',
      joinedAt: '2024-01-22',
      lastActive: '2024-01-25',
      permissions: [
        'view_subscriptions',
        'edit_subscriptions',
        'view_analytics',
      ],
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [saving, setSaving] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <User className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <UserCheck className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
    );
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole as any,
        status: 'pending',
        joinedAt: new Date().toISOString().split('T')[0],
        lastActive: '-',
        permissions:
          ROLES.find(r => r.name.toLowerCase() === inviteRole)?.permissions ||
          [],
      };

      setMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setSaving(false);
    }
  };

  const updateMemberRole = (memberId: string, newRole: string) => {
    setMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? {
              ...member,
              role: newRole as any,
              permissions:
                ROLES.find(r => r.name.toLowerCase() === newRole)
                  ?.permissions || [],
            }
          : member
      )
    );
    toast.success('Member role updated');
  };

  const removeMember = (memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
    toast.success('Member removed from team');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{members.length} members</Badge>
          <Badge variant="outline">Plan: Pro</Badge>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Invite New Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleInvite} disabled={saving}>
                    {saving ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>{member.joinedAt}</TableCell>
                      <TableCell>{member.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={member.role}
                            onValueChange={value =>
                              updateMemberRole(member.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          {member.role !== 'owner' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMember(member.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          {/* Roles Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map(role => (
              <Card key={role.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getRoleIcon(role.name.toLowerCase())}
                    {role.name}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Members:</span>
                      <span className="font-medium">{role.memberCount}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {role.permissions.length} permissions
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Permissions Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>
                Overview of what each role can do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    {ROLES.map(role => (
                      <TableHead key={role.name} className="text-center">
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSIONS.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell>{permission.label}</TableCell>
                      {ROLES.map(role => (
                        <TableCell key={role.name} className="text-center">
                          {role.permissions.includes('all') ||
                          role.permissions.includes(permission.id) ? (
                            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto" />
                          ) : (
                            <div className="w-4 h-4 bg-gray-200 rounded-full mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Team Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Members</span>
                    <span className="font-medium">
                      {members.filter(m => m.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Invites</span>
                    <span className="font-medium">
                      {members.filter(m => m.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Subscriptions</span>
                    <span className="font-medium">24</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Spend</span>
                    <span className="font-medium">$1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg per Member</span>
                    <span className="font-medium">$415</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Savings Potential</span>
                    <span className="font-medium text-green-600">$187</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Team Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-invite new members</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Require approval for changes
                    </span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly team reports</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
