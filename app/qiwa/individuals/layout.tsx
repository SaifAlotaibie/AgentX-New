import QiwaSidebar from '@/components/qiwa/QiwaSidebar'
import '@/app/globals.css'

export default function QiwaIndividualsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <QiwaSidebar />
      {children}
    </>
  )
}

