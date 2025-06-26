import { supabase } from './supabase'

export interface AuditLog {
  id?: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at?: string
}

export enum AuditAction {
  // Authentication
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  
  // Team management
  TEAM_CREATE = 'team_create',
  TEAM_UPDATE = 'team_update',
  TEAM_DELETE = 'team_delete',
  MEMBER_INVITE = 'member_invite',
  MEMBER_REMOVE = 'member_remove',
  ROLE_CHANGE = 'role_change',
  
  // Subscription management
  SUBSCRIPTION_CREATE = 'subscription_create',
  SUBSCRIPTION_UPDATE = 'subscription_update',
  SUBSCRIPTION_DELETE = 'subscription_delete',
  
  // Billing
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_CANCEL = 'subscription_cancel',
  
  // Data export/import
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  
  // Settings
  SETTINGS_UPDATE = 'settings_update',
  PREFERENCES_UPDATE = 'preferences_update',
}

export enum ResourceType {
  USER = 'user',
  TEAM = 'team',
  TEAM_MEMBER = 'team_member',
  SUBSCRIPTION = 'subscription',
  BILLING = 'billing',
  SETTINGS = 'settings',
  DATA = 'data',
}

class AuditLogger {
  private async getClientInfo(): Promise<{ ip_address?: string; user_agent?: string }> {
    try {
      // В браузере мы не можем получить реальный IP, но можем получить user agent
      return {
        user_agent: navigator.userAgent,
      }
    } catch {
      return {}
    }
  }

  async log(
    action: AuditAction,
    resourceType: ResourceType,
    resourceId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('Audit log: No authenticated user')
        return
      }

      const clientInfo = await this.getClientInfo()

      const auditLog: Omit<AuditLog, 'id' | 'created_at'> = {
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ...clientInfo,
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert(auditLog)

      if (error) {
        console.error('Failed to log audit event:', error)
      }
    } catch (error) {
      console.error('Audit logging failed:', error)
    }
  }

  // Convenience methods for common actions
  async logUserLogin(): Promise<void> {
    await this.log(AuditAction.USER_LOGIN, ResourceType.USER)
  }

  async logUserLogout(): Promise<void> {
    await this.log(AuditAction.USER_LOGOUT, ResourceType.USER)
  }

  async logTeamCreate(teamId: string, teamName: string): Promise<void> {
    await this.log(AuditAction.TEAM_CREATE, ResourceType.TEAM, teamId, {
      team_name: teamName,
    })
  }

  async logMemberInvite(teamId: string, email: string, role: string): Promise<void> {
    await this.log(AuditAction.MEMBER_INVITE, ResourceType.TEAM_MEMBER, teamId, {
      invited_email: email,
      role,
    })
  }

  async logSubscriptionCreate(subscriptionId: string, name: string, amount: number): Promise<void> {
    await this.log(AuditAction.SUBSCRIPTION_CREATE, ResourceType.SUBSCRIPTION, subscriptionId, {
      name,
      amount,
    })
  }

  async logSubscriptionUpdate(subscriptionId: string, changes: Record<string, unknown>): Promise<void> {
    await this.log(AuditAction.SUBSCRIPTION_UPDATE, ResourceType.SUBSCRIPTION, subscriptionId, {
      changes,
    })
  }

  async logPaymentSuccess(amount: number, currency: string): Promise<void> {
    await this.log(AuditAction.PAYMENT_SUCCESS, ResourceType.BILLING, undefined, {
      amount,
      currency,
    })
  }

  async logDataExport(format: string): Promise<void> {
    await this.log(AuditAction.DATA_EXPORT, ResourceType.DATA, undefined, {
      format,
    })
  }
}

export const auditLogger = new AuditLogger()

// React hook for audit logging
export function useAudit() {
  return auditLogger
} 