import Book from '../src/models/book.ts';
import Review from '../src/models/review.ts';

let pass = 0;
let fail = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch (err) {
    console.log(`❌ ${label} — ${err.message}`);
    fail++;
  }
}

function expectError(doc, path) {
  const err = doc.validateSync();
  if (!err || !err.errors[path]) {
    throw new Error(`expected a validation error on '${path}', but got none`);
  }
}

function expectNoError(doc, path) {
  const err = doc.validateSync();
  if (err && err.errors[path]) {
    throw new Error(`expected no validation error on '${path}', but got: ${err.errors[path].message}`);
  }
}

console.log('\nLesson 06: Building Your First Models\n');

// ── Review model ──────────────────────────────────────────────────────────────

test('Review — text is required', () => {
  expectError(new Review({ rating: 4 }), 'text');
});

test('Review — text enforces minlength of 5', () => {
  expectError(new Review({ text: 'hi', rating: 4 }), 'text');
});

test('Review — text enforces maxlength of 500', () => {
  expectError(new Review({ text: 'x'.repeat(501), rating: 4 }), 'text');
});

test('Review — rating is required', () => {
  expectError(new Review({ text: 'Great book!' }), 'rating');
});

test('Review — valid document passes validation', () => {
  expectNoError(new Review({ text: 'Great book!', rating: 5 }), 'text');
  expectNoError(new Review({ text: 'Great book!', rating: 5 }), 'rating');
});

// ── Book model ────────────────────────────────────────────────────────────────

test('Book — title is required', () => {
  expectError(new Book({ genre: 'fiction' }), 'title');
});

test('Book — title enforces minlength of 2', () => {
  expectError(new Book({ title: 'X', genre: 'fiction' }), 'title');
});

test('Book — title enforces maxlength of 100', () => {
  expectError(new Book({ title: 'x'.repeat(101), genre: 'fiction' }), 'title');
});

test('Book — genre is required', () => {
  expectError(new Book({ title: 'Dune' }), 'genre');
});

test('Book — genre rejects values outside the enum', () => {
  expectError(new Book({ title: 'Dune', genre: 'fantasy' }), 'genre');
});

test('Book — genre accepts all valid enum values', () => {
  for (const g of ['fiction', 'non-fiction', 'biography', 'science', 'history']) {
    expectNoError(new Book({ title: 'Dune', genre: g }), 'genre');
  }
});

test('Book — year is optional', () => {
  expectNoError(new Book({ title: 'Dune', genre: 'fiction' }), 'year');
});

test('Book — tags is an array', () => {
  const doc = new Book({ title: 'Dune', genre: 'fiction', tags: ['scifi', 'epic'] });
  const err = doc.validateSync();
  if (err) throw new Error(`unexpected validation error: ${err.message}`);
  if (!Array.isArray(doc.tags)) throw new Error('tags is not an array');
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from('cGsyLXJqeXQ=', 'base64').toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
