
import { randomInt, createHmac, timingSafeEqual } from "crypto";
import User from "../models/User.js";
import { sendVerificationEmail } from "./emailService.js";

const OTP_EXPIRES_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// 6 xonali tasodifiy kod
const generateOTP = () => {
  return randomInt(100000, 1000000).toString();
};

// OTP kodini HMAC orqali hash qilish
const hashOTP = (code) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET yoki JWT_SECRET sozlanmagan");
  }

  return createHmac("sha256", secret)
    .update(code)
    .digest("hex");
};

// Hashlarni xavfsiz taqqoslash
const compareOTP = (code, storedHash) => {
  const candidateHash = hashOTP(code);

  const candidateBuffer = Buffer.from(candidateHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (candidateBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, storedBuffer);
};

// Yangi OTP yaratish va emailga yuborish
const createAndSendOTP = async (user) => {
  const code = generateOTP();

  user.emailVerificationCodeHash = hashOTP(code);
  user.emailVerificationExpires = new Date(
    Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000
  );

  user.emailVerificationAttempts = 0;
  user.emailVerificationResendAt = new Date(
    Date.now() + OTP_RESEND_SECONDS * 1000
  );

  await user.save();

  await sendVerificationEmail(user.email, code);
};

// REGISTER
export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw createError(
      "Bu email allaqachon ro'yxatdan o'tgan",
      409
    );
  }

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password,
    isEmailVerified: false,
  });

  await createAndSendOTP(user);

  return user;
};

// VERIFY EMAIL
export const verifyEmail = async ({ email, code }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select(
    "+emailVerificationCodeHash +emailVerificationExpires +emailVerificationAttempts"
  );

  if (!user) {
    throw createError("Foydalanuvchi topilmadi", 404);
  }

  if (user.isEmailVerified) {
    throw createError("Email allaqachon tasdiqlangan", 400);
  }

  if (!user.emailVerificationCodeHash) {
    throw createError(
      "Tasdiqlash kodi mavjud emas. Yangi kod so'rang.",
      400
    );
  }

  if (
    !user.emailVerificationExpires ||
    user.emailVerificationExpires.getTime() < Date.now()
  ) {
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpires = null;
    user.emailVerificationAttempts = 0;

    await user.save();

    throw createError(
      "Tasdiqlash kodi muddati tugagan. Yangi kod so'rang.",
      400
    );
  }

  if (user.emailVerificationAttempts >= MAX_OTP_ATTEMPTS) {
    throw createError(
      "Urinishlar chegarasi tugadi. Yangi kod so'rang.",
      429
    );
  }

  const isCodeCorrect = compareOTP(
    code,
    user.emailVerificationCodeHash
  );

  if (!isCodeCorrect) {
    user.emailVerificationAttempts += 1;

    if (user.emailVerificationAttempts >= MAX_OTP_ATTEMPTS) {
      user.emailVerificationCodeHash = undefined;
      user.emailVerificationExpires = null;
    }

    await user.save();

    throw createError(
      "Tasdiqlash kodi noto'g'ri",
      400
    );
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();

  user.emailVerificationCodeHash = undefined;
  user.emailVerificationExpires = null;
  user.emailVerificationAttempts = 0;
  user.emailVerificationResendAt = null;

  await user.save();

  return user;
};

// RESEND VERIFICATION CODE
export const resendVerificationCode = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select(
    "+emailVerificationCodeHash +emailVerificationExpires +emailVerificationAttempts +emailVerificationResendAt"
  );

  if (!user) {
    throw createError("Foydalanuvchi topilmadi", 404);
  }

  if (user.isEmailVerified) {
    throw createError("Email allaqachon tasdiqlangan", 400);
  }

  if (
    user.emailVerificationResendAt &&
    user.emailVerificationResendAt.getTime() > Date.now()
  ) {
    const remainingSeconds = Math.ceil(
      (user.emailVerificationResendAt.getTime() - Date.now()) / 1000
    );

    throw createError(
      `Yangi kodni ${remainingSeconds} soniyadan keyin so'rashingiz mumkin`,
      429
    );
  }

  await createAndSendOTP(user);

  return {
    message: "Yangi tasdiqlash kodi emailingizga yuborildi",
  };
};

// LOGIN
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw createError("Email yoki parol noto'g'ri", 401);
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw createError("Email yoki parol noto'g'ri", 401);
  }

  if (!user.isEmailVerified) {
    throw createError(
      "Avval emailingizni tasdiqlang",
      403
    );
  }

  if (!user.isActive) {
    throw createError(
      "Akkauntingiz vaqtincha bloklangan",
      403
    );
  }

  user.lastLogin = new Date();
  await user.save();

  return user;
};
