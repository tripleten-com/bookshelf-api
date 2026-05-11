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
      if (value !== expected)
        throw new Error(`${label}: expected ${expected}, got ${value}`);
    },
    toBeTrue() {
      if (!value)
        throw new Error(`${label}: expected truthy, got ${String(value)}`);
    },
  };
}

async function run() {
  console.log('\nLesson 08: CRUD Operations — Bookshelf API\n');

  let bookId;

  await test('POST /books — creates a book with 201 status', async () => {
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Dune', genre: 'fiction', year: 1965 }),
    });
    expect(res.status, 'status').toBe(201);
    const body = await res.json();
    expect(typeof body._id, '_id type').toBe('string');
    expect(body.title, 'title').toBe('Dune');
    bookId = body._id;
  });

  await test('GET /books — returns an array of books', async () => {
    const res = await fetch(`${BASE}/books`);
    expect(res.status, 'status').toBe(200);
    const body = await res.json();
    expect(Array.isArray(body), 'response is array').toBeTrue();
  });

  await test('GET /books/:id — returns a book by ID', async () => {
    if (!bookId) throw new Skip('POST /books must pass first');
    const res = await fetch(`${BASE}/books/${bookId}`);
    expect(res.status, 'status').toBe(200);
    const body = await res.json();
    expect(body._id, '_id').toBe(bookId);
  });

  await test('PATCH /books/:id — updates the title', async () => {
    if (!bookId) throw new Skip('POST /books must pass first');
    const res = await fetch(`${BASE}/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Dune Messiah' }),
    });
    expect(res.status, 'status').toBe(200);
    const body = await res.json();
    expect(body.title, 'updated title').toBe('Dune Messiah');
  });

  await test('DELETE /books/:id — deletes a book', async () => {
    if (!bookId) throw new Skip('POST /books must pass first');
    const res = await fetch(`${BASE}/books/${bookId}`, { method: 'DELETE' });
    expect(res.status, 'status').toBe(200);
  });

  console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
  if (fail === 0 && skip === 0) {
    const code = Buffer.from('eGs3LXZ3cXo=', 'base64').toString();
    console.log(`\nVerification code: ${code}`);
  }
  if (fail > 0) process.exit(1);
}

run().catch(() => {
  console.error(
    '\nCould not reach the server. Make sure it is running on port 3000.\n',
  );
  process.exit(1);
});
