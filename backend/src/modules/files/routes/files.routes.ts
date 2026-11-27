import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { authenticate } from '../../../common/middleware/authenticate';
import { resolveTenant, requireTenant } from '../../../common/middleware/resolve-tenant';
import { requireFeature } from '../../../common/middleware/require-feature';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { FEATURES } from '../../../common/constants/features';
import { writeAudit } from '../../../common/helpers/audit.helper';
import { assertWithinLimit, incrementUsage } from '../../../common/helpers/usage.helper';
import { idParamSchema } from '../../../common/schemas/id.schema';
import { validate } from '../../../common/middleware/validate.middleware';

/** Local disk storage for the practical task. Prefer private/signed URLs in production. */
const uploadDir = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(120),
  contentBase64: z.string().min(1),
});

export const filesRouter = Router();

filesRouter.use(
  authenticate,
  resolveTenant,
  requireTenant,
  requireFeature(FEATURES.FILE_UPLOADS)
);

filesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const files = await prisma.fileObject.findMany({
      where: { tenantId: req.tenant!.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, files);
  })
);

filesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = uploadSchema.parse(req.body);
    const tenantId = req.tenant!.id;
    await assertWithinLimit(
      tenantId,
      FEATURES.FILE_UPLOADS,
      req.tenant!.limits[FEATURES.FILE_UPLOADS]
    );

    const buffer = Buffer.from(body.contentBase64, 'base64');
    if (buffer.byteLength > 5 * 1024 * 1024) {
      throw AppError.badRequest('File too large (max 5MB)');
    }

    const ext = path.extname(body.fileName).slice(0, 20);
    const key = `${randomUUID()}${ext}`;
    fs.writeFileSync(path.join(uploadDir, key), buffer);

    const row = await prisma.fileObject.create({
      data: {
        tenantId,
        uploadedById: req.user!.id,
        key,
        fileName: body.fileName,
        mimeType: body.mimeType,
        sizeBytes: buffer.byteLength,
        url: `/uploads/${key}`,
      },
    });
    await incrementUsage(tenantId, FEATURES.FILE_UPLOADS, 1);
    await writeAudit(req, {
      action: 'file.upload',
      resource: 'FileObject',
      resourceId: row.id,
      tenantId,
    });
    sendCreated(res, row);
  })
);

filesRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const existing = await prisma.fileObject.findFirst({
      where: { id: req.params.id, tenantId: req.tenant!.id, deletedAt: null },
    });
    if (!existing) throw AppError.notFound('File');
    const row = await prisma.fileObject.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
    sendSuccess(res, row);
  })
);
