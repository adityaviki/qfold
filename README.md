# QFold

A modern AI chat application with hierarchical thread support, built with Next.js 16, PostgreSQL, and the Anthropic API.

## Features

- **Multi-threaded Conversations**: Create and manage multiple conversation threads
- **Branching Threads**: Select text from AI responses to create follow-up branches, keeping related discussions organized
- **Thread Hierarchy**: Navigate nested conversations with breadcrumb navigation
- **Streaming Responses**: Real-time streaming from Anthropic's Claude models
- **Dynamic Model Selection**: Fetches available models directly from Anthropic API
- **Markdown Rendering**: Full markdown support with syntax highlighting for code blocks
- **Dark Mode**: System-aware theme with manual toggle
- **Authentication**: Secure user authentication with NextAuth.js

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS v4
- **AI**: Anthropic Claude API (direct integration with streaming)
- **Auth**: NextAuth.js v5

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adityaviki/qfold.git
   cd qfold
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/qfold"
   AUTH_SECRET="your-auth-secret"
   ANTHROPIC_API_KEY="your-anthropic-api-key"
   ```

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Threads

- Click "New Chat" in the sidebar to start a new conversation
- Select a Claude model from the dropdown
- Type your message and press Enter or click Send

### Branching Conversations

1. Select any text in an AI response
2. Choose from the popup:
   - **Ask about this**: Continue in the same thread with the selected text as context
   - **New branch**: Create a nested thread focused on the selected text

### Navigating Branches

- The sidebar shows only root (main) threads
- When viewing a thread with branches, a panel on the right shows all child threads
- Breadcrumb navigation appears when in a nested thread, allowing quick navigation back up the hierarchy

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login/Register pages
│   ├── (main)/          # Main app with sidebar
│   │   └── chat/[threadId]/
│   └── api/
│       ├── auth/        # NextAuth endpoints
│       ├── chat/        # AI streaming endpoint
│       ├── models/      # Fetch available models
│       ├── messages/    # Message CRUD
│       └── threads/     # Thread CRUD
├── components/
│   ├── chat/            # Chat UI components
│   ├── sidebar/         # Sidebar components
│   └── ui/              # shadcn/ui components
└── lib/
    ├── auth.ts          # NextAuth configuration
    ├── prisma.ts        # Prisma client
    └── utils.ts         # Utility functions
```

## License

MIT
