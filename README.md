# IIT Campus Banking System Frontend

A modern, secure, and user-friendly banking system frontend built with Next.js 13+, TypeScript, and Tailwind CSS. This system provides banking services for campus users with separate interfaces for regular users and administrators.

## Features

### User Features

-   🔐 Secure Authentication System
-   💰 Account Balance Management
-   💸 Money Transfers
-   📥 Deposits
-   📤 Withdrawals
-   📊 Transaction History
-   🔄 Real-time Updates

### Admin Features

-   👥 User Management
-   📈 Transaction Monitoring
-   🏦 System Overview
-   📊 User Statistics

## Tech Stack

-   **Framework**: Next.js 13+ (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **State Management**: React Context
-   **Authentication**: JWT-based auth
-   **HTTP Client**: Native Fetch API

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Backend API running (see Backend Repository)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/IIT_Campus_Banking_System_Frontend.git
cd IIT_Campus_Banking_System_Frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
IIT_Campus_Banking_System_Frontend/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── login/               # Login route
│   ├── dashboard/           # User dashboard
│   └── admin-dashboard/     # Admin dashboard
├── components/              # Reusable components
│   └── ui/                 # UI components
├── lib/                    # Utilities and contexts
│   ├── auth-context.tsx    # Auth context
│   └── api.ts             # API functions
└── public/                 # Static assets
```

## Key Features Explained

### Authentication

-   JWT-based authentication
-   Role-based access control (User/Admin)
-   Persistent sessions
-   Secure token storage

### User Dashboard

-   Real-time balance display
-   Transaction history
-   Money transfer functionality
-   Deposit and withdrawal features

### Admin Dashboard

-   Complete user management
-   Transaction monitoring
-   System statistics
-   User activity tracking

## API Integration

The frontend connects to a RESTful API with the following main endpoints:

-   `/auth/login` - User authentication
-   `/auth/admin/login` - Admin authentication
-   `/admin/users` - User management (Admin only)
-   `/admin/transactions` - Transaction monitoring (Admin only)
-   `/transactions` - User transactions
-   `/accounts` - Account management

## Security Features

-   JWT token authentication
-   Protected routes
-   Role-based access control
-   Secure credential handling
-   XSS protection
-   CORS configuration

## Development

### Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Code Style

-   ESLint configuration for TypeScript
-   Prettier for code formatting
-   Husky for pre-commit hooks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Tailwind CSS](https://tailwindcss.com)
-   [shadcn/ui](https://ui.shadcn.com)
-   [TypeScript](https://www.typescriptlang.org)

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/your-username/IIT_Campus_Banking_System_Frontend](https://github.com/your-username/IIT_Campus_Banking_System_Frontend)
