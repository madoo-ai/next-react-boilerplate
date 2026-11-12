"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldTickIcon as ShieldCheck } from "@x1nx3r/altics-react-icons";
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
import { Spinner } from "@/components/ui/spinner";
import { confirmPasswordAction } from "@/lib/auth/confirm-password-actions";
import { translateFieldError } from "@/lib/i18n/translate-error";

const schema = z.object({
  password: z.string().min(1, "validation.required"),
});

type ConfirmValues = z.infer<typeof schema>;

export function ConfirmPasswordForm({ next }: { next?: string }) {
  const t = useTranslations("auth.confirmPassword");
  const tFields = useTranslations("auth.fields");
  const tValidation = useTranslations("validation");
  const tAll = useTranslations();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ConfirmValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  const fieldError = (message?: string) =>
    translateFieldError(
      message,
      tValidation as unknown as (key: string) => string,
    );

  async function onSubmit(values: ConfirmValues) {
    setFormError(null);

    const result = await confirmPasswordAction(values.password, next);

    if (!result.ok) {
      setFormError((tAll as unknown as (key: string) => string)(result.error));
      return;
    }

    router.push(result.next as Route);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-4">
        <FormAlert message={formError} />
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">{tFields("password")}</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            autoFocus
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <FieldError>
            {fieldError(form.formState.errors.password?.message)}
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
            <ShieldCheck data-icon="inline-start" />
          )}
          {t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
