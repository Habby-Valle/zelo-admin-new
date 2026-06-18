"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Building2,
  User,
  Droplets,
  CheckCircle2,
  XOctagon,
  UserCheck,
  Plus,
  X,
  Loader2,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  usePatient,
  useDeletePatient,
  useAddCaregiver,
  useRemoveCaregiver,
  useAddEmergencyContact,
  useRemoveEmergencyContact,
} from "@/features/patients/hooks"
import { useUsers } from "@/features/users/hooks"

const GENDER_LABELS: Record<string, string> = { M: "Masculino", F: "Feminino", O: "Outro" }

function calculateAge(birthDate: string): number {
  const today = new Date()
  const [year, month, day] = birthDate.split("-").map(Number)
  const birth = new Date(year, month - 1, day)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR")
}

function getInitials(name: string) {
  return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function PatientDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { data: patient, isLoading, isError } = usePatient(id)
  const deletePatient = useDeletePatient()
  const addCaregiver = useAddCaregiver(id)
  const removeCaregiver = useRemoveCaregiver(id)
  const addContact = useAddEmergencyContact(id)
  const removeContact = useRemoveEmergencyContact(id)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addCaregiverOpen, setAddCaregiverOpen] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [removeAssignmentId, setRemoveAssignmentId] = useState<string | null>(null)
  const [removeContactId, setRemoveContactId] = useState<string | null>(null)
  const [selectedCaregiverId, setSelectedCaregiverId] = useState("")
  const [selectedFamilyId, setSelectedFamilyId] = useState("")
  const [contactPriority, setContactPriority] = useState("1")

  const { data: caregiversData } = useUsers({ role: "caregiver", pageSize: 100 })
  const { data: familyData } = useUsers({ role: "family", pageSize: 100 })
  const caregivers = caregiversData?.users ?? []
  const familyMembers = familyData?.users ?? []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button onClick={() => router.push("/patients")}>Voltar</Button>
      </div>
    )
  }

  const age = calculateAge(patient.birth_date)

  function handleAddCaregiver() {
    if (!selectedCaregiverId) return
    addCaregiver.mutate(Number(selectedCaregiverId), {
      onSuccess: () => {
        setAddCaregiverOpen(false)
        setSelectedCaregiverId("")
      },
    })
  }

  function handleAddContact() {
    if (!selectedFamilyId) return
    addContact.mutate(
      { profileFamilyId: Number(selectedFamilyId), priority: parseInt(contactPriority, 10) || 1 },
      {
        onSuccess: () => {
          setAddContactOpen(false)
          setSelectedFamilyId("")
          setContactPriority("1")
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/patients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarImage src={patient.media?.url ?? undefined} alt={patient.name} />
            <AvatarFallback className="text-base">{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
              {patient.is_active ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XOctagon className="h-3 w-3" /> Inativo
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {age} anos · {GENDER_LABELS[patient.gender] ?? patient.gender}
              {patient.blood_type && ` · ${patient.blood_type}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/patients/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" /> Nascimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDate(patient.birth_date)}</p>
            <p className="text-sm text-muted-foreground">{age} anos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Droplets className="h-4 w-4" /> Tipo sanguíneo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{patient.blood_type ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" /> Clínica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{patient.clinic_name ?? <span className="text-muted-foreground">—</span>}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" /> Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{patient.guardian_name ?? <span className="text-muted-foreground">—</span>}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-16 font-medium text-muted-foreground">Telefone</span>
            <span>{patient.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-16 font-medium text-muted-foreground">Email</span>
            <span>{patient.email || "—"}</span>
          </div>
          {patient.cpf && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="w-16 font-medium text-muted-foreground">CPF</span>
              <span>{patient.cpf}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {(patient.health_conditions || patient.allergies || patient.medications || patient.observations) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações de Saúde</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.health_conditions && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Condições</p>
                <p className="text-sm whitespace-pre-line">{patient.health_conditions}</p>
              </div>
            )}
            {patient.allergies && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Alergias</p>
                <p className="text-sm whitespace-pre-line">{patient.allergies}</p>
              </div>
            )}
            {patient.medications && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Medicamentos</p>
                <p className="text-sm whitespace-pre-line">{patient.medications}</p>
              </div>
            )}
            {patient.observations && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Observações</p>
                <p className="text-sm whitespace-pre-line">{patient.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4" /> Cuidadores ({patient.caregiver_assignments.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAddCaregiverOpen(true)}>
              <Plus className="mr-1 h-3 w-3" /> Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {patient.caregiver_assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cuidador vinculado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.caregiver_assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.caregiver_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.caregiver_specialization ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={a.is_active ? "secondary" : "outline"}>
                        {a.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.assigned_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setRemoveAssignmentId(a.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" /> Contatos de Emergência ({patient.emergency_contacts.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAddContactOpen(true)}>
              <Plus className="mr-1 h-3 w-3" /> Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {patient.emergency_contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.emergency_contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.profile_family_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.profile_family_phone}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">#{c.priority}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setRemoveContactId(c.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-6 text-xs text-muted-foreground">
        <span>Criado por {patient.created_by_name}</span>
        <span>Atualizado em {new Date(patient.updated_at).toLocaleDateString("pt-BR")}</span>
      </div>

      <Dialog open={addCaregiverOpen} onOpenChange={setAddCaregiverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cuidador</DialogTitle>
            <DialogDescription>Selecione um cuidador para vincular a este paciente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Cuidador</Label>
            <Select value={selectedCaregiverId} onValueChange={(v) => setSelectedCaregiverId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cuidador..." />
              </SelectTrigger>
              <SelectContent>
                {caregivers.length === 0 ? (
                  <SelectItem value="__none__" disabled>Nenhum cuidador cadastrado</SelectItem>
                ) : (
                  caregivers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.email}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {addCaregiver.error && (
            <p className="text-sm text-destructive">{addCaregiver.error.message}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCaregiverOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCaregiver} disabled={!selectedCaregiverId || addCaregiver.isPending}>
              {addCaregiver.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Contato de Emergência</DialogTitle>
            <DialogDescription>Selecione um familiar para adicionar como contato.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Familiar</Label>
              <Select value={selectedFamilyId} onValueChange={(v) => setSelectedFamilyId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar familiar..." />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.length === 0 ? (
                    <SelectItem value="__none__" disabled>Nenhum familiar cadastrado</SelectItem>
                  ) : (
                    familyMembers.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name} — {f.email}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input id="priority" type="number" min={1} max={99} value={contactPriority} onChange={(e) => setContactPriority(e.target.value)} className="w-24" />
            </div>
          </div>
          {addContact.error && (
            <p className="text-sm text-destructive">{addContact.error.message}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddContact} disabled={!selectedFamilyId || addContact.isPending}>
              {addContact.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeAssignmentId} onOpenChange={() => setRemoveAssignmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cuidador</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja desvincular este cuidador do paciente?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={removeCaregiver.isPending}
              onClick={() => removeCaregiver.mutate(removeAssignmentId!, { onSuccess: () => setRemoveAssignmentId(null) })}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {removeCaregiver.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!removeContactId} onOpenChange={() => setRemoveContactId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover contato</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover este contato de emergência?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={removeContact.isPending}
              onClick={() => removeContact.mutate(removeContactId!, { onSuccess: () => setRemoveContactId(null) })}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {removeContact.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir paciente</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir <strong>{patient.name}</strong>? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePatient.isPending}
              onClick={() => deletePatient.mutate(id, { onSuccess: () => router.push("/patients") })}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {deletePatient.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
