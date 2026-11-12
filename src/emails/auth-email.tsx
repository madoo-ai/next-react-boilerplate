import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { env } from "@/lib/env";

type AuthEmailLayoutProps = {
  preview: string;
  heading: string;
  body: string;
  action: string;
  url: string;
  footer: string;
};

function AuthEmailLayout({
  preview,
  heading,
  body,
  action,
  url,
  footer,
}: AuthEmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>{env.NEXT_PUBLIC_APP_NAME}</Text>
          <Heading style={styles.heading}>{heading}</Heading>
          <Text style={styles.text}>{body}</Text>
          <Section style={styles.actionSection}>
            <Button href={url} style={styles.button}>
              {action}
            </Button>
          </Section>
          <Text style={styles.fallback}>
            If the button does not work, copy this link into your browser:
            <br />
            <span style={styles.link}>{url}</span>
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export function VerifyEmailTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  return (
    <AuthEmailLayout
      preview="Verify your email address"
      heading={`Welcome, ${name}`}
      body="Confirm your email address to finish setting up your account."
      action="Verify email"
      url={url}
      footer="If you did not create this account, you can ignore this email."
    />
  );
}

export function ResetPasswordTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  return (
    <AuthEmailLayout
      preview="Reset your password"
      heading={`Reset your password, ${name}`}
      body="We received a request to reset your password. This link expires in one hour."
      action="Choose a new password"
      url={url}
      footer="If you did not request a reset, no action is needed."
    />
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: 0,
    padding: "40px 12px",
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e3e8ee",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "520px",
    padding: "32px",
  },
  brand: {
    color: "#533afd",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    margin: "0 0 24px",
    textTransform: "uppercase" as const,
  },
  heading: {
    color: "#0d253d",
    fontSize: "26px",
    fontWeight: 300,
    letterSpacing: "-0.26px",
    lineHeight: "1.2",
    margin: "0 0 12px",
  },
  text: {
    color: "#273951",
    fontSize: "15px",
    fontWeight: 300,
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  actionSection: {
    margin: "0 0 24px",
  },
  button: {
    backgroundColor: "#533afd",
    borderRadius: "9999px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 500,
    padding: "10px 20px",
    textDecoration: "none",
  },
  fallback: {
    color: "#64748d",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  link: {
    color: "#533afd",
    wordBreak: "break-all" as const,
  },
  hr: {
    borderColor: "#e3e8ee",
    margin: "0 0 16px",
  },
  footer: {
    color: "#64748d",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: 0,
  },
};
