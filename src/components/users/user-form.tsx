"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { Save01Icon as Save } from "@x1nx3r/altics-react-icons";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { translateFieldError } from "@/lib/i18n/translate-error";
import { createUserAction, updateUserAction } from "@/lib/users/actions";

const baseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.nameLength")
    .max(120, "validation.nameLength"),
  email: z.email("validation.email"),
  phone: z.string().trim().max(40).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  department: z.string().trim().max(120).optional(),
  role: z.string().min(1, "validation.invalidRole"),
  status: z.enum(["pending", "active", "suspended"]),
  password: z.string().max(128).optional(),
});

type UserFormValues = z.infer<typeof baseSchema>;

type RoleOption = {
  name: string;
  label: string;
};

type EditableUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  jobTitle: string | null;
  department: string | null;
  role: string | null;
  status: "pending" | "active" | "suspended";
};

export function UserForm({
  mode,
  roles,
  user,
}: {
  mode: "create" | "edit";
  roles: RoleOption[];
  user?: EditableUser;
}) {
  const t = useTranslations("users");
  const tForm = useTranslations("users.form");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const tActions = useTranslations("users.actions");
  const tAll = useTranslations();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = baseSchema.superRefine((values, ctx) => {
    const password = values.password ?? "";

    if (mode === "create" && password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "validation.passwordLength",
      });
    }

    if (mode === "edit" && password.length > 0 && password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "validation.passwordLength",
      });
    }
  });

  const defaultRole =
    roles.find((role) => role.name === "user")?.name ?? roles[0]?.name ?? "";

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phoneNumber ?? "",
      jobTitle: user?.jobTitle ?? "",
      department: user?.department ?? "",
      role: user?.role ?? defaultRole,
      status: user?.status ?? "active",
      password: "",
    },
  });

  const fieldError = (message?: string) =>
    translateFieldError(
      message,
      tValidation as unknown as (key: string) => string,
    );

  const translateError = (key: string | undefined) =>
    (tAll as unknown as (key: string) => string)(key ?? "errors.unexpected");

  const callbacks = {
    onSuccess: () => {
      toast.success(
        t(mode === "create" ? "messages.created" : "messages.updated"),
      );
      router.push("/admin/users");
      router.refresh();
    },
    onError: ({ error }: { error: { serverError?: string } }) => {
      setFormError(translateError(error.serverError));
    },
  };

  const createAction = useAction(createUserAction, callbacks);
  const updateAction = useAction(updateUserAction, callbacks);
  const isPending = createAction.isPending || updateAction.isPending;

  function onSubmit(values: UserFormValues) {
    setFormError(null);

    if (mode === "create") {
      createAction.execute({
        ...values,
        password: values.password ?? "",
      });
      return;
    }

    if (!user) return;

    updateAction.execute({
      ...values,
      id: user.id,
      password: values.password ?? "",
    });
  }

  const role = useWatch({ control: form.control, name: "role" });
  const status = useWatch({ control: form.control, name: "status" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{tForm("title")}</CardTitle>
          <CardDescription>{tForm("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormAlert message={formError} />
            </div>
            <Field
              className="md:col-span-2"
              data-invalid={!!form.formState.errors.name}
            >
              <FieldLabel htmlFor="name">{tForm("name")}</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              <FieldError>
                {fieldError(form.formState.errors.name?.message)}
              </FieldError>
            </Field>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">{tForm("email")}</FieldLabel>
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
            <Field>
              <FieldLabel htmlFor="phone">{tForm("phone")}</FieldLabel>
              <Input
                id="phone"
                autoComplete="tel"
                {...form.register("phone")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="jobTitle">{tForm("jobTitle")}</FieldLabel>
              <Input id="jobTitle" {...form.register("jobTitle")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="department">
                {tForm("department")}
              </FieldLabel>
              <Input id="department" {...form.register("department")} />
            </Field>
            <Field data-invalid={!!form.formState.errors.role}>
              <FieldLabel htmlFor="role">{tForm("role")}</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) =>
                  form.setValue("role", value, { shouldValidate: true })
                }
              >
                <SelectTrigger id="role" aria-label={tForm("role")}>
                  <SelectValue placeholder={tForm("role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>
                {fieldError(form.formState.errors.role?.message)}
              </FieldError>
            </Field>
            <Field data-invalid={!!form.formState.errors.status}>
              <FieldLabel htmlFor="status">{tForm("status")}</FieldLabel>
              <Select
                value={status}
                onValueChange={(value) =>
                  form.setValue("status", value as UserFormValues["status"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="status" aria-label={tForm("status")}>
                  <SelectValue placeholder={tForm("status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">{tCommon("active")}</SelectItem>
                    <SelectItem value="pending">
                      {tCommon("pending")}
                    </SelectItem>
                    <SelectItem value="suspended">
                      {tCommon("suspended")}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>
                {fieldError(form.formState.errors.status?.message)}
              </FieldError>
            </Field>
            <Field
              className="md:col-span-2"
              data-invalid={!!form.formState.errors.password}
            >
              <FieldLabel htmlFor="password">{tForm("password")}</FieldLabel>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              {mode === "edit" ? (
                <FieldDescription>{tForm("passwordHint")}</FieldDescription>
              ) : (
                <FieldDescription>
                  {tForm("passwordHintCreate")}
                </FieldDescription>
              )}
              <FieldError>
                {fieldError(form.formState.errors.password?.message)}
              </FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button asChild variant="outline">
            <Link href="/admin/users">{tCommon("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {mode === "create" ? tActions("create") : tActions("save")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
