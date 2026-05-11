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
  console.log('\nLesson 11: Reviews and Relationships\n');

  let bookId;
  let reviewId;

  await test('POST /books — creates a book', async () => {
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Foundation', genre: 'fiction', year: 1951 }),
    });
    expect(res.status, 'status').toBe(201);
    const body = await res.json();
    expect(typeof body._id, '_id type').toBe('string');
    bookId = body._id;
  });

  await test('POST /reviews — creates a review linked to the book', async () => {
    if (!bookId) throw new Skip('POST /books must pass first');
    const res = await fetch(`${BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'A classic of science fiction.',
        rating: 5,
        bookId,
      }),
    });
    expect(res.status, 'status').toBe(201);
    const body = await res.json();
    expect(typeof body._id, '_id type').toBe('string');
    expect(body.book, 'book field').toBe(bookId);
    reviewId = body._id;
  });

  await test('GET /reviews — returns reviews with populated book field', async () => {
    if (!reviewId) throw new Skip('POST /reviews must pass first');
    const res = await fetch(`${BASE}/reviews`);
    expect(res.status, 'status').toBe(200);
    const body = await res.json();
    expect(Array.isArray(body), 'response is array').toBeTrue();

    const review = body.find(r => r._id === reviewId);
    expect(!!review, 'review found in list').toBeTrue();
    expect(typeof review.book, 'book field type').toBe('object');
    expect(review.book._id, 'populated book._id').toBe(bookId);
  });

  console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
  if (fail === 0 && skip === 0) {
    const code = Buffer.from('d2Q5LWhwZmM=', 'base64').toString();
    console.log(`\nVerification code: ${code}`);
  }
  if (fail > 0) process.exit(1);
}

run().catch(() => {
  console.error('\nCould not reach the server. Make sure it is running on port 3000.\n');
  process.exit(1);
});
