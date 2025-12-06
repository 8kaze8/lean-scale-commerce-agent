# Lean Scale Commerce Agent

A Next.js-based AI commerce agent with Generative UI, built for case study demonstration.

## Features

- 🤖 AI-powered chat interface with LeanBot
- 🛍️ Product recommendations with visual cards
- 📦 Order status tracking with real-time updates
- 🎫 Coupon code management for delayed orders
- ⚡ Fast text reveal animations (Gemini-style)
- 🎨 Modern UI with Tailwind CSS and Shadcn/UI
- ✅ Comprehensive unit tests

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn/UI (Radix Primitives)
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **Markdown:** React Markdown
- **Testing:** Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm test:watch       # Run tests in watch mode
npm test:coverage    # Generate test coverage report
npm run lint         # Run ESLint
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── chat-layout.tsx    # Main chat interface
│   ├── chat-input.tsx     # Message input
│   └── ui/               # Shadcn/UI components
├── src/
│   ├── components/        # Feature components
│   │   ├── product-card.tsx
│   │   ├── order-box.tsx
│   │   ├── coupon-badge.tsx
│   │   └── ui-mapper.tsx
│   └── hooks/            # Custom React hooks
│       ├── use-chat.ts    # Chat logic & API integration
│       └── use-text-reveal.ts
└── __tests__/            # Test files
```

## Deployment on Vercel

### Step 1: Prepare Your Repository

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**

   - Sign up or log in with your GitHub/GitLab account

2. **Import Your Project**

   - Click "Add New..." → "Project"
   - Select your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Project Settings**

   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./lean-scale-commerce-agent` (if your repo has nested structure)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Environment Variables** (if needed)

   - Currently, the webhook URL is hardcoded
   - If you need to change it, add as environment variable:
     - `NEXT_PUBLIC_WEBHOOK_URL` (optional)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `your-project.vercel.app`

### Step 3: Custom Domain (Optional)

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables

If you need to configure the webhook URL dynamically:

1. Create `.env.local` file:

```env
NEXT_PUBLIC_WEBHOOK_URL=https://your-n8n-webhook-url.com/webhook/...
```

2. Update `src/hooks/use-chat.ts`:

```typescript
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "default-url";
```

3. Add to Vercel project settings → Environment Variables

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage
```

Current test coverage: **33/38 tests passing** (87% success rate)

## Features in Detail

### Chat Interface

- Real-time AI responses
- Rate limiting (5 messages/minute)
- Error handling with user-friendly messages
- Auto-scroll to latest message

### Product Recommendations

- Visual product cards
- Horizontal scrolling for multiple products
- Markdown-formatted AI responses
- Clean product list extraction

### Order Status

- Real-time order tracking
- Status indicators (Delivered, Shipped, Delayed)
- Delivery date display
- Coupon codes for delayed orders

### Coupon Management

- Copy-to-clipboard functionality
- Visual feedback on copy
- Fallback for older browsers

## Troubleshooting

### Build Errors

If you encounter build errors on Vercel:

1. **Check Node.js version**

   - Vercel uses Node.js 20.x by default
   - Can be changed in Project Settings → General

2. **Check build logs**

   - Go to Deployments → Click on failed deployment
   - Review build logs for specific errors

3. **Common issues:**
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Run `npm run build` locally first
   - Environment variables → Ensure they're set in Vercel

### Local Development Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

## License

This project is created for case study purposes.

## Support

For issues or questions, please check the deployment logs or test locally first.
