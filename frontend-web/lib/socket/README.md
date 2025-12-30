# Socket.IO Integration - TabSync Frontend

Complete Socket.IO client setup for real-time features in the TabSync platform.

## Architecture

```
lib/socket/
├── socket.ts                 # Singleton socket manager with auto-reconnect
├── useSocket.ts              # Main hook for socket connection
├── useOrderSocket.ts         # Order events hook
├── useTableSocket.ts         # Table session events hook
├── useKitchenSocket.ts       # Kitchen dashboard events hook
├── usePaymentSocket.ts       # Payment and split bill events hook
├── useWaiterSocket.ts        # Waiter notifications hook
├── types.ts                  # TypeScript types for all events
└── index.ts                  # Centralized exports
```

## Quick Start

### 1. Basic Connection

```tsx
'use client';

import { useSocket } from '@/lib/socket';

export default function MyComponent() {
  const { socket, state } = useSocket();

  if (!state.connected) {
    return <div>Connecting to real-time server...</div>;
  }

  return <div>Connected! Socket ID: {socket?.id}</div>;
}
```

### 2. Table Session Integration

```tsx
'use client';

import { useTableSocket } from '@/lib/socket';
import { useTableSessionStore } from '@/lib/stores/table-session-store';

export default function TableSessionPage({ sessionId }: { sessionId: string }) {
  const { session, isOwner, addMember, updateMember, removeMember } =
    useTableSessionStore();

  const { callWaiter, handleMemberRequest } = useTableSocket({
    sessionId,
    isOwner,
    onMemberJoinRequest: (payload) => {
      // Add pending member to store
      addMember(payload.member);
    },
    onMemberApproved: (payload) => {
      // Update member status
      updateMember(payload.memberId, { status: 'APPROVED' });
    },
    onMemberLeft: (payload) => {
      // Remove member
      removeMember(payload.memberId);
    },
  });

  const handleApprove = (memberId: string) => {
    handleMemberRequest(memberId, true);
  };

  const handleReject = (memberId: string) => {
    handleMemberRequest(memberId, false);
  };

  return (
    <div>
      <h1>Table Session</h1>

      {/* Members list */}
      <div>
        {session?.members.map((member) => (
          <div key={member.id}>
            {member.userName}
            {member.status === 'PENDING' && isOwner && (
              <>
                <button onClick={() => handleApprove(member.id)}>
                  Approve
                </button>
                <button onClick={() => handleReject(member.id)}>
                  Reject
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Call waiter */}
      <button onClick={() => callWaiter('Need assistance')}>
        Call Waiter
      </button>
    </div>
  );
}
```

### 3. Order Tracking

```tsx
'use client';

import { useOrderSocket } from '@/lib/socket';
import { useOrderStore } from '@/lib/stores/order-store';

export default function OrderTracking({
  restaurantId,
  orderId
}: {
  restaurantId: string;
  orderId: string;
}) {
  const { currentOrder, updateOrderStatus } = useOrderStore();

  useOrderSocket({
    restaurantId,
    orderId,
    onStatusChanged: (payload) => {
      updateOrderStatus(payload.orderId, payload.newStatus);
    },
    enableNotifications: true, // Show toast notifications
  });

  if (!currentOrder) return <div>Loading order...</div>;

  return (
    <div>
      <h2>Order #{currentOrder.orderNumber}</h2>
      <p>Status: {currentOrder.status}</p>

      {/* Order items */}
      {currentOrder.orderItems.map((item) => (
        <div key={item.id}>
          {item.menuItem.name} x {item.quantity}
        </div>
      ))}
    </div>
  );
}
```

### 4. Kitchen Dashboard

```tsx
'use client';

import { useKitchenSocket } from '@/lib/socket';
import { useOrderStore } from '@/lib/stores/order-store';
import { useState } from 'react';

export default function KitchenDashboard({ restaurantId }: { restaurantId: string }) {
  const { orders, addOrder, updateOrderStatus } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { startOrder, markOrderReady } = useKitchenSocket({
    restaurantId,
    onOrderReceived: (payload) => {
      addOrder(payload.order);
    },
    onOrderStarted: (payload) => {
      updateOrderStatus(payload.orderId, 'PREPARING');
    },
    onOrderReady: (payload) => {
      updateOrderStatus(payload.orderId, 'READY');
    },
    enableNotifications: true,
    enableSounds: true, // Play notification sounds
  });

  const handleStartOrder = (orderId: string) => {
    startOrder(orderId);
  };

  const handleMarkReady = (orderId: string) => {
    markOrderReady(orderId);
  };

  return (
    <div>
      <h1>Kitchen Dashboard</h1>

      {/* Kanban board */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pending column */}
        <div>
          <h2>Pending</h2>
          {orders
            .filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED')
            .map((order) => (
              <div key={order.id}>
                Order #{order.orderNumber}
                <button onClick={() => handleStartOrder(order.id)}>
                  Start
                </button>
              </div>
            ))}
        </div>

        {/* Preparing column */}
        <div>
          <h2>Preparing</h2>
          {orders
            .filter((o) => o.status === 'PREPARING')
            .map((order) => (
              <div key={order.id}>
                Order #{order.orderNumber}
                <button onClick={() => handleMarkReady(order.id)}>
                  Mark Ready
                </button>
              </div>
            ))}
        </div>

        {/* Ready column */}
        <div>
          <h2>Ready</h2>
          {orders
            .filter((o) => o.status === 'READY')
            .map((order) => (
              <div key={order.id}>
                Order #{order.orderNumber}
                {order.tableNumber && <p>Table {order.tableNumber}</p>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. Split Bill Payment

```tsx
'use client';

import { usePaymentSocket } from '@/lib/socket';
import { usePaymentStore } from '@/lib/stores/payment-store';

export default function SplitBillPage({ orderId }: { orderId: string }) {
  const {
    splits,
    totalAmount,
    paidAmount,
    remainingAmount,
    allPaid,
    updateSplit
  } = usePaymentStore();

  const { processSplitPayment } = usePaymentSocket({
    orderId,
    onPaymentReceived: (payload) => {
      updateSplit(payload.splitPaymentId, {
        paymentStatus: 'PAID',
        paidAt: payload.paidAt,
      });
    },
    onAllPaymentsComplete: (payload) => {
      console.log('All payments complete!');
    },
    enableNotifications: true,
  });

  const handlePay = (splitId: string) => {
    processSplitPayment(splitId, {
      method: 'PIX',
      pixKey: 'customer@email.com',
    });
  };

  return (
    <div>
      <h1>Split Bill</h1>

      <div className="mb-4">
        <p>Total: R$ {totalAmount.toFixed(2)}</p>
        <p>Paid: R$ {paidAmount.toFixed(2)}</p>
        <p>Remaining: R$ {remainingAmount.toFixed(2)}</p>
      </div>

      {allPaid && (
        <div className="bg-green-100 p-4 rounded">
          All payments complete! You can leave now.
        </div>
      )}

      <div>
        {splits.map((split) => (
          <div key={split.id} className="border p-4 mb-2">
            <p>{split.userName}</p>
            <p>Amount: R$ {split.amountDue.toFixed(2)}</p>
            <p>Status: {split.paymentStatus}</p>

            {split.paymentStatus === 'PENDING' && (
              <button onClick={() => handlePay(split.id)}>
                Pay Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Waiter Notifications

```tsx
'use client';

import { useWaiterSocket } from '@/lib/socket';
import { useState } from 'react';

interface Call {
  sessionId: string;
  tableNumber: number;
  customerName: string;
  timestamp: string;
  reason?: string;
}

export default function WaiterDashboard({ restaurantId }: { restaurantId: string }) {
  const [calls, setCalls] = useState<Call[]>([]);

  const { acknowledgeCall, markTableAttended } = useWaiterSocket({
    restaurantId,
    onWaiterCalled: (payload) => {
      setCalls((prev) => [...prev, payload]);
    },
    onTableNeedsAttention: (payload) => {
      console.log('Table needs attention:', payload);
    },
    enableNotifications: true,
    enableSounds: true,
  });

  const handleAcknowledge = (sessionId: string) => {
    acknowledgeCall(sessionId);
    setCalls((prev) => prev.filter((c) => c.sessionId !== sessionId));
  };

  const handleMarkAttended = (sessionId: string) => {
    markTableAttended(sessionId, 'Issue resolved');
    setCalls((prev) => prev.filter((c) => c.sessionId !== sessionId));
  };

  return (
    <div>
      <h1>Waiter Dashboard</h1>

      <div>
        <h2>Active Calls ({calls.length})</h2>
        {calls.map((call) => (
          <div key={call.sessionId} className="border p-4 mb-2">
            <p>Table {call.tableNumber}</p>
            <p>{call.customerName}</p>
            {call.reason && <p>Reason: {call.reason}</p>}
            <p>{new Date(call.timestamp).toLocaleTimeString()}</p>

            <button onClick={() => handleAcknowledge(call.sessionId)}>
              Acknowledge
            </button>
            <button onClick={() => handleMarkAttended(call.sessionId)}>
              Mark Attended
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Authentication Integration

Update the auth store to sync socket authentication:

```tsx
// lib/stores/auth-store.ts
import { socketManager } from '../socket';

export const useAuthStore = create<AuthState>((set) => ({
  // ... existing code

  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', {
      email,
      password,
    });

    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Update socket authentication
    socketManager.updateAuth(accessToken);

    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Disconnect socket
    socketManager.disconnect();

    set({ user: null, isAuthenticated: false });
  },
}));
```

## Features

### Auto-Reconnect
- Exponential backoff strategy
- Max 5 reconnection attempts
- Automatic token refresh

### Toast Notifications
- Using Sonner library
- Configurable per hook
- Action buttons for urgent notifications

### Sound Notifications
- Kitchen: New order sound
- Waiter: Call notification sound
- High priority: Urgent sound

### Room Management
- Automatic join/leave on mount/unmount
- Restaurant-wide broadcasts
- Order-specific updates
- Table session isolation

### Type Safety
- Full TypeScript support
- Event payload typing
- Strict mode compliance

## Event Types

All events are typed and synchronized with the backend:

- **Orders**: `new-order`, `order-status-changed`, `order-item-added`
- **Table Sessions**: `member-join-request`, `member-approved`, `member-rejected`, `member-left`, `session-closed`
- **Payments**: `payment-received`, `all-payments-complete`, `split-created`, `split-updated`
- **Kitchen**: `kitchen-order-received`, `kitchen-order-started`, `kitchen-order-ready`
- **Waiter**: `waiter-called`, `table-needs-attention`

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

The socket URL is automatically derived by removing `/api` from the API URL.

## Best Practices

1. **Always cleanup**: Hooks automatically cleanup listeners on unmount
2. **Use rooms**: Join specific rooms to avoid unnecessary events
3. **Handle disconnections**: Check `state.connected` before critical actions
4. **Optimize notifications**: Disable notifications for background updates
5. **Error handling**: Handle socket errors gracefully with fallbacks

## Troubleshooting

### Socket not connecting
- Check if backend is running
- Verify NEXT_PUBLIC_API_URL environment variable
- Check browser console for connection errors
- Verify JWT token is valid

### Events not received
- Ensure you've joined the correct room
- Check event name spelling (use SOCKET_EVENTS constants)
- Verify backend is emitting to the correct room
- Check socket connection state

### Token expired
- Socket will automatically try to reconnect
- Auth store should refresh tokens
- Call `socketManager.updateAuth(newToken)` after refresh

## Performance

- Singleton pattern prevents multiple connections
- Events are cleaned up automatically
- Room-based isolation reduces unnecessary updates
- Zustand stores prevent unnecessary re-renders
