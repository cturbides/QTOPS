import { Money } from '@shared-kernel/value-objects/money';

describe('Money Value Object', () => {
  it('debe sumar montos de la misma divisa', () => {
    const m1 = new Money(100, 'USD');
    const m2 = new Money(50, 'USD');
    expect(m1.add(m2).getValue()).toBe(150);
  });

  it('debe fallar si las divisas son diferentes', () => {
    const m1 = new Money(100, 'USD');
    const m2 = new Money(50, 'EUR');
    expect(() => m1.add(m2)).toThrow(/diferentes divisas/);
  });

  it('debe multiplicar correctamente', () => {
    const m = new Money(100, 'USD');
    expect(m.multiply(2).getValue()).toBe(200);
  });

  it('no debe aceptar valores negativos', () => {
    expect(() => new Money(-1, 'USD')).toThrow(/no puede ser negativo/);
  });
});
