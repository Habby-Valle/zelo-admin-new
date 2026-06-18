import { PatientEditClient } from "@/features/patients/components"

export default async function EditPatientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <PatientEditClient id={id} />
}
