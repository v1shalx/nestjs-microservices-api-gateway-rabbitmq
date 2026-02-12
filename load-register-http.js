/**
 * PURPOSE OF THIS SCRIPT
 * ----------------------
 * This script is used to STRESS-TEST the `/auth/register` API endpoint
 * and indirectly test how our RabbitMQ queue (`auth_queue`) behaves
 * under high request load.
 *
 * WHAT THIS SCRIPT DOES
 * --------------------
 * - Sends a large number of HTTP POST requests to:
 *     POST http://localhost:3000/auth/register
 * - Each request uses a UNIQUE email so database constraints are not violated.
 * - Requests are sent with CONTROLLED CONCURRENCY (not all at once).
 *
 * WHAT IT HELPS US OBSERVE
 * -----------------------
 * 1. Whether the API Gateway can handle high traffic.
 * 2. Whether messages are successfully published to RabbitMQ.
 * 3. How the `auth_queue` behaves when:
 *    - Auth service is RUNNING   → messages are consumed immediately.
 *    - Auth service is STOPPED   → messages pile up in the queue (Ready count increases).
 *
 * IMPORTANT BEHAVIOR NOTE
 * -----------------------
 * - Our system uses RabbitMQ in RPC mode (client.send).
 * - Because of this, messages are ACKed immediately once consumed.
 * - RabbitMQ does NOT store message history.
 *
 * So:
 * - If Auth service is RUNNING → queue usually shows Ready = 0.
 * - If Auth service is STOPPED → queue shows Ready > 0 (backlog).
 *
 * WHAT THIS SCRIPT DOES NOT DO
 * ---------------------------
 * - It does NOT guarantee all 10,000 users are created.
 * - Only requests that return HTTP < 400 result in DB inserts.
 * - It does NOT test retries, DLQ, or message persistence.
 *
 * HOW TO USE THIS SCRIPT CORRECTLY
 * -------------------------------
 * 1. Stop the Authentication microservice (Ctrl + C).
 * 2. Run this script.
 * 3. Open RabbitMQ UI → Queues → auth_queue.
 * 4. Observe Ready count increasing.
 * 5. Start Authentication service again.
 * 6. Observe Ready count decreasing.
 *
 * This proves:
 * - Messages reach RabbitMQ.
 * - Queue buffers messages.
 * - Consumers control processing speed.
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 3000;
const PATH = '/auth/register';

const TOTAL = 50; // how many users
const CONCURRENCY = 100; // parallel requests
const TIMEOUT_MS = 8000;

function makePayload(i) {
  return JSON.stringify({
    firstName: 'Load',
    lastName: 'Test',
    email: `load_${Date.now()}_${i}@test.com`,
    password: '123',
  });
}

function postOnce(i) {
  return new Promise((resolve) => {
    const body = makePayload(i);

    const req = http.request(
      {
        host: HOST,
        port: PORT,
        path: PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        // consume response
        res.on('data', () => {});
        res.on('end', () =>
          resolve({ ok: res.statusCode < 400, code: res.statusCode }),
        );
      },
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, code: 'TIMEOUT' });
    });

    req.on('error', () => resolve({ ok: false, code: 'ERROR' }));

    req.write(body);
    req.end();
  });
}

(async () => {
  let ok = 0,
    fail = 0,
    timeout = 0;
  let inFlight = 0;
  let idx = 0;

  console.log(
    `Sending TOTAL=${TOTAL} with CONCURRENCY=${CONCURRENCY} to http://${HOST}:${PORT}${PATH}`,
  );
  console.log(
    'TIP: Stop auth microservice first so messages stay in auth_queue.',
  );

  const start = Date.now();

  return new Promise((done) => {
    const tick = async () => {
      while (inFlight < CONCURRENCY && idx < TOTAL) {
        const current = idx++;
        inFlight++;

        postOnce(current).then((r) => {
          inFlight--;
          if (r.ok) ok++;
          else {
            fail++;
            if (r.code === 'TIMEOUT') timeout++;
          }
        });
      }

      const sent = ok + fail;
      process.stdout.write(
        `\rSent ${sent}/${TOTAL} | ok=${ok} fail=${fail} timeout=${timeout} inflight=${inFlight}`,
      );

      if (sent >= TOTAL && inFlight === 0) {
        const secs = (Date.now() - start) / 1000;
        console.log(`\nDone in ${secs.toFixed(1)}s`);
        done();
        return;
      }

      setTimeout(tick, 50);
    };

    tick();
  });
})();
