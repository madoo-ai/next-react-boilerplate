"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/auth-client";

export function TwoFactorForm() {
  const t = useTranslations("auth.twoFactor");
  const tFields = useTranslations("auth.fields");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"totp" | "backup" | null>(null);

  function complete() {
    router.push("/");
    router.refresh();
  }

  async function verifyTotp() {
    setError(null);
    setPending("totp");

    const result = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice: true,
    });

    if (result.error) {
      setError(result.error.message ?? tErrors("invalidCode"));
      setPending(null);
      return;
    }

    complete();
  }

  async function verifyBackupCode() {
    setError(null);
    setPending("backup");

    const result = await authClient.twoFactor.verifyBackupCode({
      code: backupCode,
      trustDevice: true,
    });

    if (result.error) {
      setError(result.error.message ?? tErrors("invalidCode"));
      setPending(null);
      return;
    }

    complete();
  }

  return (
    <div className="flex flex-col gap-4">
      <FormAlert message={error} />
      <Tabs defaultValue="totp">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="totp">{t("totpTab")}</TabsTrigger>
          <TabsTrigger value="backup">{t("backupTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="totp">
          <form
            className="pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              void verifyTotp();
            }}
          >
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="totp-code">{tFields("code")}</FieldLabel>
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
              </Field>
              <Button
                type="submit"
                className="w-full"
                disabled={code.length !== 6 || pending !== null}
              >
                {pending === "totp" ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <ShieldCheck data-icon="inline-start" />
                )}
                {t("submit")}
              </Button>
            </FieldGroup>
          </form>
        </TabsContent>
        <TabsContent value="backup">
          <form
            className="pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              void verifyBackupCode();
            }}
          >
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="backup-code">
                  {t("backupTitle")}
                </FieldLabel>
                <Input
                  id="backup-code"
                  autoComplete="one-time-code"
                  value={backupCode}
                  onChange={(event) => setBackupCode(event.target.value)}
                  autoFocus
                />
                <FieldDescription>{t("backupDescription")}</FieldDescription>
              </Field>
              <Button
                type="submit"
                className="w-full"
                disabled={backupCode.length === 0 || pending !== null}
              >
                {pending === "backup" ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <KeyRound data-icon="inline-start" />
                )}
                {t("backupSubmit")}
              </Button>
            </FieldGroup>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
