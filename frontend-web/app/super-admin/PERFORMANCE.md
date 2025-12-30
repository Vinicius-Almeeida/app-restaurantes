# Performance Optimizations - Super Admin Dashboard

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| FCP (First Contentful Paint) | < 1.5s | TBD | ⏳ |
| LCP (Largest Contentful Paint) | < 2.5s | TBD | ⏳ |
| TTI (Time to Interactive) | < 3.0s | TBD | ⏳ |
| CLS (Cumulative Layout Shift) | < 0.1 | TBD | ⏳ |
| FID (First Input Delay) | < 100ms | TBD | ⏳ |
| Lighthouse Score | > 90 | TBD | ⏳ |

## Implemented Optimizations

### 1. Code Splitting
```tsx
// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // Client-side only for interactive charts
});
```

### 2. Memoization
```tsx
// Memoize expensive calculations
const formattedMetrics = useMemo(() => ({
  mrr: formatPrice(metrics.mrr),
  arr: formatPrice(metrics.arr),
  churnRate: formatPercentage(metrics.churnRate),
}), [metrics]);

// Memoize callbacks
const handleLogout = useCallback(() => {
  logout();
  router.push('/auth/login');
}, [logout, router]);
```

### 3. Array Operations Optimization
```tsx
// Pre-validate arrays before operations
const recentRestaurantsList = useMemo(() =>
  Array.isArray(recentRestaurants) ? recentRestaurants : [],
  [recentRestaurants]
);

// Use keys for efficient reconciliation
{recentRestaurantsList.map((restaurant) => (
  <RestaurantCard key={restaurant.id} {...restaurant} />
))}
```

### 4. Image Optimization
```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={restaurant.logo}
  alt={restaurant.name}
  width={48}
  height={48}
  loading="lazy"
  placeholder="blur"
/>
```

### 5. Data Fetching Strategy
```tsx
// Parallel data fetching
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [metricsRes, restaurantsRes, complaintsRes, plansRes] =
        await Promise.all([
          apiClient.get('/super-admin/metrics'),
          apiClient.get('/super-admin/restaurants/recent'),
          apiClient.get('/super-admin/support/escalated'),
          apiClient.get('/super-admin/plans/distribution'),
        ]);

      // Update state in single batch
      setBatch({
        metrics: metricsRes.data.data,
        restaurants: restaurantsRes.data.data,
        complaints: complaintsRes.data.data,
        plans: plansRes.data.data,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchDashboardData();
}, []);
```

### 6. Virtualization for Large Lists
```tsx
// Use react-window for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={restaurants.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <RestaurantCard
      style={style}
      restaurant={restaurants[index]}
    />
  )}
</FixedSizeList>
```

## Planned Optimizations

### High Priority

#### 1. Implement React Server Components
```tsx
// app/super-admin/dashboard/page.tsx (Server Component)
export default async function SuperAdminDashboard() {
  // Fetch data on server
  const metrics = await getMetrics();

  return (
    <DashboardLayout>
      <MetricsGrid metrics={metrics} />
      <ClientInteractiveSection />
    </DashboardLayout>
  );
}
```

#### 2. Add Request Deduplication
```tsx
// lib/api/client.ts
import { unstable_cache } from 'next/cache';

export const getCachedMetrics = unstable_cache(
  async () => apiClient.get('/super-admin/metrics'),
  ['admin-metrics'],
  { revalidate: 60 } // 1 minute
);
```

#### 3. Optimize Bundle Size
```bash
# Analyze bundle
npm run build -- --analyze

# Expected actions:
# - Tree shake unused Lucide icons
# - Code split heavy dependencies (charts, etc)
# - Remove duplicate dependencies
```

### Medium Priority

#### 4. Implement Incremental Static Regeneration
```tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function DashboardPage() {
  const staticData = await getStaticMetrics();
  return <Dashboard data={staticData} />;
}
```

#### 5. Add Service Worker for Offline Support
```typescript
// service-worker.ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

#### 6. Optimize CSS
```tsx
// Extract critical CSS
// Purge unused Tailwind classes
// Use CSS modules for scoped styles

// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Low Priority

#### 7. Implement Progressive Web App
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... other config
});
```

## Performance Monitoring

### Client-Side Monitoring
```tsx
// lib/monitoring/performance.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  switch (metric.name) {
    case 'FCP':
      // Log First Contentful Paint
      console.log('FCP:', metric.value);
      break;
    case 'LCP':
      // Log Largest Contentful Paint
      console.log('LCP:', metric.value);
      break;
    case 'CLS':
      // Log Cumulative Layout Shift
      console.log('CLS:', metric.value);
      break;
    case 'FID':
      // Log First Input Delay
      console.log('FID:', metric.value);
      break;
    case 'TTFB':
      // Log Time to First Byte
      console.log('TTFB:', metric.value);
      break;
  }

  // Send to analytics
  // sendToAnalytics(metric);
}
```

### Server-Side Monitoring
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const start = Date.now();

  return NextResponse.next({
    headers: {
      'x-response-time': `${Date.now() - start}ms`,
    },
  });
}
```

## Loading States Best Practices

### 1. Skeleton Screens
```tsx
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Optimistic Updates
```tsx
const handleUpdateMetric = async (id: string, value: number) => {
  // Optimistic update
  setMetrics((prev) => ({ ...prev, [id]: value }));

  try {
    await apiClient.patch(`/metrics/${id}`, { value });
  } catch (error) {
    // Rollback on error
    setMetrics((prev) => ({ ...prev, [id]: originalValue }));
    toast.error('Falha ao atualizar métrica');
  }
};
```

### 3. Suspense Boundaries
```tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

## Caching Strategy

### Browser Cache
```typescript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/api/super-admin/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=120',
        },
      ],
    },
  ],
};
```

### In-Memory Cache
```typescript
// lib/cache/memory-cache.ts
const cache = new Map<string, { data: any; expires: number }>();

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item || item.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

export function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttl,
  });
}
```

## Testing Performance

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://app.tabsync.com/super-admin/dashboard
          uploadArtifacts: true
```

### Load Testing
```typescript
// tests/load/dashboard.test.ts
import { test } from '@playwright/test';

test('dashboard load test', async ({ page }) => {
  await page.goto('/super-admin/dashboard');

  // Measure performance
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd,
      loadComplete: navigation.loadEventEnd,
    };
  });

  expect(metrics.domContentLoaded).toBeLessThan(1500);
  expect(metrics.loadComplete).toBeLessThan(3000);
});
```

## Checklist

- [x] Minimize bundle size
- [x] Lazy load components
- [x] Optimize images
- [x] Memoize expensive calculations
- [x] Implement proper loading states
- [ ] Add service worker
- [ ] Implement ISR
- [ ] Setup performance monitoring
- [ ] Add error boundaries
- [ ] Optimize font loading
- [ ] Implement request deduplication
- [ ] Add bundle analyzer to CI
- [ ] Setup Lighthouse CI
