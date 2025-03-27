"use client";

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const { isLoggedIn, user, logout } = useAuth();

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset to login form when modal is closed
    setShowLogin(true);
  };

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm hidden md:inline">
          Welcome, {user.username}
        </span>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {showLogin ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <SignupForm onToggleForm={toggleForm} />
        )}
      </DialogContent>
    </Dialog>
  );
}