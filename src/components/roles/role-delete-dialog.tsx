"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { deleteRoleAction } from "@/lib/roles/actions";

export function RoleDeleteDialog({
  role,
  disabled,
}: {
  role: { id: string; label: string };
  disabled: boolean;
}) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const tAll = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { execute, isPending } = useAction(deleteRoleAction, {
    onSuccess: () => {
      setOpen(false);
      toast.success(t("messages.deleted"));
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(
        (tAll as unknown as (key: string) => string)(
          error.serverError ?? "errors.unexpected",
        ),
      );
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={tCommon("delete")}
          disabled={disabled}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete.description", { name: role.label })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              execute({ id: role.id });
            }}
          >
            {isPending ? <Spinner /> : null}
            {t("delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
