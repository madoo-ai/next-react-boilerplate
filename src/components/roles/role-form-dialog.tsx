"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { Pencil, Plus, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createRoleAction, updateRoleAction } from "@/lib/roles/actions";
import { roleSchema, type RoleInput } from "@/lib/roles/schema";
import { translateFieldError } from "@/lib/i18n/translate-error";

type PermissionOption = {
  id: string;
  key: string;
  label: string;
};

type EditableRole = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  permissions: string[];
};

function RoleDialog({
  mode,
  role,
  permissions,
  trigger,
}: {
  mode: "create" | "edit";
  role?: EditableRole;
  permissions: PermissionOption[];
  trigger: React.ReactNode;
}) {
  const t = useTranslations("roles");
  const tForm = useTranslations("roles.form");
  const tActions = useTranslations("roles.actions");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const tPermissionNames = useTranslations("permissions");
  const tAll = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name ?? "",
      label: role?.label ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? [],
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
      setOpen(false);
      toast.success(
        t(mode === "create" ? "messages.created" : "messages.updated"),
      );
      router.refresh();
    },
    onError: ({ error }: { error: { serverError?: string } }) => {
      setFormError(translateError(error.serverError));
    },
  };

  const createAction = useAction(createRoleAction, callbacks);
  const updateAction = useAction(updateRoleAction, callbacks);
  const isPending = createAction.isPending || updateAction.isPending;

  function onSubmit(values: RoleInput) {
    setFormError(null);

    if (mode === "create") {
      createAction.execute(values);
      return;
    }

    if (!role) return;

    updateAction.execute({ ...values, id: role.id });
  }

  const selectedPermissions =
    useWatch({ control: form.control, name: "permissions" }) ?? [];
  const lockName = role?.name === "user";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("create") : t("edit")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FormAlert message={formError} />
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="role-name">{tForm("name")}</FieldLabel>
                <Input
                  id="role-name"
                  disabled={lockName}
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />
                {lockName ? (
                  <FieldDescription>{tForm("nameHint")}</FieldDescription>
                ) : null}
                <FieldError>
                  {fieldError(form.formState.errors.name?.message)}
                </FieldError>
              </Field>
              <Field data-invalid={!!form.formState.errors.label}>
                <FieldLabel htmlFor="role-label">{tForm("label")}</FieldLabel>
                <Input
                  id="role-label"
                  aria-invalid={!!form.formState.errors.label}
                  {...form.register("label")}
                />
                <FieldError>
                  {fieldError(form.formState.errors.label?.message)}
                </FieldError>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="role-description">
                {tForm("description")}
              </FieldLabel>
              <Textarea
                id="role-description"
                rows={3}
                {...form.register("description")}
              />
            </Field>
            <FieldSet>
              <FieldLegend>{tForm("permissions")}</FieldLegend>
              <FieldGroup>
                {permissions.map((permission) => {
                  const checked = selectedPermissions.includes(permission.key);

                  return (
                    <Field key={permission.key} orientation="horizontal">
                      <Checkbox
                        id={`permission-${permission.key}`}
                        checked={checked}
                        onCheckedChange={(value) => {
                          const next = value
                            ? [...selectedPermissions, permission.key]
                            : selectedPermissions.filter(
                                (key) => key !== permission.key,
                              );
                          form.setValue("permissions", next, {
                            shouldValidate: true,
                          });
                        }}
                      />
                      <FieldLabel
                        htmlFor={`permission-${permission.key}`}
                        className="font-normal"
                      >
                        {tPermissionNames(permission.key as never)}
                      </FieldLabel>
                    </Field>
                  );
                })}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {mode === "create" ? tActions("create") : tActions("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateRoleDialog({
  permissions,
}: {
  permissions: PermissionOption[];
}) {
  const t = useTranslations("roles");

  return (
    <RoleDialog
      mode="create"
      permissions={permissions}
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          {t("create")}
        </Button>
      }
    />
  );
}

export function EditRoleDialog({
  role,
  permissions,
}: {
  role: EditableRole;
  permissions: PermissionOption[];
}) {
  const tCommon = useTranslations("common");

  return (
    <RoleDialog
      mode="edit"
      role={role}
      permissions={permissions}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={tCommon("edit")}>
          <Pencil />
        </Button>
      }
    />
  );
}
