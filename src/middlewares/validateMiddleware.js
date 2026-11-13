
import fs from "fs/promises";

const validate = (schema) => {
  return async (req, res, next) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Yuborilgan ma'lumotlar noto'g'ri",
        errors,
      });
    }

    req.validated = result.data;
    req.body = result.data.body;
    req.params = result.data.params;

    next();
  };
};

export default validate;
