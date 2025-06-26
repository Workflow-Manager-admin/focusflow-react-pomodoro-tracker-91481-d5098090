# Supabase Integration for Pomodoro Timer Frontend

## Status

✅ Supabase has been fully configured for this React project using the provided credentials.

---

## Project Supabase Configuration

- **Supabase URL:** `https://qessfkdpxpgptqksmlip.supabase.co`
- **Anon Key:** (stored securely in `.env`)
- `.env` file variables:
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`

---

## How It Works

- The app uses [Supabase JavaScript client](https://supabase.com/docs/reference/javascript) for browser-based access to authentication, database, and storage features.
- Credentials are injected at build-time using `.env` and **must start with `REACT_APP_`** for Create React App to expose them to code.

### Where is the client initialized?

`src/supabaseClient.js`:
```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
```

### Usage Example in Other Files

```js
import supabase from './supabaseClient';

// Example usage:
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});
```

---

## Ready for Features

- User authentication (sign-in, sign-up, etc.) via Supabase
- Storage and retrieval of tasks or Pomodoro sessions (future implementation)
- Easy import via `supabase` export

---

## Developer Setup

1. **Credentials are already stored in `.env`.**  
   *If you need to update them, edit file: `pomodoro_timer_frontend/.env`*
2. **Install dependencies**: Make sure `@supabase/supabase-js` is installed via `npm install`.
3. **Import and use** Supabase client from `src/supabaseClient.js`.

---

## Notes

- Never commit your `.env` with secrets for public repos (but anon key is safe for client usage).
- To add Supabase-backed features, import and use the client from `supabaseClient.js`.

_Last updated automatically: Supabase integration complete._
