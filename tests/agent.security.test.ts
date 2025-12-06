export function double(x: number) {
  return x * 2;
}


test("double", () => {
  expect(double(5)).toBe(10);
})