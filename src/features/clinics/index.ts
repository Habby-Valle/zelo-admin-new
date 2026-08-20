export { ClinicsList } from "./components/clinics-list";
export { ClinicDetailView } from "./components/clinic-detail";
export { ClinicDialog } from "./components/clinic-dialog";
export { ClinicForm } from "./components/clinic-form";
export {
  useClinics,
  useClinic,
  useCreateClinic,
  useUpdateClinic,
  useDeactivateClinic,
  useDeleteClinic,
  useClinicDeletionImpact,
  useClinicSubscription,
} from "./hooks";
export {
  getClinicsApi,
  getClinicApi,
  createClinicApi,
  updateClinicApi,
  deleteClinicApi,
  getClinicDeletionImpactApi,
  getPlansApi,
} from "./services/clinics.service";
export { getClinicSubscriptionApi } from "./services/subscription.service";
export type {
  Clinic,
  ClinicDeletionImpact,
  ClinicStatus,
  SubscriptionInfo,
  PlanOption,
} from "./types";
