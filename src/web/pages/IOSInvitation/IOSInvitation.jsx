import React from 'react';

import TestFlightInvitation from 'web/pages/TestFlightInvitation';

export default function IOSInvitation() {
  function toggleTestFlightInvitationModal() {
    window.location.href = '/about';
  }

  return (
    <div>
      <TestFlightInvitation
        open
        onToggle={toggleTestFlightInvitationModal}
      />
    </div>
  );
}
