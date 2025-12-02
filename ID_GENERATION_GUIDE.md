# ID Generation Guide

This document explains which tables have auto-generated IDs and which require manual IDs.

## ✅ Auto-Generated IDs (UUID)

These tables **automatically generate** UUIDs when you insert records. You don't need to provide an `id` field:

### 1. `restaurants` Table
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
```
- ✅ **Auto-generated**: You don't need to provide `id` when inserting
- Example: `INSERT INTO restaurants (name, type, image, ...) VALUES (...)`

### 2. `menu_items` Table
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
```
- ✅ **Auto-generated**: You don't need to provide `id` when inserting
- Example: `INSERT INTO menu_items (name, description, base_price, ...) VALUES (...)`

### 3. `variations` Table
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
```
- ✅ **Auto-generated**: You don't need to provide `id` when inserting
- Example: `INSERT INTO variations (menu_item_id, name, price) VALUES (...)`

### 4. `add_ons` Table
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
```
- ✅ **Auto-generated**: You don't need to provide `id` when inserting
- Example: `INSERT INTO add_ons (menu_item_id, name, price, category) VALUES (...)`

### 5. `payment_methods` Table
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
```
- ✅ **Auto-generated**: You don't need to provide `id` when inserting
- Example: `INSERT INTO payment_methods (name, account_number, ...) VALUES (...)`

---

## ⚠️ Manual IDs Required (Text)

These tables **require you to provide** a text ID when inserting:

### 1. `categories` Table
```sql
id text PRIMARY KEY
```
- ⚠️ **Manual ID Required**: You MUST provide `id` when inserting
- The ID is a text string (e.g., 'hot-coffee', 'dim-sum', 'jollibee-burgers')
- Example: `INSERT INTO categories (id, name, icon, ...) VALUES ('hot-coffee', 'Hot Coffee', '☕', ...)`

### 2. `site_settings` Table
```sql
id text PRIMARY KEY
```
- ⚠️ **Manual ID Required**: You MUST provide `id` when inserting
- The ID is a text string (e.g., 'site_name', 'site_logo', 'currency')
- Example: `INSERT INTO site_settings (id, value, type, ...) VALUES ('site_name', 'Beracah Cafe', 'text', ...)`

---

## Usage in Code

### When Adding a Restaurant (Auto-Generated ID)
```typescript
// ✅ You DON'T need to provide id - it's auto-generated
const { data, error } = await supabase
  .from('restaurants')
  .insert({
    name: 'My Restaurant',
    type: 'Restaurant',
    image: 'https://...',
    // id is NOT needed - auto-generated!
  });
```

### When Adding a Menu Item (Auto-Generated ID)
```typescript
// ✅ You DON'T need to provide id - it's auto-generated
const { data, error } = await supabase
  .from('menu_items')
  .insert({
    name: 'Burger',
    description: 'Delicious burger',
    base_price: 100,
    category: 'burgers',
    restaurant_id: 'restaurant-uuid',
    // id is NOT needed - auto-generated!
  });
```

### When Adding a Category (Manual ID Required)
```typescript
// ⚠️ You MUST provide id - it's NOT auto-generated
const { data, error } = await supabase
  .from('categories')
  .insert({
    id: 'my-category', // ← REQUIRED!
    name: 'My Category',
    icon: '🍕',
    sort_order: 1,
  });
```

### When Adding a Site Setting (Manual ID Required)
```typescript
// ⚠️ You MUST provide id - it's NOT auto-generated
const { data, error } = await supabase
  .from('site_settings')
  .insert({
    id: 'site_name', // ← REQUIRED!
    value: 'My Cafe',
    type: 'text',
  });
```

---

## Why Different ID Types?

### UUID (Auto-Generated)
- **Used for**: Dynamic data that users create (restaurants, menu items, etc.)
- **Advantage**: Guaranteed unique, no conflicts
- **Example**: Each restaurant gets a unique UUID automatically

### Text (Manual)
- **Used for**: Configuration/settings that need readable IDs
- **Advantage**: Human-readable, easy to reference in code
- **Example**: 'site_name' is easier to remember than a UUID

---

## Summary Table

| Table | ID Type | Auto-Generated? | Required on Insert? |
|-------|---------|----------------|---------------------|
| `restaurants` | uuid | ✅ Yes | ❌ No |
| `menu_items` | uuid | ✅ Yes | ❌ No |
| `variations` | uuid | ✅ Yes | ❌ No |
| `add_ons` | uuid | ✅ Yes | ❌ No |
| `payment_methods` | uuid | ✅ Yes | ❌ No |
| `categories` | text | ❌ No | ✅ Yes |
| `site_settings` | text | ❌ No | ✅ Yes |

---

## Best Practices

1. **For UUID tables**: Never provide `id` when inserting - let the database generate it
2. **For text ID tables**: Always provide a meaningful, readable ID
3. **Category IDs**: Use kebab-case (e.g., 'hot-coffee', 'dim-sum')
4. **Setting IDs**: Use snake_case (e.g., 'site_name', 'currency_code')

---

**Note**: When you insert a record with an auto-generated ID, Supabase will return the generated ID in the response, which you can use for subsequent operations.

