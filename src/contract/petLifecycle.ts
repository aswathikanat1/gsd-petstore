import { handleAddPet } from "../handlers/addPet";
import { handleGetPetById } from "../handlers/getPetById";

export function registerPetLifecycleHandlers(api: any): void {
  api.register({
    addPet: handleAddPet,
    getPetById: handleGetPetById
  });
}
