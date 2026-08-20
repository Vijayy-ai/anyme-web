import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Snoozeit Admin | AnyMe",
  robots: { index: false, follow: false },
};

export default function SnoozeitAdminPage() {
  return <AdminDashboard />;
}
