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
  Zap,
  Link,
  FileText,
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
  const [selectedFeature, setSelectedFeature] = useState<string>('analytics');

  const features = [
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detailed team spending insights and reports',
      icon: BarChart3,
      status: 'available',
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Automate approval processes and notifications',
      icon: Zap,
      status: 'coming-soon',
    },
    {
      id: 'integrations',
      title: 'Third-party Integrations',
      description: 'Connect with your favorite tools and services',
      icon: Link,
      status: 'beta',
    },
    {
      id: 'audit',
      title: 'Audit Trail',
      description: 'Complete history of all team actions and changes',
      icon: FileText,
      status: 'available',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Advanced Features</h2>
        <p className="text-muted-foreground">
          Unlock powerful team management capabilities
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature) => (
          <Card key={feature.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={
                    feature.status === 'available' ? 'default' :
                    feature.status === 'beta' ? 'secondary' : 'outline'
                  }
                >
                  {feature.status === 'coming-soon' ? 'Coming Soon' :
                   feature.status === 'beta' ? 'Beta' : 'Available'}
                </Badge>
              </div>
            </CardHeader>
            {feature.status === 'available' && (
              <CardContent>
                <Button className="w-full">
                  Enable Feature
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
