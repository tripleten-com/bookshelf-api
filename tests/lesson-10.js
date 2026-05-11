const BASE = 'http://localhost:3000';
let pass = 0;
let fail = 0;
let skip = 0;

class Skip extends Error {}

async function test(label, fn) {
  try {
    await fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch (err) {
    if (err instanceof Skip) {
      console.log(`○ ${label} — ${err.message}`);
      skip++;
    } else {
      console.log(`❌ ${label} — ${err.message}`);
      fail++;
    }
  }
}

function expect(value, label) {
  return {
    toBe(expected) {
      if (value !== expected) throw new Error(`${label}: expected ${expected}, got ${value}`);
    },
    toBeTrue() {
      if (!value) throw new Error(`${label}: expected truthy, got ${String(value)}`);
    },
  };
}

async function run() {
  console.log('\nLesson 10: Relationships Between Schemas\n');

  let bookId;

  await test('GET /books — server is running and Book model works', async () => {
    const res = await fetch(`${BASE}/books`);
    expect(res.status, 'status').toBe(200);
    const body = await res.json();
    expect(Array.isArray(body), 'response is array').toBeTrue();
  });

  await test('POST /books — response includes a reviews field', async () => {
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'The Left Hand of Darkness', genre: 'fiction', year: 1969 }),
    });
    expect(res.status, 'status').toBe(201);
    const body = await res.json();
    expect(Array.isArray(body.reviews), 'reviews field is array').toBeTrue();
    bookId = body._id;
  });

  await test('GET /books/:id — book document includes reviews array', async () => {
    if (!bookId) throw new Skip('POST /books must pass first');
    const res = await fetch(`${BASE}/books/${bookId}`);
    expect(res.status, 'status').toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.reviews), 'reviews field is array').toBeTrue();
  });

  console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
  if (fail === 0 && skip === 0) {
    const code = Buffer.from('bmYzLXFod3g=', 'base64').toString();
    console.log(`\nVerification code: ${code}`);
  }
  if (fail > 0) process.exit(1);
}

run().catch(() => {
  console.error('\nCould not reach the server. Make sure it is running on port 3000.\n');
  process.exit(1);
});
