'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { type CartItem, type Product } from './types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; product: Product; qty?: number }
  | { type: 'REMOVE'; slug: string }
  | { type: 'SET_QTY'; slug: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const qty = action.qty ?? 1;
      const existing = state.items.find(i => i.product.slug === action.product.slug);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.slug === action.product.slug
              ? { ...i, quantity: Math.min(i.quantity + qty, action.product.stock) }
              : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: qty }] };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.product.slug !== action.slug) };
    case 'SET_QTY':
      if (action.qty <= 0) return { items: state.items.filter(i => i.product.slug !== action.slug) };
      return {
        items: state.items.map(i =>
          i.product.slug === action.slug ? { ...i, quantity: action.qty } : i
        ),
      };
    case 'CLEAR':
      return { items: [] };
    case 'HYDRATE':
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  count: 0,
  total: 0,
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mali_cart');
      if (saved) {
        const items = JSON.parse(saved) as CartItem[];
        if (Array.isArray(items)) dispatch({ type: 'HYDRATE', items });
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('mali_cart', JSON.stringify(state.items));
  }, [state.items]);

  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  const total = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        count,
        total,
        add: (p, q) => dispatch({ type: 'ADD', product: p, qty: q }),
        remove: (slug) => dispatch({ type: 'REMOVE', slug }),
        setQty: (slug, qty) => dispatch({ type: 'SET_QTY', slug, qty }),
        clear: () => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
