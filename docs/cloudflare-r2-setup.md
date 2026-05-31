# 📦 Cloudflare R2 Setup Guide

Panduan ini menjelaskan konfigurasi Cloudflare R2 untuk Jepangku News MVP.

## 1. Apa itu Cloudflare R2?

Cloudflare R2 adalah object storage yang kompatibel dengan S3 dan menawarkan biaya egress rendah atau gratis. Cocok untuk menyimpan cover image, file upload, dan media aplikasi.

## 2. Langkah Setup

### 2.1 Buat bucket R2

1. Login ke Cloudflare Dashboard
2. Buka menu **R2**
3. Klik **Create Bucket**
4. Masukkan nama bucket unik, misalnya `jepangku-storage`
5. Pilih region `automatic` atau region yang paling sesuai
6. Simpan bucket

### 2.2 Buat API token

1. Buka menu **API Tokens**
2. Klik **Create API token**
3. Beri nama token, misalnya `jepangku-app`
4. Berikan akses `Edit` pada bucket yang dipilih
5. Salin `Access Key ID` dan `Access Key Secret`

### 2.3 Ambil Account ID

1. Buka Cloudflare Dashboard > **Account Home**
2. Salin **Account ID** dari bagian informasi akun

## 3. Konfigurasi Environment

Tambahkan variabel berikut di `.env.local`:

```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_ACCESS_KEY_SECRET="your-access-key-secret"
R2_BUCKET_NAME="jepangku-storage"
R2_PUBLIC_URL="https://your-bucket-id.r2.cloudflarestorage.com"
```

## 4. Install SDK

```bash
npm install @aws-sdk/client-s3
```

## 5. Contoh Utility R2

```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_ACCESS_KEY_SECRET!,
  },
});

export async function uploadToR2(file: Buffer, key: string, contentType: string) {
  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

## 6. API Upload Route

Gunakan route API di `app/api/upload/route.ts` untuk menerima file upload dan menyimpan ke R2.

## 7. Troubleshooting

- **403 Forbidden**: periksa API token, bucket, dan permission
- **File tidak muncul**: periksa `R2_PUBLIC_URL` dan nama file
- **CORS issue**: atur CORS bucket jika perlu upload langsung dari browser

## 8. Catatan

- Simpan `R2_ACCESS_KEY_SECRET` dengan aman
- Gunakan bucket publik hanya untuk file yang harus diakses publik
- Untuk URL custom domain, gunakan fitur Custom Domain di Cloudflare R2
