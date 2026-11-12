"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const schema = z.object({
  email: z.email("validation.email"),
  password: z.string().min(1, "validation.required"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof schema>;

function safeNextPath(next: string | undefined) {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export function LoginForm({
  next,
  initialError,
  notice,
}: {
  next?: string;
  initialError?: string;
  notice?: string;
}) {
  const t = useTranslations("auth.login");
  const tFields = useTranslations("auth.fields");
  const tAuth = useTranslations();
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(
    initialError === "account_inactive"
      ? tAuth("errors.accountInactive")
      : initialError === "account_pending"
        ? tAuth("auth.messages.pendingApproval")
        : null,
  );

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const fieldError = (message?: string) =>
    translateFieldError(
      message,
      tValidation as unknown as (key: string) => string,
    );

  const rememberMe = useWatch({
    control: form.control,
    name: "rememberMe",
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);

    const result = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (result.error) {
      setFormError(
        authErrorMessage(
          result.error,
          tAuth as unknown as (key: string) => string,
        ),
      );
      return;
    }

    const data = result.data as { twoFactorRedirect?: boolean } | null;

    if (data?.twoFactorRedirect) {
      router.push("/two-factor");
      return;
    }

    router.push(safeNextPath(next) as Route);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-4">
        <FormAlert message={notice} variant="default" />
        <FormAlert message={formError} />
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">{tFields("email")}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          <FieldError>
            {fieldError(form.formState.errors.email?.message)}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="password">{tFields("password")}</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {t("forgot")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <FieldError>
            {fieldError(form.formState.errors.password?.message)}
          </FieldError>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) =>
              form.setValue("rememberMe", checked === true)
            }
          />
          <FieldLabel htmlFor="rememberMe" className="font-normal">
            {t("remember")}
          </FieldLabel>
        </Field>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <LogIn data-icon="inline-start" />
          )}
          {t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
