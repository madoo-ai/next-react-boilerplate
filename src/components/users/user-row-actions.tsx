"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { MoreHorizontal, Pencil, Trash2, UserCheck } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { deleteUserAction, verifyUserAction } from "@/lib/users/actions";

export function UserRowActions({
  user,
  canManage,
  canDelete,
}: {
  user: {
    id: string;
    name: string;
    status: "pending" | "active" | "suspended";
  };
  canManage: boolean;
  canDelete: boolean;
}) {
  const t = useTranslations("users");
  const tAll = useTranslations();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const translateError = (key: string | undefined) =>
    (tAll as unknown as (key: string) => string)(key ?? "errors.unexpected");

  const { execute: verify, isPending: isVerifying } = useAction(
    verifyUserAction,
    {
      onSuccess: () => {
        toast.success(t("messages.verified"));
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(translateError(error.serverError));
      },
    },
  );

  const { execute: remove, isPending: isDeleting } = useAction(
    deleteUserAction,
    {
      onSuccess: () => {
        setDeleteOpen(false);
        toast.success(t("messages.deleted"));
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(translateError(error.serverError));
      },
    },
  );

  if (!canManage) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={tAll("common.openMenu")}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Pencil />
                {t("actions.edit")}
              </Link>
            </DropdownMenuItem>
            {user.status === "pending" ? (
              <DropdownMenuItem
                onSelect={() => verify({ id: user.id })}
                disabled={isVerifying}
              >
                <UserCheck />
                {t("actions.verify")}
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 />
                {t("actions.delete")}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description", { name: user.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tAll("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                remove({ id: user.id });
              }}
            >
              {isDeleting ? <Spinner /> : null}
              {t("delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
