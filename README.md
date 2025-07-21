# Intranet Content Discovery MVP

A streamlined intranet platform for discovering recent company communications, built with Next.js 14, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 14, React 19, TypeScript, and Tailwind CSS v4
- **Component Library**: Integrated with shadcn/ui for consistent, accessible UI components
- **Code Quality**: ESLint, Prettier, and TypeScript for maintainable code
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Developer Experience**: Hot reload, type checking, and automated formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.17 or later
- npm, yarn, or pnpm package manager

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd intranet-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Available Scripts

| Script                 | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the development server            |
| `npm run build`        | Build the application for production    |
| `npm run start`        | Start the production server             |
| `npm run lint`         | Run ESLint to check for code issues     |
| `npm run lint:fix`     | Run ESLint and automatically fix issues |
| `npm run format`       | Format code with Prettier               |
| `npm run format:check` | Check if code is properly formatted     |
| `npm run type-check`   | Run TypeScript type checking            |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind CSS
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx    # Button component
│   │   └── card.tsx      # Card component
│   └── index.ts          # Component exports
├── lib/                  # Utility functions and configurations
│   ├── utils.ts          # Utility functions (cn, etc.)
│   └── constants.ts      # Application constants
├── types/                # TypeScript type definitions
│   └── index.ts          # Global type definitions
└── data/                 # Mock data and data utilities
    └── index.ts          # Mock data for development

Configuration Files:
├── components.json       # shadcn/ui configuration
├── eslint.config.mjs    # ESLint configuration
├── .prettierrc          # Prettier configuration
├── .prettierignore      # Prettier ignore rules
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🎨 Tech Stack

### Core Technologies

- **[Next.js 15.3.4](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework

### UI Components

- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons
- **[Class Variance Authority](https://cva.style/)** - Component variants

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[date-fns](https://date-fns.org/)** - Date utility library

## 🔧 Configuration

### Tailwind CSS v4

This project uses the latest Tailwind CSS v4 with the new configuration approach:

- No traditional `tailwind.config.js` file
- CSS-based configuration in `src/app/globals.css`
- PostCSS plugin setup in `postcss.config.mjs`

### shadcn/ui Setup

Components are configured with:

- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React

### Code Quality

- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking enabled

## 🚦 Getting Started with Development

### Adding New Components

1. **shadcn/ui Components**

   ```bash
   npx shadcn@latest add [component-name]
   ```

2. **Custom Components**
   - Create in `src/components/`
   - Export from `src/components/index.ts`
   - Follow the established patterns

### Code Style Guidelines

1. **Run linting and formatting before commits**

   ```bash
   npm run lint:fix
   npm run format
   npm run type-check
   ```

2. **Component Structure**
   - Use TypeScript for all components
   - Implement proper prop types
   - Follow the shadcn/ui patterns for consistency

3. **Import Organization**
   - External libraries first
   - Internal components and utilities
   - Type imports last

## 🔍 Environment Setup

### VS Code Extensions (Recommended)

- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- TypeScript Importer

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Add your environment variables here
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial

### Component Library

- [shadcn/ui Documentation](https://ui.shadcn.com/) - Component library documentation
- [Radix UI Primitives](https://www.radix-ui.com/primitives) - Unstyled component primitives

### Styling

- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Tailwind CSS v4 Alpha](https://tailwindcss.com/blog/tailwindcss-v4-alpha) - Latest features

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy with zero configuration

### Other Platforms

- **Netlify**: Supports Next.js with build plugins
- **AWS Amplify**: Full-stack deployment platform
- **Docker**: Use the included Dockerfile for containerization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
