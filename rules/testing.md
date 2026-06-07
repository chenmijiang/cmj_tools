Write every test as a specification of behavior, not a description of code. **A test verifies behavior through the public interface and must survive any refactor that does not change behavior.** Spend test effort by **value and risk, not by coverage numbers**: a good test proves a capability a caller depends on, reads like a sentence ("user can checkout with valid cart"), and breaks only when that capability breaks.

## Scope — when these rules apply

**Apply whenever test code is written or judged**, by a human or an AI:

- Writing a new unit/integration test, or generating one.
- Reviewing a test — use these rules as the rubric.
- Deciding what to test, or whether something is worth testing.
- Choosing what to mock, or designing code to be testable.
- Diagnosing a brittle or flaky test.

**Out of scope** (governed elsewhere, not by this document):

- Suite speed, CI sharding, parallelism.
- Coverage gating, thresholds, mutation-testing setup.
- Test framework configuration and environment.
- Testing ROI or defect metrics.
- The TDD red-green-refactor process.
- E2E, visual, load, and security testing techniques.

## Strategy — what and how much to test

- **Treat the module's public API as the unit.** Drive tests through the outward interface; let internal collaborators run for real. Never reach into internals.
- **Select by risk, not by completeness.** Prioritize business impact × failure probability × change frequency. Critical paths, complex branches, and anything that has produced a bug come first.
- **Keep an explicit do-not-test list:** trivial getters/setters, framework glue, pure config, throwaway scripts. You cannot and should not test everything; stopping is a decision, not a gap.
- **Match test shape to the layer.** Front-end: favor integration-style tests through the rendered, user-facing surface. Back-end: many pure-logic unit tests plus one layer of integration against a real test datastore.

## Tactics — how to write each case

- **Assert observable behavior, never implementation.** Verify outputs and effects a caller can see, through the interface — not by reaching past it.

```typescript
// GOOD: verifies behavior through the interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  expect((await getUser(user.id)).name).toBe("Alice");
});

// BAD: asserts an internal collaboration (implementation detail)
test("checkout calls paymentService.process", async () => {
  await checkout(cart, payment);
  expect(paymentService.process).toHaveBeenCalledWith(cart.total);
});

// BAD: reaches past the interface to verify
test("createUser saves to DB", async () => {
  await createUser({ name: "Alice" });
  expect(
    await db.query("SELECT * FROM users WHERE name = 'Alice'"),
  ).toBeDefined();
});
```

- **Derive assertions from the spec/intent, never from the current implementation — the single biggest failure mode when tests are generated.** Reading the code for context (types, signatures, real values) is fine, but asserting whatever the code happens to do only snapshots its bugs as correct and breaks on a behavior-preserving refactor.
- **Name the test after WHAT, not HOW**, and keep **one logical assertion per test**. "createUser makes user retrievable", not "createUser calls db.insert".
- **Design cases systematically**, never by ad-hoc guessing: equivalence partitions (one representative each), boundary values (empty, 0, max, null, out-of-range, off-by-one), and **error/exception paths are mandatory** — not just the happy path. For complex pure logic, assert an invariant and let the tool generate inputs (property-based).
- **Mock only at system boundaries:** external APIs, time, randomness, and (when needed) the database. **Never mock your own code or internal collaborators** — that re-couples the test to internal structure and is the top source of brittle tests. Design boundaries to be substitutable: inject dependencies, and prefer SDK-style interfaces over one generic fetcher.

```typescript
// Mockable: boundary injected
function pay(order, client) {
  return client.charge(order.total);
}
// Hard to mock: boundary constructed inside
function pay(order) {
  return new StripeClient(KEY).charge(order.total);
}

// Prefer SDK-style: each op independently mockable, one fixed shape
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  createOrder: (data) => fetch("/orders", { method: "POST", body: data }),
};
// Avoid a generic fetcher: forces conditional logic inside the mock
const api = { fetch: (endpoint, options) => fetch(endpoint, options) };
```

- **Make assertions strong.** A test whose only assertion is "did not throw" or `toBeDefined()` proves nothing.
- **No snapshot tests except for tiny, stable structures** — snapshots are where weak assertions hide.
- **Use the project's actual test API** (not another framework's), and **restore/clean mocks between tests** so state never leaks across tests.
