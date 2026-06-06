import { createClient, type Client, type InValue } from '@libsql/client';

/**
 * Database client — libSQL.
 * - Local dev: defaults to a local SQLite file (`file:mali.db`).
 * - Production: set TURSO_DATABASE_URL (libsql://...) + TURSO_AUTH_TOKEN.
 * The same client/queries work in both — only the env URL changes.
 */
const g = globalThis as unknown as { _libsql?: Client; _libsqlInit?: Promise<void> };

function client(): Client {
  if (!g._libsql) {
    const url = process.env.TURSO_DATABASE_URL || 'file:mali.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;
    g._libsql = createClient(authToken ? { url, authToken, intMode: 'number' } : { url, intMode: 'number' });
  }
  return g._libsql;
}

function ensureInit(): Promise<void> {
  if (!g._libsqlInit) g._libsqlInit = initSchema(client());
  return g._libsqlInit;
}

/** Initialized client — use for transactions. */
export async function getDb(): Promise<Client> {
  await ensureInit();
  return client();
}

export async function dbAll<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T[]> {
  await ensureInit();
  const rs = await client().execute({ sql, args });
  return rs.rows as unknown as T[];
}

export async function dbGet<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  const rows = await dbAll<T>(sql, args);
  return rows[0];
}

export async function dbRun(sql: string, args: InValue[] = []) {
  await ensureInit();
  return client().execute({ sql, args });
}

async function initSchema(c: Client): Promise<void> {
  await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_al TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_al TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_al TEXT,
      description_en TEXT,
      price REAL NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      slug TEXT UNIQUE NOT NULL,
      stock INTEGER DEFAULT 0,
      images TEXT DEFAULT '[]',
      featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 5,
      review_count INTEGER DEFAULT 0,
      old_price REAL,
      is_new INTEGER DEFAULT 0,
      barcode TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_city TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      source TEXT DEFAULT 'online',
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_slug TEXT,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );
  `);

  // Migrations — add columns if upgrading an older DB
  const cols = (await c.execute(`PRAGMA table_info(products)`)).rows as unknown as { name: string }[];
  const has = (col: string) => cols.some(x => x.name === col);
  if (!has('rating')) await c.execute(`ALTER TABLE products ADD COLUMN rating REAL DEFAULT 5`);
  if (!has('review_count')) await c.execute(`ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0`);
  if (!has('old_price')) await c.execute(`ALTER TABLE products ADD COLUMN old_price REAL`);
  if (!has('is_new')) await c.execute(`ALTER TABLE products ADD COLUMN is_new INTEGER DEFAULT 0`);
  if (!has('barcode')) await c.execute(`ALTER TABLE products ADD COLUMN barcode TEXT`);

  const orderCols = (await c.execute(`PRAGMA table_info(orders)`)).rows as unknown as { name: string }[];
  if (!orderCols.some(x => x.name === 'source')) {
    await c.execute(`ALTER TABLE orders ADD COLUMN source TEXT DEFAULT 'online'`);
  }

  // Indexes — keep lookups fast at 1k–2k+ products
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)`);
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`);

  const count = (await c.execute(`SELECT COUNT(*) AS c FROM categories`)).rows[0].c as number;
  if (count === 0) await seedDb(c);
}

async function seedDb(c: Client): Promise<void> {
  const cats: [string, string, string, string][] = [
    ['Jelekë & Mbrojtje', 'Vests & Protection', 'vests', 'Shield'],
    ['Çanta Taktike', 'Tactical Bags', 'bags', 'Backpack'],
    ['Uniforma', 'Uniforms', 'uniforms', 'Shirt'],
    ['Pajisje', 'Equipment', 'equipment', 'Wrench'],
    ['Aksesorë', 'Accessories', 'accessories', 'Layers'],
  ];
  for (const cat of cats) {
    await c.execute({ sql: 'INSERT INTO categories (name_al, name_en, slug, icon) VALUES (?, ?, ?, ?)', args: cat });
  }

  const products = [
    { name_al: 'Pentagon Vest Pro', name_en: 'Pentagon Vest Pro', desc_al: 'Jelek taktik i klasit të lartë me sistem MOLLE dhe shumë xhepa. I përshtatshëm për operacione të rënda dhe kushte ekstreme. Material Cordura 500D.', desc_en: 'High-grade tactical vest with MOLLE system and multiple pockets. Suitable for heavy operations and extreme conditions. 500D Cordura material.', price: 149.99, cat: 'vests', slug: 'pentagon-vest-pro', stock: 15, featured: 1 },
    { name_al: 'Çantë Patrullimi 35L', name_en: 'Patrol Backpack 35L', desc_al: 'Çantë shpine taktike 35 litra me ndarje të shumta dhe sistem MOLLE të jashtëm. Ideal për patrullim dhe operacione afatshkurtra.', desc_en: '35-liter tactical backpack with multiple compartments and external MOLLE system. Ideal for patrol and short-term operations.', price: 89.99, cat: 'bags', slug: 'patrol-backpack-35l', stock: 23, featured: 1 },
    { name_al: 'Rrip Taktik MK2', name_en: 'Tactical Belt MK2', desc_al: 'Rrip taktik me bravë metalike QD, i rregullueshëm dhe ultra i qëndrueshëm. Gjerësia 45mm, mbart çdo pajisje taktike.', desc_en: 'Tactical belt with QD metal buckle, adjustable and ultra-durable. 45mm width, carries any tactical equipment.', price: 45.99, cat: 'accessories', slug: 'tactical-belt-mk2', stock: 42, featured: 1 },
    { name_al: 'Xhaketë Fushe Multicam', name_en: 'Multicam Field Jacket', desc_al: 'Xhaketë taktike me kamuflim Multicam OCP, rezistente ndaj ujit dhe erës. Me shumë xhepa dhe mundësi personalizimi.', desc_en: 'Tactical jacket with Multicam OCP camouflage, water and wind resistant. Multiple pockets and customization options.', price: 199.99, cat: 'uniforms', slug: 'multicam-field-jacket', stock: 8, featured: 0 },
    { name_al: 'Çantëz EDC Modulare', name_en: 'Modular EDC Pouch', desc_al: 'Set çantëzash modulare EDC me lidhës MOLLE. Perfekte për organizimin e pajisjeve të vogla dhe aksesorëve taktikë.', desc_en: 'Modular EDC pouch set with MOLLE connectors. Perfect for organizing small equipment and tactical accessories.', price: 34.99, cat: 'accessories', slug: 'modular-edc-pouch', stock: 56, featured: 0 },
    { name_al: 'Mbrojtëse Gjunjësh Pro', name_en: 'Pro Knee Pads', desc_al: 'Mbrojtëse gjunjësh profesionale me amortizim gel D3O dhe fiksim elastik i dyfisht. Siguri maksimale pa kufizuar lëvizjen.', desc_en: 'Professional knee pads with D3O gel cushioning and double elastic fastening. Maximum protection without restricting movement.', price: 39.99, cat: 'equipment', slug: 'pro-knee-pads', stock: 31, featured: 0 },
    { name_al: 'Çantë Asaulti 25L', name_en: 'Assault Pack 25L', desc_al: 'Çantë kompakte asaulti 25 litra, ideale për misione afatshkurtra. Profile të ulët, me fiksim MOLLE dhe rripa kompresimi.', desc_en: 'Compact 25-liter assault pack, ideal for short missions. Low profile, with MOLLE attachment and compression straps.', price: 79.99, cat: 'bags', slug: 'assault-pack-25l', stock: 18, featured: 0 },
    { name_al: 'Doreza Luftimi', name_en: 'Combat Gloves', desc_al: 'Doreza taktike me shuplaka të reinforcuara me lëkurë kaproje dhe gishta të shkurtëra. Grip i shkëlqyer dhe ndjesia natyrore.', desc_en: 'Tactical gloves with reinforced goatskin leather palms and cut fingers. Excellent grip and natural feel.', price: 29.99, cat: 'accessories', slug: 'combat-gloves', stock: 67, featured: 0 },
    { name_al: 'Jelek Fushe Lehtë', name_en: 'Lightweight Field Vest', desc_al: 'Jelek i lehtë për operacione të shpejta me shumë xhepa dhe panele ajrimi anash. Pesha vetëm 680g.', desc_en: 'Lightweight vest for quick operations with multiple pockets and side ventilation panels. Only 680g weight.', price: 89.99, cat: 'vests', slug: 'lightweight-field-vest', stock: 12, featured: 0 },
    { name_al: 'Sistem Holsteri Taktik', name_en: 'Tactical Holster System', desc_al: 'Sistem holsteri me kuti sigurie rotative dhe fiksim kofshësh, i pajtueshëm me pistoleta të shumë modeleve.', desc_en: 'Holster system with rotating safety lock and thigh retention, compatible with most pistol models.', price: 55.99, cat: 'accessories', slug: 'tactical-holster-system', stock: 9, featured: 0 },
    { name_al: 'Çantë Hidratimi 3L', name_en: 'Hydration Pack 3L', desc_al: 'Çantë shpine hidratimi 3 litra me shtresë termale dhe gyp i gjatë fleksibël. Mbron ujin i ftohtë për deri 6 orë.', desc_en: '3-liter hydration backpack with thermal layer and flexible long tube. Keeps water cold for up to 6 hours.', price: 64.99, cat: 'bags', slug: 'hydration-pack-3l', stock: 27, featured: 0 },
    { name_al: 'Pantallona Taktike Ripstop', name_en: 'Ripstop Tactical Pants', desc_al: 'Pantallona taktike nga materiali Ripstop me xhepa të shumta dhe rripa kyçjeje. Rezistente dhe fleksibile për çdo terren.', desc_en: 'Ripstop tactical pants with multiple pockets and ankle straps. Durable and flexible for any terrain.', price: 79.99, cat: 'uniforms', slug: 'ripstop-tactical-pants', stock: 19, featured: 0 },
  ];

  const ratings = [4.5, 5, 5, 4, 5, 4.5, 5, 4, 4.5, 5, 4, 5];
  const reviews = [12, 34, 8, 21, 47, 15, 9, 53, 6, 18, 27, 11];
  const saleIdx = new Set([2, 4, 7, 10]);
  const newIdx = new Set([0, 1, 6, 11]);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const onSale = saleIdx.has(i);
    const oldPrice = onSale ? Math.round((p.price / (1 - (0.12 + (i % 3) * 0.05))) * 100) / 100 : null;
    const barcode = '59' + String(i + 1).padStart(11, '0');
    await c.execute({
      sql: `INSERT INTO products
        (name_al, name_en, description_al, description_en, price, category_id, slug, stock, featured, rating, review_count, old_price, is_new, barcode)
        VALUES (?, ?, ?, ?, ?, (SELECT id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.name_al, p.name_en, p.desc_al, p.desc_en, p.price, p.cat, p.slug, p.stock, p.featured, ratings[i] ?? 5, reviews[i] ?? 0, oldPrice, newIdx.has(i) ? 1 : 0, barcode],
    });
  }
}
