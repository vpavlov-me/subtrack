import { useState } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Settings,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface NotificationRule {
  id: string;
  type: 'billing' | 'spending' | 'renewal' | 'price_change' | 'unused';
  enabled: boolean;
  threshold?: number;
  daysBefore?: number;
  channel: 'email' | 'push' | 'slack';
  description: string;
}

const DEFAULT_RULES: NotificationRule[] = [
  {
    id: 'billing_reminder',
    type: 'billing',
    enabled: true,
    daysBefore: 3,
    channel: 'email',
    description: 'Get notified 3 days before subscription renewals',
  },
  {
    id: 'high_spending',
    type: 'spending',
    enabled: true,
    threshold: 100,
    channel: 'email',
    description: 'Alert when monthly spending exceeds $100',
  },
  {
    id: 'price_increase',
    type: 'price_change',
    enabled: true,
    threshold: 10,
    channel: 'push',
    description: 'Notify when subscription price increases by more than 10%',
  },
  {
    id: 'unused_subscriptions',
    type: 'unused',
    enabled: true,
    threshold: 30,
    channel: 'email',
    description: 'Remind about unused subscriptions after 30 days',
  },
  {
    id: 'spending_trend',
    type: 'spending',
    enabled: true,
    threshold: 20,
    channel: 'slack',
    description: 'Weekly spending trend reports',
  },
];

export function SmartNotifications() {
  const [rules, setRules] = useState<NotificationRule[]>(DEFAULT_RULES);
  const [saving, setSaving] = useState(false);

  const updateRule = (id: string, updates: Partial<NotificationRule>) => {
    setRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const toggleRule = (id: string) => {
    updateRule(id, { enabled: !rules.find(r => r.id === id)?.enabled });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'billing':
        return <Clock className="h-4 w-4" />;
      case 'spending':
        return <DollarSign className="h-4 w-4" />;
      case 'renewal':
        return <Bell className="h-4 w-4" />;
      case 'price_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'unused':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getChannelBadge = (channel: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800',
      push: 'bg-green-100 text-green-800',
      slack: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={colors[channel as keyof typeof colors]}>
        {channel}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Notifications</h2>
          <p className="text-muted-foreground">
            Configure intelligent notifications to stay on top of your
            subscriptions
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* Notification Rules */}
      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRuleIcon(rule.type)}
                  <div>
                    <CardTitle className="text-lg">
                      {rule.description}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {getChannelBadge(rule.channel)}
                      {rule.threshold && (
                        <span className="text-sm text-muted-foreground">
                          Threshold: {rule.threshold}
                          {rule.type === 'spending'
                            ? '$'
                            : rule.type === 'price_change'
                              ? '%'
                              : ' days'}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            </CardHeader>
            {rule.enabled && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Channel Selection */}
                  <div className="space-y-2">
                    <Label>Notification Channel</Label>
                    <Select
                      value={rule.channel}
                      onValueChange={value =>
                        updateRule(rule.id, { channel: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Threshold Input */}
                  {rule.threshold !== undefined && (
                    <div className="space-y-2">
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        value={rule.threshold}
                        onChange={e =>
                          updateRule(rule.id, {
                            threshold: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Enter threshold"
                      />
                    </div>
                  )}

                  {/* Days Before Input */}
                  {rule.daysBefore !== undefined && (
                    <div className="space-y-2">
                      <Label>Days Before</Label>
                      <Input
                        type="number"
                        value={rule.daysBefore}
                        onChange={e =>
                          updateRule(rule.id, {
                            daysBefore: parseInt(e.target.value),
                          })
                        }
                        placeholder="Enter days"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Notification Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Summary</CardTitle>
          <CardDescription>
            Overview of your notification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {rules.filter(r => r.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Rules</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {rules.filter(r => r.enabled && r.channel === 'email').length}
              </div>
              <div className="text-sm text-muted-foreground">
                Email Notifications
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {rules.filter(r => r.enabled && r.channel === 'push').length}
              </div>
              <div className="text-sm text-muted-foreground">
                Push Notifications
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>
            Send test notifications to verify your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success('Test email notification sent')}
            >
              Test Email
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success('Test push notification sent')}
            >
              Test Push
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success('Test Slack notification sent')}
            >
              Test Slack
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
