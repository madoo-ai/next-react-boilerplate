"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { Save01Icon as Save } from "@x1nx3r/altics-react-icons";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { translateFieldError } from "@/lib/i18n/translate-error";
import { updateProfileAction } from "@/lib/settings/actions";
import { profileSchema, type ProfileInput } from "@/lib/settings/schema";

export function ProfileForm({
  user,
}: {
  user: {
    name: string;
    email: string;
    phoneNumber: string | null;
    jobTitle: string | null;
    department: string | null;
  };
}) {
  const t = useTranslations("settings.profile");
  const tValidation = useTranslations("validation");
  const tAll = useTranslations();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phoneNumber ?? "",
      jobTitle: user.jobTitle ?? "",
      department: user.department ?? "",
    },
  });

  const fieldError = (message?: string) =>
    translateFieldError(
      message,
      tValidation as unknown as (key: string) => string,
    );

  const { execute, isPending } = useAction(updateProfileAction, {
    onSuccess: () => {
      toast.success(t("saved"));
      router.refresh();
    },
    onError: ({ error }) => {
      setFormError(
        (tAll as unknown as (key: string) => string)(
          error.serverError ?? "errors.unexpected",
        ),
      );
    },
  });

  function onSubmit(values: ProfileInput) {
    setFormError(null);
    execute(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormAlert message={formError} />
            </div>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="profile-name">{t("name")}</FieldLabel>
              <Input
                id="profile-name"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              <FieldError>
                {fieldError(form.formState.errors.name?.message)}
              </FieldError>
            </Field>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="profile-email">{t("email")}</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              <FieldDescription>{t("emailHint")}</FieldDescription>
              <FieldError>
                {fieldError(form.formState.errors.email?.message)}
              </FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-phone">{t("phone")}</FieldLabel>
              <Input
                id="profile-phone"
                autoComplete="tel"
                {...form.register("phone")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-job-title">
                {t("jobTitle")}
              </FieldLabel>
              <Input id="profile-job-title" {...form.register("jobTitle")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-department">
                {t("department")}
              </FieldLabel>
              <Input id="profile-department" {...form.register("department")} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {t("save")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
