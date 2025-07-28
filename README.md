# NCX Telkom Dashboard by Rezky Gobel

A modern dashboard application built with Next.js, TypeScript, and Tailwind CSS for managing and visualizing Telkom data with flexible data source management.

## 🚀 Features

- 📊 Interactive data visualization with charts and graphs
- 🔐 User authentication with Supabase
- 📱 Responsive design for all devices
- 🎨 Modern UI with shadcn/ui components
- 📈 Flexible data sources: Google Sheets (recommended) or Excel/CSV file uploads
- 🗃️ Dynamic data source management per user
- 📋 File upload support for Excel (.xlsx, .xls) and CSV files
- 🔒 Protected routes with middleware-based access control
- 🌙 Dark/Light mode support
- 📊 Multiple dashboard sections: Analytics, Sales, Revenue, Products, and more

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 18.0 or higher
- **pnpm**: Package manager (recommended) or npm
- **Git**: For cloning the repository
- **Supabase Account**: For authentication and data storage
- **Google Cloud Account**: For Google Sheets API access (optional)

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

# Optional: Only needed if using Google Sheets as data source
NEXT_PUBLIC_SPREADSHEET_API_KEY=
NEXT_PUBLIC_GOOGLE_API_KEY=
```

https://docs.google.com/spreadsheets/d/1WupxIMrlVyzEQdBxWK6KHQHe3VBjvQpWwDdqN2h8Q_U/edit?usp=sharing

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

#### 3.3 Setup Database Tables
1. Go to your project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Run the following SQL to create the required tables:

```sql
-- Create data_sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('spreadsheet', 'file')),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    filename VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes and RLS policies
CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own data sources" ON data_sources
    FOR ALL USING (auth.uid() = user_id);
```

#### 3.4 Get Supabase Credentials
1. Go to your project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API"
4. Copy the following values:
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. On Top Header Click "Connect"
6. Click Tab "App Framework"
7. Copy the following values
   - **NEXT_PUBLIC_SUPABASE_URL** → `NEXT_PUBLIC_SUPABASE_URL`


### 4. Google Cloud Platform Setup (Optional)

> **Note**: Google Cloud Platform setup is only required if you plan to use Google Sheets as a data source. You can skip this section if you only plan to use Excel/CSV file uploads.

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

### 5. Google Sheets Setup (Optional)

> **Note**: This section is only needed if you want to use Google Sheets as a data source. The application also supports Excel/CSV file uploads which don't require Google Sheets setup.

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
4. You'll use this ID when setting up your data source in the application

> **Note**: Unlike previous versions, you no longer need to add the spreadsheet ID to environment variables. You'll configure it directly in the application interface.

### 6. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Using npm:
```bash
npm install
```

### 7. Build and Run

#### Development Mode
```bash
pnpm dev
# or
npm run dev
```

#### Production Build
```bash
pnpm build && pnpm start
# or
npm run build && npm start
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

### 8. Application Setup

After starting the application for the first time:

1. **Login**: Create an account or login with existing credentials
2. **Setup Data Source**: You'll be redirected to `/dashboard/home` where you can:
   - **Option A (Recommended)**: Connect a Google Spreadsheet by entering the spreadsheet URL or ID
   - **Option B**: Upload an Excel (.xlsx, .xls) or CSV file
3. **Verify Setup**: Once configured, you'll have access to all dashboard features
4. **Data Management**: Use `/dashboard/data-management` to monitor, test, or change your data source

### 9. Access the Application

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
| `NEXT_PUBLIC_SPREADSHEET_API_KEY` | Google Sheets API key | No* | `AIzaSyC-xxx...` |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Google API key | No* | `AIzaSyC-xxx...` |

\* Only required if using Google Sheets as data source

### Port Configuration

The application runs on port 3000 by default. To change the port:

```bash
# Development
PORT=8080 npm run dev

# Production
PORT=8080 npm run start
```

## 🏗️ Project Structure

```
ncx-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── upload-file/   # File upload handling
│   │   ├── read-data/     # Data reading from sources
│   │   └── verify-spreadsheet/  # Google Sheets verification
│   ├── dashboard/         # Dashboard pages
│   │   ├── home/          # Data source setup
│   │   ├── data-management/  # Data source management
│   │   ├── analytics/     # Analytics dashboard
│   │   └── ...           # Other dashboard sections
│   └── login/            # Authentication pages
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui components
│   ├── dashboard/       # Dashboard-specific components
│   └── sales/           # Sales-related components
├── lib/                 # Utility functions and configurations
│   ├── data-source.ts   # Data source management utilities
│   ├── auth-context.tsx # Authentication context
│   └── utils.ts         # General utilities
├── public/              # Static assets
│   └── uploads/         # Uploaded files storage
└── sql/                 # Database schemas
    └── create_data_sources_table.sql
```

## 🔄 Data Source Management

The application supports two types of data sources:

### 📊 Google Spreadsheet (Recommended)
**Why recommended?** Real-time synchronization, automatic updates, and collaborative features make this the ideal choice for dynamic dashboards.

- Real-time data synchronization
- Requires Google Sheets API access
- Automatic updates when spreadsheet changes
- Supports multiple sheets within one document
- No storage limitations
- Collaborative editing support

### 📁 File Upload
- Support for Excel (.xlsx, .xls) and CSV files
- Local file storage in `public/uploads/`
- Manual data refresh when new files are uploaded
- File size limit and format validation
- Works offline without API dependencies

## 🚀 Deployment

### Using PM2 (Recommended)

1. Build the application:
```bash
pnpm build
# or
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
COPY package*.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
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
- Ensure your spreadsheet is publicly accessible or properly shared
- Verify the spreadsheet URL/ID is correct in the application

#### 3. File Upload Issues
- Check file format (only .xlsx, .xls, .csv are supported)
- Verify file size is within limits
- Ensure `public/uploads/` directory has write permissions
- Check if the file is corrupted or password-protected

#### 4. Build Errors
- Clear node_modules and reinstall dependencies:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
# or for npm
rm -rf node_modules package-lock.json
npm install
```

#### 5. Permission Errors
#### 6. Data Source Access Issues
- Ensure you have set up a data source in `/dashboard/home`
- Check if your data source is still accessible (for Google Sheets)
- Verify file integrity for uploaded files
- Use `/dashboard/data-management` to test and manage your data sources

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` / `npm run dev` | Start development server |
| `pnpm build` / `npm run build` | Build for production |
| `pnpm start` / `npm run start` | Start production server |
| `pnpm lint` / `npm run lint` | Run ESLint |

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
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Recharts Documentation](https://recharts.org/)

## 📋 Technology Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js & Recharts
- **File Processing**: xlsx library
- **Package Manager**: pnpm (recommended)

## 🔄 Version History

### Current Version: 0.1.0
- ✅ Dynamic data source management
- ✅ File upload support (Excel/CSV)
- ✅ Google Sheets integration
- ✅ User authentication with Supabase
- ✅ Protected routes with middleware
- ✅ Modern dashboard interface
- ✅ Mobile responsive design

---

**Happy coding! 🚀**
