'use client'

import { useState } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'

export default function EndOfServicePage() {
  const [salary, setSalary] = useState('')
  const [years, setYears] = useState('')
  const [months, setMonths] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const calculateBonus = () => {
    const monthlySalary = parseFloat(salary)
    const totalYears = parseInt(years) || 0
    const totalMonths = parseInt(months) || 0

    if (!monthlySalary || monthlySalary <= 0) {
      alert('الرجاء إدخال راتب صحيح')
      return
    }

    // حساب المكافأة حسب نظام العمل السعودي
    // أول 5 سنوات: نصف شهر عن كل سنة
    // بعد 5 سنوات: شهر كامل عن كل سنة
    
    let totalBonus = 0

    // السنوات
    if (totalYears <= 5) {
      totalBonus = (monthlySalary / 2) * totalYears
    } else {
      totalBonus = (monthlySalary / 2) * 5  // أول 5 سنوات
      totalBonus += monthlySalary * (totalYears - 5)  // ما بعد 5 سنوات
    }

    // الأشهر
    if (totalMonths > 0) {
      const monthlyRate = totalYears >= 5 ? monthlySalary : monthlySalary / 2
      totalBonus += (monthlyRate / 12) * totalMonths
    }

    setResult(Math.round(totalBonus))
  }

  const resetForm = () => {
    setSalary('')
    setYears('')
    setMonths('')
    setResult(null)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <Link href="/qiwa" className="flex items-center gap-3">
              <img src="/qiwaLogo.png" alt="قوى" className="h-10 w-auto object-contain" />
            </Link>
            <Link href="/qiwa/individuals" className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100" style={{ color: '#4b515a' }}>
              العودة للخدمات
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Breadcrumb items={[
          { label: 'قوى', href: '/qiwa' },
          { label: 'خدمات الأفراد', href: '/qiwa/individuals' },
          { label: 'حاسبة مكافأة نهاية الخدمة' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                🧮
              </div>
              <div>
                <h1 className="text-4xl font-bold">حاسبة مكافأة نهاية الخدمة</h1>
                <p className="text-white/80 text-lg mt-2">احسب مكافأة نهاية الخدمة حسب نظام العمل السعودي</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#20183b' }}>المعلومات الأساسية</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2" style={{ color: '#20183b' }}>الراتب الشهري (ريال) *</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-red-500"
                  placeholder="مثال: 10000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>عدد السنوات *</label>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="مثال: 5"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>عدد الأشهر (اختياري)</label>
                  <input
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="مثال: 6"
                    min="0"
                    max="11"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={calculateBonus}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
                >
                  احسب المكافأة
                </button>
                <button 
                  onClick={resetForm}
                  className="px-8 py-4 border-2 rounded-xl font-bold hover:bg-gray-50"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>
          </div>

          {result !== null && (
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl p-12 shadow-2xl animate-fade-in">
              <h3 className="text-2xl font-bold mb-4 text-center">مكافأة نهاية الخدمة المقدّرة</h3>
              <div className="text-center mb-6">
                <p className="text-7xl font-bold">{result.toLocaleString('ar-SA')}</p>
                <p className="text-3xl mt-2">ريال سعودي</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-lg leading-relaxed">
                  <strong>ملاحظة:</strong> هذا الحساب تقديري بناءً على نظام العمل السعودي:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>• أول 5 سنوات: نصف شهر عن كل سنة</li>
                  <li>• بعد 5 سنوات: شهر كامل عن كل سنة</li>
                  <li>• الأشهر تُحسب بنفس النسبة</li>
                </ul>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#20183b' }}>معلومات مهمة</h3>
            
            <div className="space-y-4" style={{ color: '#4b515a' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📌</span>
                <p>مكافأة نهاية الخدمة حق للعامل حسب نظام العمل السعودي</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚖️</span>
                <p>في حالة استقالة العامل قبل سنتين، لا يستحق مكافأة</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <p>بين سنتين و 5 سنوات: يستحق ثلث المكافأة عند الاستقالة</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <p>بين 5 و 10 سنوات: يستحق ثلثي المكافأة عند الاستقالة</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <p>بعد 10 سنوات: يستحق المكافأة كاملة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
