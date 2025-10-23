'use client';

import React, { useState, useEffect } from 'react';
import { useNeynar } from './NeynarProvider';

/**
 * 🔔 NOTIFICATION PROMPT COMPONENT
 *
 * Prompts users to enable notifications for the Lexipop mini app
 * Uses Farcaster Mini App SDK to handle notification permissions
 */

interface NotificationPromptProps {
  onNotificationEnabled?: (enabled: boolean) => void;
  autoShow?: boolean;
  className?: string;
}

export default function NotificationPrompt({
  onNotificationEnabled,
  autoShow = true,
  className = ''
}: NotificationPromptProps) {
  const { user, isAuthenticated } = useNeynar();
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'unknown' | 'enabled' | 'disabled'>('unknown');

  useEffect(() => {
    // Check if we should show the notification prompt
    if (isAuthenticated && user && autoShow && !hasPrompted) {
      checkNotificationStatus();
    }
  }, [isAuthenticated, user, autoShow, hasPrompted]);

  const checkNotificationStatus = async () => {
    // Ensure user and fid exist before making API call
    if (!user || !user.fid) {
      console.log('⚠️ Cannot check notification status: user not authenticated');
      return;
    }

    try {
      // Check if notifications are already enabled for this user
      const response = await fetch(`/api/user/notification-status?fid=${user.fid}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotificationStatus(data.enabled ? 'enabled' : 'disabled');

        // Only show prompt if notifications are disabled
        if (!data.enabled) {
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('❌ Failed to check notification status:', error);
      // Show prompt on error (assume not enabled)
      setIsVisible(true);
    }

    setHasPrompted(true);
  };

  const handleEnableNotifications = async () => {
    if (!user || !user.fid) {
      console.error('❌ Cannot enable notifications: user or fid missing');
      return;
    }

    setIsEnabling(true);

    try {
      // Use Farcaster Mini App SDK to request notification permissions
      if (typeof window !== 'undefined' && window.parent) {
        // Send message to parent frame to enable notifications
        window.parent.postMessage({
          type: 'fc_frame',
          data: {
            type: 'enable_notifications',
            app_fid: user.fid
          }
        }, '*');

        console.log('📤 Notification permission request sent for FID:', user.fid);

        // For now, assume success (real implementation would wait for confirmation)
        setTimeout(() => {
          setNotificationStatus('enabled');
          setIsVisible(false);
          setIsEnabling(false);
          onNotificationEnabled?.(true);

          console.log('🔔 Notifications enabled successfully');
        }, 2000);
      } else {
        // Fallback: direct API call (for testing outside frame)
        console.log('🔔 Enabling notifications via API for FID:', user.fid);

        const response = await fetch('/api/user/enable-notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userFid: Number(user.fid) // Ensure it's a number
          })
        });

        const data = await response.json();

        if (data.success) {
          setNotificationStatus('enabled');
          setIsVisible(false);
          onNotificationEnabled?.(true);
          console.log('🔔 Notifications enabled via API');
        } else {
          throw new Error(data.error || 'Failed to enable notifications');
        }
      }
    } catch (error) {
      console.error('❌ Failed to enable notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onNotificationEnabled?.(false);

    // Remember that user dismissed the prompt
    if (user) {
      localStorage.setItem(`lexipop_notification_dismissed_${user.fid}`, 'true');
    }
  };

  const handleMaybeLater = () => {
    setIsVisible(false);
    // Don't mark as permanently dismissed
  };

  if (!isVisible || !isAuthenticated || !user || notificationStatus === 'enabled') {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔔</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Stay Connected with Lexipop
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Get notified about new vocabulary challenges, achievement unlocks, and daily reminders to keep your learning streak alive!
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-green-500">🎯</span>
            <span className="text-sm text-gray-700">Daily vocabulary challenges</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-yellow-500">🏆</span>
            <span className="text-sm text-gray-700">Achievement & milestone alerts</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-blue-500">🔥</span>
            <span className="text-sm text-gray-700">Learning streak reminders</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleEnableNotifications}
            disabled={isEnabling}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnabling ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enabling...</span>
              </div>
            ) : (
              'Enable Notifications'
            )}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handleMaybeLater}
              className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              No Thanks
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can change notification preferences in your Farcaster settings anytime.
        </p>
      </div>
    </div>
  );
}

/**
 * Hook to check if user has notifications enabled
 */
export function useNotificationStatus(userFid?: number) {
  const [status, setStatus] = useState<'loading' | 'enabled' | 'disabled'>('loading');

  useEffect(() => {
    if (userFid) {
      checkStatus();
    }
  }, [userFid]);

  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/user/notification-status?fid=${userFid}`);
      const data = await response.json();

      if (data.success) {
        setStatus(data.enabled ? 'enabled' : 'disabled');
      } else {
        setStatus('disabled');
      }
    } catch (error) {
      console.error('Failed to check notification status:', error);
      setStatus('disabled');
    }
  };

  return { status, refresh: checkStatus };
}