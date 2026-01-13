# Pages

Thư mục này chứa các page components (tương ứng với routes).

## Cấu trúc đề xuất:
```
pages/
├── auth/
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── dashboard/
│   └── DashboardPage.tsx
├── classes/
│   ├── ClassListPage.tsx
│   └── ClassDetailPage.tsx
├── groups/
│   └── GroupPage.tsx
├── projects/
│   └── ProjectPage.tsx
└── NotFoundPage.tsx
```

## Quy tắc:
- Mỗi route có 1 page component
- Pages import và sử dụng các components từ `components/`
- Pages gọi API thông qua `services/`
