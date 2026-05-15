import { type Request, type Response } from "express";
import { createApp } from "../src/app";
import { petRepository } from "../src/repositories/petRepository";

// Reset the repository before each test
function resetRepository() {
  petRepository.reset();
}

describe("Pet Lifecycle CRUD Operations", () => {
  let app: any;

  beforeEach(() => {
    resetRepository();
    app = createApp();
  });

  describe("POST /pet - addPet", () => {
    it("should create a new pet and return 200 with pet data", async () => {
      const newPet = {
        name: "Fluffy",
        photoUrls: ["https://example.com/fluffy.jpg"],
        status: "available" as const
      };

      // Simulate a POST request to /pet
      const mockReq = {
        method: "POST",
        path: "/pet",
        body: newPet,
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      // Call the handler directly for testing
      const { handleAddPet } = await import("../src/handlers/addPet");
      handleAddPet(
        {
          request: { body: newPet, method: "POST", path: "/pet", headers: {} },
          operation: { operationId: "addPet" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.data).toHaveProperty("id");
      expect(mockRes.data.name).toBe("Fluffy");
    });

    it("should assign a numeric ID to the created pet", async () => {
      const newPet = {
        name: "Max",
        photoUrls: ["https://example.com/max.jpg"]
      };

      const created = petRepository.create(newPet as any);
      expect(created.id).toBe(1);

      const created2 = petRepository.create({ ...newPet, name: "Buddy" } as any);
      expect(created2.id).toBe(2);
    });

    it("should return 401 for missing bearer token on protected operation", async () => {
      const newPet = {
        name: "SecurePet",
        photoUrls: ["https://example.com/secure.jpg"]
      };

      const mockReq = {
        method: "POST",
        path: "/pet",
        body: newPet,
        headers: {}
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleAddPet } = await import("../src/handlers/addPet");
      handleAddPet(
        {
          request: { body: newPet, method: "POST", path: "/pet", headers: {} },
          operation: { operationId: "addPet" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes.data.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /pet/{petId} - getPetById", () => {
    it("should return 200 with pet data when pet exists", async () => {
      const newPet = {
        name: "Bella",
        photoUrls: ["https://example.com/bella.jpg"],
        status: "available" as const
      };

      const created = petRepository.create(newPet as any);
      const retrieved = petRepository.findById(created.id!);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe("Bella");
      expect(retrieved!.id).toBe(created.id);
    });

    it("should return 404 when pet does not exist", async () => {
      const mockReq = {
        method: "GET",
        path: "/pet/999",
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleGetPetById } = await import("../src/handlers/getPetById");
      handleGetPetById(
        {
          request: { params: { petId: "999" }, method: "GET", path: "/pet/999", headers: {} },
          operation: { operationId: "getPetById" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.data.code).toBe("NOT_FOUND");
    });
  });

  describe("PUT /pet - updatePet", () => {
    it("should update an existing pet and return 200", async () => {
      const newPet = {
        name: "Original",
        photoUrls: ["https://example.com/original.jpg"],
        status: "available" as const
      };

      const created = petRepository.create(newPet as any);
      const updated = petRepository.update(created.id!, {
        id: created.id,
        name: "Updated",
        photoUrls: ["https://example.com/updated.jpg"],
        status: "pending" as const
      } as any);

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("Updated");
      expect(updated!.status).toBe("pending");
    });

    it("should return 404 when updating non-existent pet", async () => {
      const updateData = {
        id: 999,
        name: "Ghost",
        photoUrls: ["https://example.com/ghost.jpg"]
      };

      const mockReq = {
        method: "PUT",
        path: "/pet",
        body: updateData,
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleUpdatePet } = await import("../src/handlers/updatePet");
      handleUpdatePet(
        {
          request: { body: updateData, method: "PUT", path: "/pet", headers: {} },
          operation: { operationId: "updatePet" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.data.code).toBe("NOT_FOUND");
    });
  });

  describe("DELETE /pet/{petId} - deletePet", () => {
    it("should delete an existing pet and return 200", async () => {
      const newPet = {
        name: "ToDelete",
        photoUrls: ["https://example.com/delete.jpg"],
        status: "available" as const
      };

      const created = petRepository.create(newPet as any);
      expect(petRepository.findById(created.id!)).not.toBeNull();

      const deleted = petRepository.delete(created.id!);
      expect(deleted).toBe(true);
      expect(petRepository.findById(created.id!)).toBeNull();
    });

    it("should return 404 when deleting non-existent pet", async () => {
      const mockReq = {
        method: "DELETE",
        path: "/pet/999",
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleDeletePet } = await import("../src/handlers/deletePet");
      handleDeletePet(
        {
          request: { params: { petId: "999" }, method: "DELETE", path: "/pet/999", headers: {} },
          operation: { operationId: "deletePet" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.data.code).toBe("NOT_FOUND");
    });
  });

  describe("Full CRUD Lifecycle", () => {
    it("should support create, read, update, and delete in sequence", async () => {
      // Create
      const newPet = {
        name: "LifecyclePet",
        photoUrls: ["https://example.com/lifecycle.jpg"],
        status: "available" as const
      };
      const created = petRepository.create(newPet as any);
      expect(created.id).toBe(1);

      // Read
      const read = petRepository.findById(created.id!);
      expect(read!.name).toBe("LifecyclePet");

      // Update
      const updated = petRepository.update(created.id!, {
        ...newPet,
        name: "UpdatedLifecyclePet",
        status: "pending" as const
      } as any);
      expect(updated!.name).toBe("UpdatedLifecyclePet");

      // Verify update
      const readAgain = petRepository.findById(created.id!);
      expect(readAgain!.name).toBe("UpdatedLifecyclePet");

      // Delete
      const deleted = petRepository.delete(created.id!);
      expect(deleted).toBe(true);

      // Verify deletion
      const readAfterDelete = petRepository.findById(created.id!);
      expect(readAfterDelete).toBeNull();
    });
  });

  describe("GET /pet/findByStatus - findPetsByStatus", () => {
    it("should return pets filtered by valid status", async () => {
      petRepository.create({ name: "A", photoUrls: ["a"], status: "available" } as any);
      petRepository.create({ name: "B", photoUrls: ["b"], status: "pending" } as any);

      const mockReq = {
        method: "GET",
        path: "/pet/findByStatus?status=available",
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleFindPetsByStatus } = await import("../src/handlers/findPetsByStatus");
      handleFindPetsByStatus(
        {
          request: {
            query: { status: "available" },
            method: "GET",
            path: "/pet/findByStatus",
            headers: {}
          },
          operation: { operationId: "findPetsByStatus" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(200);
      expect(Array.isArray(mockRes.data)).toBe(true);
      expect(mockRes.data).toHaveLength(1);
      expect(mockRes.data[0].name).toBe("A");
    });

    it("should return 400 for invalid status value", async () => {
      const mockReq = {
        method: "GET",
        path: "/pet/findByStatus?status=bad",
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleFindPetsByStatus } = await import("../src/handlers/findPetsByStatus");
      handleFindPetsByStatus(
        {
          request: {
            query: { status: "bad" },
            method: "GET",
            path: "/pet/findByStatus",
            headers: {}
          },
          operation: { operationId: "findPetsByStatus" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.data.code).toBe("INVALID_STATUS");
    });
  });

  describe("POST /pet/{petId} - updatePetWithForm", () => {
    it("should partially update name and preserve untouched fields", async () => {
      const created = petRepository.create({
        name: "FormPet",
        photoUrls: ["img"],
        status: "available"
      } as any);

      const mockReq = {
        method: "POST",
        path: `/pet/${created.id}`,
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleUpdatePetWithForm } = await import("../src/handlers/updatePetWithForm");
      handleUpdatePetWithForm(
        {
          request: {
            params: { petId: String(created.id) },
            query: { name: "Renamed" },
            method: "POST",
            path: `/pet/${created.id}`,
            headers: {}
          },
          operation: { operationId: "updatePetWithForm" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.data.name).toBe("Renamed");
      expect(mockRes.data.status).toBe("available");
      expect(mockRes.data.photoUrls).toEqual(["img"]);
    });
  });

  describe("POST /pet/{petId}/uploadImage - uploadFile", () => {
    it("should return ApiResponse shape for successful upload", async () => {
      const created = petRepository.create({
        name: "UploadPet",
        photoUrls: ["img"],
        status: "available"
      } as any);

      const mockReq = {
        method: "POST",
        path: `/pet/${created.id}/uploadImage`,
        header: (name: string) => (name.toLowerCase() === "content-type" ? "application/octet-stream" : undefined),
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleUploadFile } = await import("../src/handlers/uploadFile");
      handleUploadFile(
        {
          request: {
            params: { petId: String(created.id) },
            query: { additionalMetadata: "tag" },
            requestBody: "binary-payload",
            method: "POST",
            path: `/pet/${created.id}/uploadImage`,
            headers: {}
          },
          operation: { operationId: "uploadFile" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.data).toEqual({
        code: 200,
        type: "success",
        message: "File uploaded successfully"
      });

      const updated = petRepository.findById(created.id as number);
      expect(updated?.uploadedImages?.length).toBe(1);
    });

    it("should return 400 when file is missing", async () => {
      const created = petRepository.create({
        name: "UploadPet",
        photoUrls: ["img"],
        status: "available"
      } as any);

      const mockReq = {
        method: "POST",
        path: `/pet/${created.id}/uploadImage`,
        header: () => "application/octet-stream",
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleUploadFile } = await import("../src/handlers/uploadFile");
      handleUploadFile(
        {
          request: {
            params: { petId: String(created.id) },
            query: {},
            requestBody: "",
            method: "POST",
            path: `/pet/${created.id}/uploadImage`,
            headers: {}
          },
          operation: { operationId: "uploadFile" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(400);
    });

    it("should return 404 when pet does not exist", async () => {
      const mockReq = {
        method: "POST",
        path: "/pet/999/uploadImage",
        header: () => "application/octet-stream",
        headers: { authorization: "Bearer test-token" }
      } as any;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.data = data;
          return this;
        }
      } as any;

      const { handleUploadFile } = await import("../src/handlers/uploadFile");
      handleUploadFile(
        {
          request: {
            params: { petId: "999" },
            query: {},
            requestBody: "binary-payload",
            method: "POST",
            path: "/pet/999/uploadImage",
            headers: {}
          },
          operation: { operationId: "uploadFile" }
        } as any,
        mockReq,
        mockRes
      );

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.data.code).toBe("NOT_FOUND");
    });
  });
});
