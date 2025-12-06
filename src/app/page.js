'use client';

import Header from '@/components/Header';
import WidgetGrid from '@/components/WidgetGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto p-6">
        <WidgetGrid />
      </main>
    </div>
  );
}
