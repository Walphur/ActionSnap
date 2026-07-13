export type CheckoutMethod = "mercadopago" | "mercadopago_qr" | "bank_transfer";

export type EventPaymentOptions = {
  mercadopago: boolean;
  mercadopagoQr: boolean;
  bankTransfer: boolean;
};

export function hasAnyPaymentOption(options: EventPaymentOptions) {
  return options.mercadopago || options.mercadopagoQr || options.bankTransfer;
}

export function checkoutMethodLabel(method: CheckoutMethod) {
  switch (method) {
    case "mercadopago_qr":
      return "QR Mercado Pago";
    case "bank_transfer":
      return "Transferencia bancaria";
    default:
      return "Mercado Pago";
  }
}

export function photographerHasBankDetails(profile: {
  bank_cbu?: string | null;
  bank_alias?: string | null;
  accepts_bank_transfer?: boolean | null;
}) {
  if (!profile.accepts_bank_transfer) return false;
  const cbu = profile.bank_cbu?.trim();
  const alias = profile.bank_alias?.trim();
  return Boolean(cbu || alias);
}

export function buildEventPaymentOptions(params: {
  mpConnected: boolean;
  bankConfigured: boolean;
  platformHasMp: boolean;
}): EventPaymentOptions {
  const mp = params.platformHasMp && params.mpConnected;
  return {
    mercadopago: mp,
    mercadopagoQr: mp,
    bankTransfer: params.bankConfigured,
  };
}

export function shortTransferReference(purchaseId: string) {
  return purchaseId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
