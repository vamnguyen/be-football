import { registerAs } from '@nestjs/config';

export const corsConfig = registerAs('cors', () => {
  // Chuyển đổi chuỗi "true" thành boolean true
  const credentials = process.env.CORS_CREDENTIALS === 'true';

  // Xử lý origin để đảm bảo nó là mảng chuỗi
  let origins: string[] = [];
  if (process.env.CORS_ORIGIN) {
    // Nếu có nhiều origin được phân tách bằng dấu phẩy
    if (process.env.CORS_ORIGIN.includes(',')) {
      origins = process.env.CORS_ORIGIN.split(',').map((origin) =>
        origin.trim(),
      );
    } else {
      origins = [process.env.CORS_ORIGIN];
    }
  }

  return {
    origin: origins,
    credentials: credentials,
  };
});
