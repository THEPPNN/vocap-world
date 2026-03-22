# 📚 VocabVault — คลังคำศัพท์ส่วนตัว

แอปเก็บ & ท่องคำศัพท์ส่วนตัว สร้างด้วย **React + Express + PostgreSQL**

---

## ฟีเจอร์

- 🔐 **Login / Register** ด้วย JWT
- ➕ **เพิ่ม / แก้ไข / ลบ** คำศัพท์ พร้อมคำแปล, คำเหมือน (หลายคำ), ตัวอย่างประโยค
- 🃏 **Flashcard** — พลิกไพ่ดูคำแปล, นับคำที่จำได้, สุ่มลำดับ
- 📋 **ท่องศัพท์** — แสดงคำ + คำเหมือน, กดเปิดดูคำแปลและตัวอย่าง
- 🔍 **ค้นหา** คำศัพท์ได้ทุกหน้า

---

## โครงสร้างโปรเจกต์

```
vocab-app/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server
│   │   ├── db.js             # PostgreSQL pool
│   │   ├── middleware/auth.js # JWT middleware
│   │   └── routes/
│   │       ├── auth.js       # /api/auth/register, /api/auth/login
│   │       └── vocab.js      # /api/vocab CRUD
│   ├── migrations/
│   │   ├── 001_initial.sql   # Schema
│   │   └── migrate.js        # Migration runner
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # LoginPage, RegisterPage, HomePage,
│   │   │                     # AddVocabPage, EditVocabPage,
│   │   │                     # FlashcardPage, ListPage
│   │   ├── components/       # Navbar
│   │   ├── contexts/         # AuthContext (JWT)
│   │   ├── api.js            # fetch wrapper
│   │   └── index.css         # Global styles
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## วิธีรัน

### วิธีที่ 1 — Docker Compose (แนะนำ ง่ายที่สุด)

```bash
cd vocab-app

# แก้ JWT_SECRET ใน docker-compose.yml ก่อน (optional แต่ควรทำ)
docker compose up --build
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

### วิธีที่ 2 — รันแยก (Local Development)

#### 1. ตั้งค่า PostgreSQL

สร้าง database ชื่อ `vocabdb` แล้วรัน migration:

```bash
cd backend
cp .env.example .env
# แก้ DATABASE_URL, JWT_SECRET ใน .env

npm install
npm run migrate      # รัน migrations ครั้งเดียว
npm run dev          # dev server ที่ port 5000
```

#### 2. รัน Frontend

```bash
cd frontend
npm install
npm run dev          # Vite dev server ที่ port 5173
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## Environment Variables (backend/.env)

| ตัวแปร | ค่าตัวอย่าง | คำอธิบาย |
|--------|------------|---------|
| `PORT` | `5000` | พอร์ต Express |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/vocabdb` | Connection string PostgreSQL |
| `JWT_SECRET` | `my-secret-key` | Secret สำหรับ sign JWT (ควรเป็น random string ยาวๆ) |
| `FRONTEND_URL` | `http://localhost:5173` | Origin สำหรับ CORS |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| GET | `/api/vocab` | ดึงคำศัพท์ทั้งหมด (ต้อง auth) |
| POST | `/api/vocab` | เพิ่มคำศัพท์ (ต้อง auth) |
| PUT | `/api/vocab/:id` | แก้ไขคำศัพท์ (ต้อง auth) |
| DELETE | `/api/vocab/:id` | ลบคำศัพท์ (ต้อง auth) |

---

## การ Deploy บน Server

1. Copy โฟลเดอร์ทั้งหมดขึ้น server
2. แก้ `JWT_SECRET` และ `FRONTEND_URL` ใน `docker-compose.yml`
3. รัน `docker compose up -d --build`
4. Migration จะรันอัตโนมัติตอน container backend เริ่มต้น

ถ้าต้องการ HTTPS ให้ใส่ Nginx reverse proxy หรือ Caddy หน้า docker-compose
