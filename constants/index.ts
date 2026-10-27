/** Resume PDF size limit. Must match MAX_RESUME_BYTES in server/routes/resumes.js. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Job description PDF or image size limit. Must match MAX_JD_FILE_BYTES in server/routes/resumes.js. */
export const MAX_JD_FILE_BYTES = 4 * 1024 * 1024;

/** For the job description file input's `accept` attribute. */
export const JD_ACCEPT = "application/pdf,image/png,image/jpeg,image/webp,.pdf,.png,.jpg,.jpeg,.webp";
