'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLevelAccessManager } from '@/hooks/use-level-access';
import { toast } from 'sonner';

interface LevelAccessButtonProps {
  level: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showBadge?: boolean;
  onAccessGranted?: () => void;
}

export function LevelAccessButton({
  level,
  className,
  variant = 'default',
  size = 'default',
  showBadge = true,
  onAccessGranted,
}: LevelAccessButtonProps) {
  const {
    hasAccess,
    hasPendingRequest,
    requestStatus,
    isLoading,
    error,
    handleRequestAccess,
    canRequestAccess,
    buttonText,
    buttonState,
    isRequesting,
    requestError,
  } = useLevelAccessManager(level);

  // Handle access request
  const onRequestAccess = async () => {
    try {
      await handleRequestAccess();
      toast.success('Access request submitted successfully!');
    } catch (error) {
      console.error('Failed to request access:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit access request'
      );
    }
  };

  // Handle access granted callback
  React.useEffect(() => {
    if (hasAccess && onAccessGranted) {
      onAccessGranted();
    }
  }, [hasAccess, onAccessGranted]);

  // Show loading state
  if (isLoading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        disabled
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Show error state
  if (error) {
    return (
      <Button 
        variant="destructive" 
        size={size} 
        className={className}
        disabled
      >
        <XCircle className="w-4 h-4 mr-2" />
        Error
      </Button>
    );
  }

  // Get button icon based on state
  const getButtonIcon = () => {
    switch (buttonState) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 mr-2" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-2" />;
      case 'denied':
        return <XCircle className="w-4 h-4 mr-2" />;
      default:
        return <Lock className="w-4 h-4 mr-2" />;
    }
  };

  // Get button variant based on state
  const getButtonVariant = () => {
    switch (buttonState) {
      case 'granted':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'denied':
        return 'destructive';
      default:
        return variant;
    }
  };

  // Get badge variant based on state
  const getBadgeVariant = () => {
    switch (buttonState) {
      case 'granted':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'denied':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={getButtonVariant()}
        size={size}
        className={className}
        disabled={!canRequestAccess || isRequesting}
        onClick={canRequestAccess ? onRequestAccess : undefined}
      >
        {isRequesting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          getButtonIcon()
        )}
        {isRequesting ? 'Requesting...' : buttonText}
      </Button>
      
      {showBadge && (
        <Badge variant={getBadgeVariant()}>
          {buttonState === 'granted' && 'Granted'}
          {buttonState === 'pending' && 'Pending'}
          {buttonState === 'denied' && 'Denied'}
          {buttonState === 'available' && 'Locked'}
        </Badge>
      )}
      
      {requestError && (
        <span className="text-sm text-red-500">
          {requestError instanceof Error ? requestError.message : 'Request failed'}
        </span>
      )}
    </div>
  );
}

// Simplified version for just showing access status
export function LevelAccessBadge({ 
  level, 
  className 
}: { 
  level: string; 
  className?: string; 
}) {
  const { hasAccess, hasPendingRequest, requestStatus, isLoading } = useLevelAccessManager(level);

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Loading
      </Badge>
    );
  }

  if (hasAccess) {
    return (
      <Badge variant="default" className={className}>
        <CheckCircle className="w-3 h-3 mr-1" />
        Access Granted
      </Badge>
    );
  }

  if (hasPendingRequest) {
    return (
      <Badge variant="secondary" className={className}>
        <Clock className="w-3 h-3 mr-1" />
        Request Pending
      </Badge>
    );
  }

  if (requestStatus === 'denied') {
    return (
      <Badge variant="destructive" className={className}>
        <XCircle className="w-3 h-3 mr-1" />
        Request Denied
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      <Lock className="w-3 h-3 mr-1" />
      Locked
    </Badge>
  );
}