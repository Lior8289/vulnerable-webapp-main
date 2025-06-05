# Secure Web Application

A full-stack secure web application built with React frontend and Node.js backend, implementing security best practices for authentication, password management, and user verification.

## Features

- **Secure Authentication System**: Login/register with robust password policies
- **Password Management**: Password reset, change password functionality with history tracking
- **User Verification**: Email verification system
- **Customer Management**: CRUD operations for customer data
- **Material-UI Interface**: Modern, responsive design with dark/light theme support
- **Security Features**: 
  - Password policy enforcement (minimum length, complexity requirements)
  - Password history tracking
  - Dictionary-based password blocking
  - Secure session management

## Tech Stack

**Frontend:**
- React 19
- Material-UI (MUI)
- React Router DOM
- Vite (build tool)

**Backend:**
- Node.js
- Express.js
- MS SQL Server
- Nodemailer (email functionality)
- CORS enabled

## Prerequisites

Before running this application, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- MS SQL Server (local or remote instance)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd secure-webapp
```

### 2. Backend Setup
```bash
cd back
npm install
```

Create a `.env` file in the `back` directory with the following variables:
```env
PORT=3000
DB_SERVER=your_sql_server
DB_DATABASE=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_ENCRYPT=true
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

### 3. Frontend Setup
```bash
cd ../front
npm install
```

### 4. Database Setup
- Create your MS SQL Server database
- Run any necessary database migration scripts (ensure your database schema matches the application requirements)

## Running the Application

### Start the Backend Server
```bash
cd back
npm start
```
The backend server will run on `http://localhost:3000`

### Start the Frontend Development Server
```bash
cd front
npm run dev
```
The frontend will run on `http://localhost:5173` (default Vite port)

## Project Structure

```
secure-webapp/
├── back/                    # Backend (Node.js/Express)
│   ├── app.js              # Main server file
│   ├── package.json
│   ├── passwordPolicy.config.json
│   ├── db/                 # Database configuration
│   ├── routers/            # API routes
│   └── utils/              # Utility functions
├── front/                  # Frontend (React)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Password reset
- `POST /api/change-password` - Change user password
- `GET /api/customers` - Get customer list
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## Security Features

- **Password Policy**: Configurable password requirements (length, complexity, history)
- **Dictionary Attack Prevention**: Blocks common weak passwords
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Secure Headers**: Security headers implementation

## Development

### Frontend Development
```bash
cd front
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

### Backend Development
```bash
cd back
npm start      # Start server
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is developed as part of a Secure Coding course assignment.
