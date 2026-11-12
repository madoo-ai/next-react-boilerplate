"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";
import QRCode from "react-qr-code";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";

type EnableStep = "password" | "verify";

export function SecuritySettings({
  twoFactorEnabled,
}: {
  twoFactorEnabled: boolean;
}) {
  const t = useTranslations("settings.security");
  const tCommon = useTranslations("common");
  const tAll = useTranslations();
  const router = useRouter();
  const [enableOpen, setEnableOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [step, setStep] = useState<EnableStep>("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const translate = tAll as unknown as (key: string) => string;

  function resetEnable() {
    setStep("password");
    setPassword("");
    setCode("");
    setTotpURI("");
    setBackupCodes([]);
    setError(null);
  }

  function handleEnableOpenChange(open: boolean) {
    setEnableOpen(open);
    if (!open) resetEnable();
  }

  async function startEnable() {
    setError(null);
    setPending(true);

    const result = await authClient.twoFactor.enable({ password });

    setPending(false);

    if (result.error) {
      setError(
        result.error.message?.toLowerCase().includes("password")
          ? t("invalidPassword")
          : (result.error.message ?? translate("errors.unexpected")),
      );
      return;
    }

    if (result.data?.method === "totp") {
      setTotpURI(result.data.totpURI);
      setBackupCodes(result.data.backupCodes);
      setStep("verify");
    } else if (result.data) {
      setError(translate("errors.unexpected"));
    }
  }

  async function verifyEnable() {
    setError(null);
    setPending(true);

    const result = await authClient.twoFactor.verifyTotp({ code });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? translate("errors.invalidCode"));
      return;
    }

    toast.success(t("enabledMessage"));
    setEnableOpen(false);
    resetEnable();
    router.refresh();
  }

  async function disableTwoFactor() {
    setError(null);
    setPending(true);

    const result = await authClient.twoFactor.disable({ password });

    setPending(false);

    if (result.error) {
      setError(
        result.error.message?.toLowerCase().includes("password")
          ? t("invalidPassword")
          : (result.error.message ?? translate("errors.unexpected")),
      );
      return;
    }

    toast.success(t("disabledMessage"));
    setDisableOpen(false);
    setPassword("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {twoFactorEnabled ? (
              <ShieldCheck className="text-primary" />
            ) : (
              <ShieldOff className="text-muted-foreground" />
            )}
            <div className="flex flex-col gap-1">
              <span className="font-medium">{t("twoFactor")}</span>
              <Badge
                variant={twoFactorEnabled ? "default" : "secondary"}
                className="w-fit"
              >
                {twoFactorEnabled ? t("enabled") : t("disabled")}
              </Badge>
            </div>
          </div>
          {twoFactorEnabled ? (
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setPassword("");
                setDisableOpen(true);
              }}
            >
              <ShieldOff data-icon="inline-start" />
              {t("disable")}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setError(null);
                setEnableOpen(true);
              }}
            >
              <KeyRound data-icon="inline-start" />
              {t("enable")}
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog open={enableOpen} onOpenChange={handleEnableOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("enable")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {step === "password" ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void startEnable();
              }}
            >
              <FormAlert message={error} />
              <Field>
                <FieldLabel htmlFor="enable-password">
                  {t("password")}
                </FieldLabel>
                <PasswordInput
                  id="enable-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleEnableOpenChange(false)}
                  disabled={pending}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={!password || pending}>
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  {t("enable")}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void verifyEnable();
              }}
            >
              <FormAlert message={error} />
              <div className="flex flex-col items-center gap-3 rounded-lg border bg-white p-4">
                {totpURI ? <QRCode value={totpURI} size={168} /> : null}
              </div>
              <p className="text-sm text-muted-foreground">{t("scan")}</p>
              <div className="rounded-lg bg-muted p-3">
                <p className="mb-2 text-sm font-medium">{t("backupCodes")}</p>
                <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                  {backupCodes.map((backupCode) => (
                    <span key={backupCode}>{backupCode}</span>
                  ))}
                </div>
              </div>
              <Field>
                <FieldLabel htmlFor="totp-code">{t("code")}</FieldLabel>
                <InputOTP
                  id="totp-code"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={code}
                  onChange={setCode}
                  autoFocus
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription>{t("verify")}</FieldDescription>
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleEnableOpenChange(false)}
                  disabled={pending}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={code.length !== 6 || pending}>
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  {t("verify")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("disable")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void disableTwoFactor();
            }}
          >
            <FormAlert message={error} />
            <Field>
              <FieldLabel htmlFor="disable-password">
                {t("password")}
              </FieldLabel>
              <PasswordInput
                id="disable-password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDisableOpen(false)}
                disabled={pending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={!password || pending}>
                {pending ? <Spinner data-icon="inline-start" /> : null}
                {t("disable")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
