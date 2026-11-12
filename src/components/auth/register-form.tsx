"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus01Icon as UserPlus } from "@x1nx3r/altics-react-icons";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage } from "@/lib/auth/auth-error";
import { translateFieldError } from "@/lib/i18n/translate-error";

const schema = z
  .object({
    name: z
      .string()
      .min(2, "validation.nameLength")
      .max(120, "validation.nameLength"),
    email: z.email("validation.email"),
    password: z
      .string()
      .min(8, "validation.passwordLength")
      .max(128, "validation.passwordLength"),
    confirmPassword: z.string().min(1, "validation.required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.passwordMismatch",
  });

type RegisterValues = z.infer<typeof schema>;

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tFields = useTranslations("auth.fields");
  const tAll = useTranslations();
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const fieldError = (message?: string) =>
    translateFieldError(
      message,
      tValidation as unknown as (key: string) => string,
    );

  async function onSubmit(values: RegisterValues) {
    setFormError(null);

    const result = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: `${window.location.origin}/verify-email`,
    });

    if (result.error) {
      setFormError(
        authErrorMessage(
          result.error,
          tAll as unknown as (key: string) => string,
        ),
      );
      return;
    }

    const status = (result.data?.user as { status?: string } | undefined)
      ?.status;

    if (status === "pending") {
      router.push("/login?error=account_pending");
      return;
    }

    const signIn = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: true,
    });

    if (signIn.error) {
      setFormError(
        authErrorMessage(
          signIn.error,
          tAll as unknown as (key: string) => string,
        ),
      );
      return;
    }

    const signInData = signIn.data as {
      twoFactorRedirect?: boolean;
    } | null;

    if (signInData?.twoFactorRedirect) {
      router.push("/two-factor");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-4">
        <FormAlert message={formError} />
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="name">{tFields("name")}</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            autoFocus
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
          <FieldError>
            {fieldError(form.formState.errors.name?.message)}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">{tFields("email")}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          <FieldError>
            {fieldError(form.formState.errors.email?.message)}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">{tFields("password")}</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <FieldError>
            {fieldError(form.formState.errors.password?.message)}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">
            {tFields("confirmPassword")}
          </FieldLabel>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.confirmPassword}
            {...form.register("confirmPassword")}
          />
          <FieldError>
            {fieldError(form.formState.errors.confirmPassword?.message)}
          </FieldError>
        </Field>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <UserPlus data-icon="inline-start" />
          )}
          {t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
