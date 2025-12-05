# Hospital Management System - Deployment Guide

## 🎯 Production Configuration

### API URL
```
https://healthhubapi.solvixo.org
```

## ✅ Configuration Status

### Backend (.env)
- ✅ API_URL configured: `https://healthhubapi.solvixo.org`
- ✅ Database credentials set
- ✅ JWT secret configured
- ✅ WhatsApp API configured

### Frontend (api.js)
- ✅ Base URL configured: `https://healthhubapi.solvixo.org/api`
- ✅ Axios interceptors for auth
- ✅ Error handling with toast notifications

### Backend (server.js)
- ✅ CORS enabled for all origins
- ✅ All routes configured
- ✅ Health check endpoint available at `/health`

## 🔧 Fixed Issues

### is_active Column Issue - RESOLVED ✅
All SQL queries have been updated to work without the `is_active` column:

**Files Fixed:**
- `src/controllers/auth.controller.js`
- `src/middleware/auth.middleware.js`
- `src/routes/user.routes.js`
- `src/routes/staff.routes.js`
- `src/routes/department.routes.js`
- `src/routes/laboratory.routes.js`
- `src/controllers/doctor.controller.js`
- `src/controllers/dashboard.controller.js`
- `src/controllers/hospital.controller.js`

## 🚀 Deployment Steps

### 1. Backend Deployment

```bash
# Navigate to backend directory
cd clinic/backend

# Install dependencies (if not already done)
npm install

# Test the configuration
node test-api-connection.js

# Start the server (production)
npm start

# OR with PM2 (recommended for production)
pm2 start server.js --name hospital-backend
pm2 save
pm2 startup
```

### 2. Frontend Deployment

```bash
# Navigate to frontend directory
cd clinic/frontend/frontend

# Install dependencies
npm install

# Build for production
npm run build

# The build folder can be deployed to any static hosting
# (Netlify, Vercel, AWS S3, etc.)
```

### 3. Database Setup (Optional)

If you want to add the `is_active` column for future features:

```bash
cd clinic/backend
node add-is-active-column.js
```

## 🧪 Testing

### Test Backend API
```bash
# Test from command line
curl https://healthhubapi.solvixo.org/health

# Test login endpoint
curl -X POST https://healthhubapi.solvixo.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

### Test Frontend
1. Open your frontend URL in browser
2. Try to login with credentials
3. Check browser console for any errors
4. Verify API calls in Network tab

## 📋 Checklist

### Backend
- [ ] Environment variables configured in `.env`
- [ ] Database connection working
- [ ] Server running on production
- [ ] Health endpoint responding
- [ ] Login endpoint working
- [ ] CORS configured properly

### Frontend
- [ ] API URL configured in `api.js`
- [ ] Build completed successfully
- [ ] Deployed to hosting service
- [ ] Can access login page
- [ ] API calls reaching backend

### Database
- [ ] Database created
- [ ] Tables created (run setup scripts if needed)
- [ ] Test data seeded (optional)
- [ ] Backup configured

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong database password
- [ ] Enable HTTPS on production
- [ ] Configure proper CORS origins (currently allows all)
- [ ] Set up rate limiting
- [ ] Enable API authentication
- [ ] Regular database backups

## 🐛 Troubleshooting

### Login Not Working
1. Check API URL in frontend `api.js`
2. Verify backend is running: `curl https://healthhubapi.solvixo.org/health`
3. Check database connection
4. Verify user exists in database
5. Check browser console for errors

### CORS Errors
1. Verify CORS is enabled in `server.js`
2. Check if backend is accessible from frontend domain
3. Ensure proper headers are set

### Database Errors
1. Check database credentials in `.env`
2. Verify database exists
3. Run setup scripts if tables are missing
4. Check for missing columns (run migration scripts)

## 📞 Support

For issues or questions:
1. Check logs: `pm2 logs hospital-backend`
2. Review error messages in browser console
3. Test API endpoints with curl/Postman
4. Check database connection and queries

## 🎉 Success Indicators

✅ Backend health check returns OK
✅ Login endpoint returns token
✅ Frontend can communicate with backend
✅ No CORS errors in browser console
✅ Database queries executing successfully

---

**Last Updated:** December 5, 2025
**API Version:** 1.0
**Status:** Production Ready ✅
