"use client";

import Link from "next/link";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { deleteAccountAction } from "@/lib/settings/actions";

export function DeleteAccountCard({
  canDelete,
  confirmed,
}: {
  canDelete: boolean;
  confirmed: boolean;
}) {
  const t = useTranslations("settings.danger");
  const tCommon = useTranslations("common");
  const tAll = useTranslations();
  const router = useRouter();

  const { execute, isPending } = useAction(deleteAccountAction, {
    onSuccess: async () => {
      toast.success(t("deleted"));

      try {
        await authClient.signOut();
      } catch {
        // The user row is already gone; the cookie is cleared on the next
        // request if sign-out fails.
      }

      router.push("/login?deleted=1");
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
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!canDelete ? (
          <p className="text-sm text-muted-foreground">
            {(tAll as unknown as (key: string) => string)(
              "errors.lastSuperadmin",
            )}
          </p>
        ) : !confirmed ? (
          <Button asChild variant="outline">
            <Link href="/confirm-password?next=/settings/profile">
              {t("confirmPassword")}
            </Link>
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 data-icon="inline-start" />
                {t("delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("confirmDescription")}
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
                    execute();
                  }}
                >
                  {isPending ? <Spinner /> : null}
                  {t("confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
