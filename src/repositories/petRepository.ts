import type { Pet, PetStatus, UploadMetadata } from "../types/pet";

interface PetRepository {
  create(pet: Pet): Pet;
  findById(id: number): Pet | null;
  findByStatuses(statuses: PetStatus[]): Pet[];
  update(id: number, pet: Pet): Pet | null;
  partialUpdate(id: number, updates: Partial<Pick<Pet, "name" | "status">>): Pet | null;
  attachUploadMetadata(id: number, metadata: UploadMetadata): Pet | null;
  delete(id: number): boolean;
  reset(): void;
}

class InMemoryPetRepository implements PetRepository {
  private pets: Map<number, Pet> = new Map();
  private nextId: number = 1;

  create(pet: Pet): Pet {
    const id = this.nextId++;
    const createdPet: Pet = {
      ...pet,
      id,
      uploadedImages: pet.uploadedImages ?? []
    };
    this.pets.set(id, createdPet);
    return createdPet;
  }

  findById(id: number): Pet | null {
    const pet = this.pets.get(id);
    return pet ?? null;
  }

  findByStatuses(statuses: PetStatus[]): Pet[] {
    if (statuses.length === 0) {
      return [];
    }

    const statusSet = new Set<PetStatus>(statuses);
    return Array.from(this.pets.values()).filter((pet) => {
      return pet.status !== undefined && statusSet.has(pet.status);
    });
  }

  update(id: number, pet: Pet): Pet | null {
    const existing = this.pets.get(id);
    if (!existing) {
      return null;
    }

    const updatedPet: Pet = {
      ...pet,
      id,
      uploadedImages: pet.uploadedImages ?? existing.uploadedImages ?? []
    };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  partialUpdate(id: number, updates: Partial<Pick<Pet, "name" | "status">>): Pet | null {
    const existing = this.pets.get(id);
    if (!existing) {
      return null;
    }

    const updatedPet: Pet = {
      ...existing,
      ...updates,
      id: existing.id,
      uploadedImages: existing.uploadedImages ?? []
    };

    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  attachUploadMetadata(id: number, metadata: UploadMetadata): Pet | null {
    const existing = this.pets.get(id);
    if (!existing) {
      return null;
    }

    const uploadedImages = [...(existing.uploadedImages ?? []), metadata];
    const updatedPet: Pet = { ...existing, uploadedImages };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  delete(id: number): boolean {
    return this.pets.delete(id);
  }

  reset(): void {
    this.pets.clear();
    this.nextId = 1;
  }
}

export const petRepository = new InMemoryPetRepository();
