"use client";

import LogoImage from "@/components/LogoImage";
import { LOGO_VARIANTS, type LogoVariant } from "@/lib/logo-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Komponen untuk testing semua varian logo
 * Hanya untuk debugging - jangan digunakan di production
 */
export default function LogoTestGrid() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Logo Test Grid</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(LOGO_VARIANTS).map((variant) => (
          <Card key={variant} className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Logo {variant}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <LogoImage
                variant={variant as LogoVariant}
                width={160}
                height={48}
                className="max-w-full h-auto"
                alt={`Logo variant ${variant}`}
              />
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {LOGO_VARIANTS[variant as LogoVariant]}
              </code>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Test fallback */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Test Fallback (404 path)</h3>
        <Card className="p-4">
          <CardContent className="flex flex-col items-center gap-4">
            <LogoImage
              // @ts-expect-error - intentionally testing invalid variant
              variant="invalid"
              width={160}
              height={48}
              className="max-w-full h-auto"
              alt="Fallback test"
            />
            <code className="text-xs bg-red-100 px-2 py-1 rounded">
              Should fallback to logo-04.svg
            </code>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}