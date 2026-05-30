# 📦 Cloudflare R2 Setup Guide

Panduan lengkap untuk mengkonfigurasi Cloudflare R2 sebagai object storage untuk Jepangku News MVP.

## 📋 Daftar Isi

- [Apa itu Cloudflare R2?](#apa-itu-cloudflare-r2)
- [Keuntungan R2](#keuntungan-r2)
- [Setup Akun Cloudflare](#setup-akun-cloudflare)
- [Membuat R2 Bucket](#membuat-r2-bucket)
- [Generate API Token](#generate-api-token)
- [Konfigurasi Aplikasi](#konfigurasi-aplikasi)
- [Upload File Dengan SDK](#upload-file-dengan-sdk)
- [Troubleshooting](#troubleshooting)

## 🌐 Apa itu Cloudflare R2?

Cloudflare R2 adalah layanan cloud object storage yang:
- **S3-Compatible**: Kompatibel dengan AWS S3 API
- **No Egress Fees**: Tidak ada biaya untuk download/egress
- **Global CDN**: Terintegrasi dengan Cloudflare CDN
- **Affordable**: Biaya penyimpanan yang terjangkau

## ✅ Keuntungan R2

| Fitur | R2 | AWS S3 |
|-------|-----|---------|
| Harga Upload | Gratis | Gratis |
| Harga Download | Gratis | $$$ |
| Harga Penyimpanan | $ | $ |
| Global CDN | Termasuk | Perlu CloudFront |
| API Compatibility | S3-Compatible | Native |

## 🚀 Setup Akun Cloudflare

### 1. Buat Akun Cloudflare

1. Kunjungi [cloudflare.com](https://www.cloudflare.com)
2. Klik **Sign Up**
3. Isi email dan password
4. Verifikasi email Anda

### 2. Upgrade ke Plan R2

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Di sidebar, pilih **Billing** > **Overview**
3. Pastikan ada plan aktif (R2 tersedia di semua plan, termasuk free trial untuk storage)

## 📦 Membuat R2 Bucket

### Step 1: Buka R2 Dashboard

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Di sidebar, pilih **R2** (atau cari di search)

### Step 2: Buat Bucket Baru

1. Klik tombol **Create Bucket**
2. Isi nama bucket: `jepangku-storage` (atau sesuai preferensi)
   - Nama harus unik di seluruh Cloudflare
   - Hanya gunakan huruf kecil, angka, dan dash
   - Contoh: `jepangku-storage`, `jepangku-news-prod`
3. Pilih **Region**: Automatic (recommended) atau pilih regional
4. Klik **Create Bucket**

### Step 3: Konfigurasi Bucket Settings

1. Dari R2 dashboard, klik nama bucket Anda
2. Buka tab **Settings**
3. **CORS Settings** (optional, untuk web uploads):
   ```json
   [
     {
       "allowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "allowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "allowedHeaders": ["*"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
4. Simpan perubahan

## 🔑 Generate API Token

### Step 1: Buat R2 API Token

1. Di Cloudflare Dashboard, buka **R2** > **Settings**
2. Scroll ke bagian **API tokens**
3. Klik **Create API token**

### Step 2: Konfigurasi Token Permissions

1. **Token name**: `jepangku-app` (atau sesuai nama app)
2. **TTL**: Pilih "Never" atau sesuai preferensi
3. **Permissions**: Pilih "Edit" untuk read & write access
4. **Bucket Access**: 
   - Pilih "Apply to specific buckets"
   - Pilih bucket yang baru dibuat
5. Klik **Create API Token**

### Step 3: Copy Credentials

Anda akan mendapat credentials berikut:
```
Access Key ID:     xxxxxxxxxxxxxxxxxxxxxxxx
Access Key Secret: xxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ PENTING**: Copy dan simpan credentials ini di tempat aman. Anda tidak akan bisa lihat secret lagi!

## 🔧 Konfigurasi Aplikasi

### Step 1: Dapatkan R2 Account ID

1. Buka Cloudflare Dashboard > **Account** (dropdown di corner kanan)
2. Klik **Workers & Pages** > **Settings**
3. Copy **Account ID**

### Step 2: Isi Environment Variables

Buat atau edit file `.env.local`:

```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_ACCESS_KEY_SECRET="your-access-key-secret"
R2_BUCKET_NAME="jepangku-storage"
R2_PUBLIC_URL="https://your-bucket-id.r2.cloudflarestorage.com"
```

### Step 3: Install AWS SDK

```bash
npm install @aws-sdk/client-s3
```

## 📤 Upload File Dengan SDK

### Membuat R2 Client Utility

Buat file `lib/r2.ts`:

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_ACCESS_KEY_SECRET!,
  },
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return `${process.env.R2_PUBLIC_URL}/${fileName}`;
}

export async function deleteFromR2(fileName: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
  });

  await s3Client.send(command);
}

export async function getSignedUrlR2(fileName: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}
```

### Upload dari API Route

Buat file `app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    const url = await uploadToR2(buffer, fileName, file.type);

    return NextResponse.json({
      success: true,
      url,
      fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## 🎬 Contoh Upload dari Frontend

```typescript
// app/upload-example/page.tsx
'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setUploadedUrl(data.url);
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={uploading}
      />
      <button type="submit" disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {uploadedUrl && (
        <div>
          <p>Upload berhasil!</p>
          <img src={uploadedUrl} alt="Uploaded" />
        </div>
      )}
    </form>
  );
}
```

## 🌍 Menggunakan Custom Domain (Optional)

### Setup Custom Domain untuk R2

1. Domain harus sudah di-manage oleh Cloudflare
2. Di R2 bucket settings, buka **Custom Domains**
3. Klik **Connect Domain**
4. Pilih domain yang ingin digunakan
5. Isi subdomain: `cdn`, `storage`, atau sesuai preferensi
6. Klik **Connect Domain**

Sekarang Anda bisa mengakses file via:
- `https://cdn.yourdomain.com/file-name.jpg`

## 🐛 Troubleshooting

### Error: "Access Denied" atau "403 Forbidden"

**Solusi**:
1. Cek API token credentials di `.env.local`
2. Pastikan token memiliki permission "Edit"
3. Pastikan token apply ke bucket yang benar
4. Regenerate token jika perlu

### File tidak bisa didownload

**Solusi**:
1. Pastikan bucket memiliki public access (default R2 bucket adalah private)
2. Gunakan public URL dari R2 atau signed URL
3. Cek CORS settings jika upload dari browser

### Performa lambat

**Solusi**:
1. Pastikan region bucket dipilih dengan tepat
2. R2 sudah terintegrasi dengan Cloudflare CDN, lag biasanya dari network
3. Gunakan Cloudflare Workers untuk optimasi lebih lanjut

### Biaya lebih dari ekspektasi

**Solusi**:
1. R2 gratis untuk egress/download (keuntungan vs S3)
2. Cek penggunaan storage di R2 dashboard
3. Hapus file yang sudah tidak digunakan

## 📚 Referensi

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/s3/api/)

---

**Questions?** Buka issue di repository atau baca dokumentasi Cloudflare.
