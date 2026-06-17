"use client";

import NotificationBellMenu from "@/components/notifications/NotificationBellMenu";

export default function NavbarNotifications() {
  return (
    <NotificationBellMenu
      buttonTestId="navbar-notifications-button"
      menuTestId="navbar-notifications-menu"
    />
  );
}
