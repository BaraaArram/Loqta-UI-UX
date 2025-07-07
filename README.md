# Loqta E-commerce Frontend

This is the frontend for the Loqta e-commerce platform, built with Next.js, React, and Tailwind CSS.

## 🚀 Features
- Modern authentication (JWT, registration, login, password reset)
- Product browsing, add/edit/delete (with image upload)
- User dashboard and profile management
- Real-time product chat
- Responsive, accessible UI

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repo
git clone https://github.com/yourusername/loqta-ui-ux.git
cd loqta-ui-ux

# Install dependencies
npm install
# or
yarn install
```

### Environment Variables
Create a `.env.local` file in the root with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
Adjust the URL to match your backend.

### Running the App
```bash
npm run dev
# or
yarn dev
```

### Building for Production
```bash
npm run build && npm start
# or
yarn build && yarn start
```

## 📦 Scripts
- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint

## 🤝 Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## 📝 License
MIT

---

For backend/API details, see the [AUTHENTICATION.md](./AUTHENTICATION.md) file.
