import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  productImages: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      // For now, allow all uploads during development
      // We'll add proper auth later
      return { userId: "dev" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;