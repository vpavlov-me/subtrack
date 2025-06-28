import React, { useState } from 'react';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, ChevronDown, TestTube } from 'lucide-react';

interface TestUser {
  email: string;
  name: string;
  role: 'admin' | 'member';
}

const testUsers: TestUser[] = [
  {
    email: 'admin@demo.dev',
    name: 'Test Admin',
    role: 'admin'
  },
  {
    email: 'member@demo.dev',
    name: 'Test Member',
    role: 'member'
  }
];

export function TestUserSwitcher() {
  const { signInAsTestUser, user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Only show in development with test auth enabled
  if (!import.meta.env.DEV || !import.meta.env.VITE_TEST_AUTH) {
    return null;
  }

  const handleTestUserLogin = async (testUser: TestUser) => {
    setIsLoading(true);
    try {
      await signInAsTestUser(testUser.email);
    } catch (error) {
      console.error('Failed to login as test user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTestUser = testUsers.find(u => u.email === user?.email);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {currentTestUser ? (
              <>
                <User className="h-4 w-4" />
                {currentTestUser.name}
              </>
            ) : (
              'Login as Test User'
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Test Users</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {currentTestUser ? (
            <>
              <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                Currently logged in as: {currentTestUser.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            testUsers.map((testUser) => (
              <DropdownMenuItem
                key={testUser.email}
                onClick={() => handleTestUserLogin(testUser)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{testUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {testUser.email} ({testUser.role})
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            Password: test123456
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 