<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lTkY0tCcubhFi2Tn961yle5BBbSuu4RS

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development vs Production Usage Tracking

### Development Mode (localhost)
- Uses localStorage for usage tracking as fallback
- Allows testing without server-side API
- Shows console warnings about development mode
- Daily limits still enforced for testing

### Production Mode (enhanceaiprompt.com)
- Uses server-side IP-based rate limiting
- Bulletproof usage enforcement
- Cannot be bypassed by users
- Drives premium conversions effectively

## Build for Production

```bash
npm run build
```

Upload the `dist/` folder contents to your hosting provider.
