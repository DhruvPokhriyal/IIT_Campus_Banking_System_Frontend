# IIT Campus Banking System Frontend

A modern, secure, and user-friendly banking system frontend designed specifically for IIT campuses. This Next.js application provides a seamless banking experience with features tailored for students, faculty, and administrative staff.

## 🚀 Features

-   **User Authentication**

    -   Secure login and registration system
    -   Role-based access control (Student, Faculty, Admin)
    -   Password protection and session management

-   **Dashboard**

    -   Real-time account overview
    -   Transaction history
    -   Quick access to common banking operations

-   **Admin Dashboard**

    -   User management
    -   Transaction monitoring
    -   System analytics and reporting

-   **Modern UI/UX**
    -   Responsive design
    -   Dark/Light mode support
    -   Intuitive navigation
    -   Interactive data visualizations

## 🛠️ Tech Stack

-   **Frontend Framework**: Next.js 15.2.4
-   **UI Components**: Radix UI
-   **Styling**: Tailwind CSS
-   **Form Handling**: React Hook Form with Zod validation
-   **State Management**: React Context
-   **Charts & Visualizations**: Recharts
-   **Date Handling**: date-fns
-   **Type Safety**: TypeScript
-   **Build Tools**:
    -   PostCSS
    -   Tailwind CSS
    -   Autoprefixer

## 📦 Installation

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
    # or
    pnpm install
    ```

3. Create a `.env.local` file in the root directory and add your environment variables:

    ```
    NEXT_PUBLIC_API_URL=your_api_url
    # Add other environment variables as needed
    ```

4. Start the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin-dashboard/   # Admin interface
│   ├── dashboard/         # User dashboard
│   ├── login/            # Authentication pages
│   └── register/
├── components/            # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── public/               # Static assets
└── styles/              # Global styles and Tailwind config
```

## 🎯 Usage

1. **Authentication**

    - Navigate to `/login` to access your account
    - New users can register at `/register`

2. **Dashboard**

    - After login, you'll be redirected to your personalized dashboard
    - Access account information, transactions, and banking features

3. **Admin Features**
    - Access the admin dashboard at `/admin-dashboard`
    - Manage users, monitor transactions, and view system analytics

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact the development team or open an issue in the repository.

---

Built with ❤️ for IIT campuses
