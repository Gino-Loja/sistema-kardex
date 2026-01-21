"use server";

import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY_MISSING");
  }

  return new Resend(apiKey);
};

const getDefaultFrom = () => {
  const from = process.env.RESEND_FROM;

  if (!from) {
    throw new Error("RESEND_FROM_MISSING");
  }

  return from;
};

export const sendEmail = async (input: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) => {
  const resend = getResendClient();
  const from = input.from ?? getDefaultFrom();

  let payload: CreateEmailOptions;

  if (input.html) {
    payload = {
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
    };
  } else if (input.text) {
    payload = {
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    };
  } else {
    throw new Error("RESEND_CONTENT_MISSING");
  }

  return resend.emails.send(payload);
};
