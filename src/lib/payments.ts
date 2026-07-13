export type PaymentProvider = "mercadopago" | "stripe";

export function hasMercadoPago() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim());
}

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** MP primero en Argentina si hay token; si no, Stripe. */
export function getPaymentProvider(): PaymentProvider | null {
  const forced = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (forced === "mercadopago" && hasMercadoPago()) return "mercadopago";
  if (forced === "stripe" && hasStripe()) return "stripe";
  if (hasMercadoPago()) return "mercadopago";
  if (hasStripe()) return "stripe";
  return null;
}

export function paymentProviderLabel(provider: PaymentProvider | "bank_transfer") {
  if (provider === "bank_transfer") return "Transferencia bancaria";
  return provider === "mercadopago" ? "Mercado Pago" : "tarjeta (Stripe)";
}
