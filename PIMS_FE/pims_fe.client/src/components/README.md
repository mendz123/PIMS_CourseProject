# Components

Thư mục này chứa các React components có thể tái sử dụng.

## Cấu trúc đề xuất:
```
components/
├── common/
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   ├── Table/
│   └── Loading/
├── layout/
│   ├── Header/
│   ├── Sidebar/
│   └── Footer/
└── forms/
    ├── LoginForm/
    └── RegisterForm/
```

## Quy tắc:
- Mỗi component có folder riêng chứa: `ComponentName.tsx`, `ComponentName.css`
- Export components trong file `index.ts`
- Sử dụng TypeScript interfaces cho props
