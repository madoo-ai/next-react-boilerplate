"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormAlert } from "@/components/auth/form-alert";
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
import { translateFieldError } from "@/lib/i18n/translate-error";

const schema = z.object({
  email: z.email("validation.email"),
});

type ForgotValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const tFields = useTranslations("auth.fields");
  const tMessages = useTranslations("auth.messages");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const fieldError = (message?: string) =>
    translateFieldError(
      message,
      tValidation as unknown as (key: string) => string,
    );

  async function onSubmit(values: ForgotValues) {
    setFormError(null);

    const result = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (result.error) {
      setFormError(result.error.message ?? tErrors("unexpected"));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert message={tMessages("emailSent")} variant="default" />
        <Button asChild variant="outline" className="w-full">
          <a href="/login">{t("back")}</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-4">
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
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Mail data-icon="inline-start" />
          )}
          {t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
