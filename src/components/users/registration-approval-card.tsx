"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import {
  CheckCircleIcon as CheckCircle2,
  Shield01Icon as ShieldAlert,
} from "@x1nx3r/altics-react-icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { setRegistrationApprovalAction } from "@/lib/users/actions";

export function RegistrationApprovalCard({ enabled }: { enabled: boolean }) {
  const t = useTranslations("users.approval");
  const tMessages = useTranslations("users.messages");
  const tAll = useTranslations();
  const router = useRouter();
  const [value, setValue] = useState(enabled);

  const { execute, isPending } = useAction(setRegistrationApprovalAction, {
    onSuccess: () => {
      toast.success(tMessages("approvalUpdated"));
      router.refresh();
    },
    onError: ({ error }) => {
      setValue(enabled);
      toast.error(
        (tAll as unknown as (key: string) => string)(
          error.serverError ?? "errors.unexpected",
        ),
      );
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {value ? <ShieldAlert /> : <CheckCircle2 />}
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Field orientation="horizontal">
          <Switch
            id="registration-approval"
            checked={value}
            disabled={isPending}
            onCheckedChange={(checked) => {
              setValue(checked);
              execute({ enabled: checked });
            }}
          />
          <FieldContent>
            <FieldLabel htmlFor="registration-approval">
              {t("toggle")}
            </FieldLabel>
            <p className="text-sm text-muted-foreground">
              {value ? t("enabled") : t("disabled")}
            </p>
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  );
}
