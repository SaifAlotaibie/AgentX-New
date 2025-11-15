-- ========================================
-- 🎯 إعداد قاعدة البيانات الكاملة لمشروع AgentX
-- ========================================
-- نفذ هذا الملف في Supabase SQL Editor
-- ========================================

-- 1️⃣ تحديث جدول user_profile
-- ========================================

ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'سعودي',
ADD COLUMN IF NOT EXISTS birth_date TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS employee_number TEXT;

SELECT '✅ تم تحديث جدول user_profile' as message;

-- ========================================
-- 2️⃣ تحديث جدول labor_appointments
-- ========================================

-- إضافة الحقول الجديدة
ALTER TABLE labor_appointments 
ADD COLUMN IF NOT EXISTS office_location TEXT,
ADD COLUMN IF NOT EXISTS date TEXT,
ADD COLUMN IF NOT EXISTS time TEXT,
ADD COLUMN IF NOT EXISTS appointment_type TEXT;

-- تحديث appointment_type لتكون اختيارية (إذا كانت موجودة)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'labor_appointments' 
    AND column_name = 'appointment_type'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE labor_appointments ALTER COLUMN appointment_type DROP NOT NULL;
  END IF;
END $$;

SELECT '✅ تم تحديث جدول labor_appointments' as message;

-- ========================================
-- 3️⃣ التحقق من جميع الجداول الأساسية
-- ========================================

-- التحقق من وجود جدول user_profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profile') THEN
    RAISE EXCEPTION 'جدول user_profile غير موجود! نفذ database-schema.sql أولاً';
  END IF;
END $$;

-- التحقق من وجود جدول resumes
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'resumes') THEN
    RAISE EXCEPTION 'جدول resumes غير موجود! نفذ database-schema.sql أولاً';
  END IF;
END $$;

-- التحقق من وجود جدول certificates
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certificates') THEN
    RAISE EXCEPTION 'جدول certificates غير موجود! نفذ database-schema.sql أولاً';
  END IF;
END $$;

-- التحقق من وجود جدول employment_contracts
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employment_contracts') THEN
    RAISE EXCEPTION 'جدول employment_contracts غير موجود! نفذ database-schema.sql أولاً';
  END IF;
END $$;

-- التحقق من وجود جدول labor_appointments
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'labor_appointments') THEN
    RAISE EXCEPTION 'جدول labor_appointments غير موجود! نفذ database-schema.sql أولاً';
  END IF;
END $$;

-- التحقق من وجود جدول tickets
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tickets') THEN
    RAISE EXCEPTION 'جدول tickets غير موجود! نفذ database-schema.sql أولاً';
  END IF;
END $$;

SELECT '✅ جميع الجداول الأساسية موجودة' as message;

-- ========================================
-- 4️⃣ التحقق من الحقول المطلوبة
-- ========================================

-- التحقق من حقول resumes
DO $$
BEGIN
  -- job_title
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resumes' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE resumes ADD COLUMN job_title TEXT;
  END IF;
  
  -- education
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resumes' AND column_name = 'education'
  ) THEN
    ALTER TABLE resumes ADD COLUMN education TEXT;
  END IF;
  
  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resumes' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE resumes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

SELECT '✅ تم التحقق من حقول resumes' as message;

-- ========================================
-- 5️⃣ عرض ملخص الجداول والحقول
-- ========================================

SELECT 
  '📊 ملخص قاعدة البيانات' as title,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns;

-- ========================================
-- 6️⃣ عرض تفاصيل الجداول الرئيسية
-- ========================================

SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profile',
    'resumes',
    'certificates',
    'employment_contracts',
    'labor_appointments',
    'tickets'
  )
GROUP BY table_name
ORDER BY table_name;

-- ========================================
-- 🎉 انتهى الإعداد بنجاح!
-- ========================================

SELECT '✅ تم إعداد قاعدة البيانات بنجاح!' as final_message;

