import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../../models/product.model';

export type QuoteItemMode = 'compra' | 'regalo';

export interface QuoteItem {
  product: Product;
  quantity: number;
  mode: QuoteItemMode;
}

const FINANCE_FACTOR_TABLE: Record<number, number> = { 2: 0.5260, 3: 0.3560, 4: 0.2710, 5: 0.2210, 6: 0.1870, 7: 0.1630, 8: 0.1450, 9: 0.1310, 10: 0.1200, 11: 0.1100, 12: 0.1030, 13: 0.0960, 14: 0.0910, 15: 0.0860, 16: 0.0820, 17: 0.0780, 18: 0.0750, 19: 0.0720, 20: 0.0700, 21: 0.0670, 22: 0.0650, 23: 0.0630, 24: 0.0620, 25: 0.0600, 26: 0.0580, 27: 0.0570, 28: 0.0560, 29: 0.0550 };

@Injectable({ providedIn: 'root' })
export class QuoteStateService {
  private readonly itemsSignal = signal<QuoteItem[]>([]);
  private readonly modalOpenSignal = signal(false);
  private readonly giftPercentSignal = signal<number>(30);
  private readonly financingMonthsSignal = signal<number>(12);

  readonly items = computed(() => this.itemsSignal());
  readonly modalOpen = computed(() => this.modalOpenSignal());
  readonly giftPercent = computed(() => this.giftPercentSignal());
  readonly financingMonths = computed(() => this.financingMonthsSignal());
  readonly purchaseTotal = computed(() => this.itemsSignal().filter(i => i.mode === 'compra').reduce((s, i) => s + this.lineTotal(i), 0));
  readonly giftTotal = computed(() => this.itemsSignal().filter(i => i.mode === 'regalo').reduce((s, i) => s + this.lineTotal(i), 0));
  readonly giftLimit = computed(() => this.purchaseTotal() * (this.giftPercentSignal() / 100));
  readonly giftRemaining = computed(() => this.giftLimit() - this.giftTotal());
  readonly isValid = computed(() => this.giftTotal() <= this.giftLimit());
  readonly installments = computed(() => [3, 6, 9, 12].map(months => ({ months, amount: this.purchaseTotal() / months })));
  readonly financing = computed(() => this.computeFinancing());

  add(product: Product, quantity = 1): void {
    const current = this.itemsSignal();
    const existing = current.find(item => item.product.id === product.id && item.mode === 'compra');
    if (existing) { this.itemsSignal.set(current.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item)); return; }
    this.itemsSignal.set([...current, { product, quantity, mode: 'compra' }]);
  }

  remove(productId: string, mode: QuoteItemMode): void { this.itemsSignal.set(this.itemsSignal().filter(item => !(item.product.id === productId && item.mode === mode))); }
  updateMode(productId: string, previousMode: QuoteItemMode, nextMode: QuoteItemMode): void { const current = this.itemsSignal(); const item = current.find(i => i.product.id === productId && i.mode === previousMode); if (!item) return; const duplicated = current.find(i => i.product.id === productId && i.mode === nextMode); if (duplicated) { this.itemsSignal.set(current.filter(i => !(i.product.id === productId && i.mode === previousMode)).map(i => (i.product.id === productId && i.mode === nextMode ? { ...i, quantity: i.quantity + item.quantity } : i))); return; } this.itemsSignal.set(current.map(i => (i.product.id === productId && i.mode === previousMode ? { ...i, mode: nextMode } : i))); }
  updateQuantity(productId: string, mode: QuoteItemMode, quantity: number): void { const safeQty = Math.max(1, Math.floor(quantity || 1)); this.itemsSignal.set(this.itemsSignal().map(item => item.product.id === productId && item.mode === mode ? { ...item, quantity: safeQty } : item)); }
  setGiftPercent(percent: number): void { this.giftPercentSignal.set(Math.max(0, Math.min(100, Number(percent) || 0))); }
  setFinancingMonths(months: number): void { this.financingMonthsSignal.set(Math.max(2, Math.min(29, Math.floor(Number(months) || 2)))); }

  getProductFinanceInfo(product: Product): { anticipo: number; saldo: number; mensualidades?: number; factor?: number } {
    const price = Number(product.precio_base || 0);
    const monthly = Number((product as any).mensualidades || 0);
    const down = Number((product as any).anticipo || 0);
    const selectedMonths = this.financingMonthsSignal();
    const factor = monthly > 0 ? monthly / 100 : (FINANCE_FACTOR_TABLE[selectedMonths] ?? FINANCE_FACTOR_TABLE[12]);
    const anticipo = down > 0 ? down : Math.round(price * 0.3);
    const saldo = Math.max(0, price - anticipo);
    return { anticipo, saldo, mensualidades: monthly > 0 ? monthly : selectedMonths, factor };
  }

  openModal(): void { this.modalOpenSignal.set(true); }
  closeModal(): void { this.modalOpenSignal.set(false); }
  clear(): void { this.itemsSignal.set([]); this.giftPercentSignal.set(30); this.financingMonthsSignal.set(12); this.modalOpenSignal.set(false); }

  private lineTotal(item: QuoteItem): number { return Number(item.product.precio_base || 0) * item.quantity; }
  private computeFinancing() { const months = this.financingMonthsSignal(); const purchaseItems = this.itemsSignal().filter(i => i.mode === 'compra'); const totalAnticipo = purchaseItems.reduce((sum, item) => sum + this.getProductFinanceInfo(item.product).anticipo * item.quantity, 0); const totalCompra = this.purchaseTotal(); const saldo = Math.max(0, totalCompra - totalAnticipo); const factor = FINANCE_FACTOR_TABLE[months] ?? FINANCE_FACTOR_TABLE[12]; const mensualidad = Math.round(saldo * factor); const totalFinanciado = mensualidad * months; return { months, totalCompra, totalAnticipo, saldo, factor, mensualidad, totalFinanciado, items: purchaseItems.map(item => ({ name: item.product.nombre, ...this.getProductFinanceInfo(item.product), quantity: item.quantity })) }; }
}
