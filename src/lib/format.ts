export function formatCnpj(cnpj: string | undefined | null): string {
  if (!cnpj) return "—"
  const d = cnpj.replace(/\D/g, "")
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

export function formatCep(value: string | undefined | null): string {
  if (!value) return ""
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.replace(/^(\d{5})(\d)/, "$1-$2")
}

export function formatPhone(value: string | undefined | null): string {
  if (!value) return ""
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3")
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
}

export function formatCnpjInput(value: string | undefined | null): string {
  if (!value) return ""
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("pt-BR")
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatCurrency(value: number | undefined | null): string {
  if (value == null) return "—"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}
