# 🚀 Quick Start - Ceylon E-Commerce

## Start Everything (Easiest)
```powershell
.\start-all.ps1
```

## Start Individual Services

### Backend Only
```powershell
.\start-backend.ps1
# OR
cd backend
npm start
```

### Admin Panel Only
```powershell
cd admin
npm run dev
```

### Frontend Only
```powershell
cd frontend
npm run dev
```

## URLs
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:5174
- Frontend: http://localhost:5173

## Admin Login
- Email: malithdamsara87@gmail.com
- Password: malith123

## Common Issues

### "Cannot connect to backend"
**Solution:** Start backend first
```powershell
.\start-backend.ps1
```

### "Port already in use"
**Find process:**
```powershell
netstat -ano | findstr :5000
```
**Kill process:**
```powershell
taskkill /PID <PID> /F
```

### Backend exits immediately
**Check:** Make sure NODE_ENV is set (fixed in start script)

## What Was Fixed
✅ Axios configuration in admin pages
✅ Error handling in Dashboard & Analytics
✅ Backend startup script
✅ Demo data fallback
✅ Clear error messages
✅ Connection retry functionality

## Testing
1. Start backend: `.\start-backend.ps1`
2. Start admin: `cd admin; npm run dev`
3. Login at http://localhost:5174
4. Check Dashboard ✅
5. Check Analytics ✅
6. No errors! 🎉
