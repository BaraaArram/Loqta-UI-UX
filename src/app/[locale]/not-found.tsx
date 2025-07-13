// NotFoundPage: Renders a user-friendly 404 page with localized messaging and a link back to home.
"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

export default function NotFoundPage() {
  const { t } = useTranslation("common");
  const params = useParams();
  const locale = params?.locale || "en";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center">
        <div className="mb-6">
          <svg className="h-20 w-20 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="22" strokeWidth="4" stroke="currentColor" fill="#fff7ed" />
            <text x="24" y="32" textAnchor="middle" fontSize="24" fill="#fb923c" fontFamily="Arial">404</text>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-orange-600 mb-2">{t('not_found_title')}</h1>
        <p className="text-gray-600 mb-6 text-center">{t('not_found_message')}</p>
        <Link
          href={`/${locale}`}
          className="px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold shadow hover:bg-orange-700 transition-all duration-200"
        >
          {t('back_to_home')}
        </Link>
      </div>
    </div>
  );
} 