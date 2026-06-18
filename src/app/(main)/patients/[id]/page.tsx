import { PatientDetailClient } from "@/features/patients/components"

export default async function PatientDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <PatientDetailClient id={id} />
}
