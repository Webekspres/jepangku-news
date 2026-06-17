import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { getUnreadNotificationCount } from '@/lib/notifications/queries';
import { getNotificationSignalVersion } from '@/lib/notifications/realtime';

const POLL_MS = 3_000;
const HEARTBEAT_EVERY = 10;
const MAX_TICKS = 55;

function sseChunk(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return new Response('Not authenticated', { status: 401 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        if (closed) return;
        controller.enqueue(encoder.encode(sseChunk(data)));
      };

      try {
        let lastVersion = await getNotificationSignalVersion(user.id);
        const initialCount = await getUnreadNotificationCount(user.id);
        send({ type: 'connected', unreadCount: initialCount, version: lastVersion });

        let ticks = 0;
        while (!closed && ticks < MAX_TICKS) {
          if (request.signal.aborted) break;

          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, POLL_MS);
            request.signal.addEventListener(
              'abort',
              () => {
                clearTimeout(timer);
                resolve();
              },
              { once: true },
            );
          });

          if (request.signal.aborted || closed) break;

          const version = await getNotificationSignalVersion(user.id);
          if (version !== lastVersion) {
            lastVersion = version;
            const unreadCount = await getUnreadNotificationCount(user.id);
            send({ type: 'update', unreadCount, version });
          } else if (ticks % HEARTBEAT_EVERY === 0) {
            send({ type: 'heartbeat', version });
          }

          ticks += 1;
        }
      } catch (error) {
        await captureException(error, { route: 'notifications-stream', userId: user.id });
        send({ type: 'error', message: 'stream_failed' });
      } finally {
        closed = true;
        controller.close();
      }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
