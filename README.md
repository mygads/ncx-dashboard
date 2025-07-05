# NCX Telkom Dashboard by Rezky Gobel

A modern dashboard application built with Next.js, TypeScript, and Tailwind CSS for managing and visualizing Telkom data.

## 🚀 Features

- 📊 Interactive data visualization with charts and graphs
- 🔐 Authentication with Supabase
- 📱 Responsive design for all devices
- 🎨 Modern UI with shadcn/ui components
- 📈 Real-time data from Google Sheets integration
- 🌙 Dark/Light mode support

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 18.0 or higher
- **npm** or **pnpm**: Package manager
- **Git**: For cloning the repository

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mygads/ncx-dashboard.git
cd ncx-dashboard
```

Remove .git

### 2. Environment Configuration

Copy the environment example file and configure it:

```bash
cp .env.example .env
```

Or create a new `.env` file in the root directory with the following variables:

```properties
NODE_ENV=production

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_SPREADSHEET_ID=
NEXT_PUBLIC_SPREADSHEET_API_KEY=
NEXT_PUBLIC_GOOGLE_API_KEY=
```

### 3. Supabase Setup

#### 3.1 Create Supabase Account
1. Go to [Supabase](https://supabase.com/)
2. Click "Start your project"
3. Sign up with your email or GitHub account

#### 3.2 Create New Project
1. Click "New Project"
2. Choose your organization
3. Enter project name (e.g., "ncx-dashboard")
4. Create a strong database password
5. Choose your region
6. Click "Create new project"

#### 3.3 Get Supabase Credentials
1. Go to your project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API"
4. Copy the following values:
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. On Top Header Click "Connect"
6. Click Tab "App Framework"
7. Copy the following values
   - **NEXT_PUBLIC_SUPABASE_URL** → `NEXT_PUBLIC_SUPABASE_URL`


### 4. Google Cloud Platform Setup

#### 4.1 Create Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept the terms and create a new project

#### 4.2 Create New Project
1. Click on the project selector at the top
2. Click "New Project"
3. Enter project name (e.g., "ncx-dashboard-api")
4. Click "Create"

#### 4.3 Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Google Sheets API**
   - **Google Drive API** (if accessing private sheets)

#### 4.4 Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional) Click "Restrict Key" to limit usage:
   - Select "API restrictions"
   - Choose "Google Sheets API"
   - Click "Save"

#### 4.5 Update Environment Variables
```properties
NEXT_PUBLIC_SPREADSHEET_API_KEY=your_google_sheets_api_key
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
```

### 5. Google Sheets Setup

#### 5.1 Prepare Your Spreadsheet
If the spreadsheet belongs to someone else:
1. **Option A (Recommended)**: Ask the owner to share it with you
2. **Option B**: Make a copy (Note: won't auto-update with original)
   - Open the spreadsheet
   - Click "File" → "Make a copy"
   - Save to your Google Drive

#### 5.2 Make Spreadsheet Public (For API Access)
1. Open your Google Sheets document
2. Click "Share" button (top right)
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Click "Copy link"

#### 5.3 Get Spreadsheet ID
1. Open your Google Sheets document
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0`
3. Copy the `SPREADSHEET_ID` part from the URL
4. Update your `.env` file:
```properties
NEXT_PUBLIC_SPREADSHEET_ID=your_spreadsheet_id
```

### 6. Install Dependencies

Using npm:
```bash
npm install
```

### 7. Build and Run

#### Development Mode
```bash
npm run dev
```

#### Production Build
```bash
npm run build
npm start
```

#### Production with PM2 (Recommended for servers)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "ncx-dashboard" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 8. Access the Application

Open your browser and navigate to:
- **Development**: `http://localhost:3000`
- **Production**: `http://localhost:3000` (or your configured port)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Application environment | Yes | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SPREADSHEET_ID` | Google Sheets document ID | Yes | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
| `NEXT_PUBLIC_SPREADSHEET_API_KEY` | Google Sheets API key | Yes | `AIzaSyC-xxx...` |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Google API key | Yes | `AIzaSyC-xxx...` |

### Port Configuration

The application runs on port 3000 by default. To change the port:

```bash
# Development
PORT=8080 npm run dev

# Production
PORT=8080 npm run start
```

## 🚀 Deployment

### Using PM2 (Recommended)

1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start ecosystem.config.js
```

3. Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'ncx-dashboard',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Using Docker

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

2. Build and run:
```bash
docker build -t ncx-dashboard .
docker run -p 3000:3000 ncx-dashboard
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Supabase Connection Error
- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check if your Supabase project is active
- Ensure your database is accessible

#### 2. Google Sheets API Error
- Verify your `NEXT_PUBLIC_SPREADSHEET_API_KEY`
- Check if Google Sheets API is enabled in Google Cloud Console
- Ensure your spreadsheet is publicly accessible
- Verify the `NEXT_PUBLIC_SPREADSHEET_ID` is correct

#### 3. Build Errors
- Clear node_modules and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 4. Permission Errors
- Check if the spreadsheet is shared with proper permissions
- Verify API key restrictions in Google Cloud Console

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Happy coding! 🚀**
