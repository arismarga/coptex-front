import { NextResponse } from "next/server";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;
const CONTACT_FORM_ID = "233";
const CONTACT_FORM_LOCALE = "en_US";
const CONTACT_FORM_VERSION = "6.1.3";

export async function POST(request: Request) {
  if (!WP_BASE_URL) {
    return NextResponse.json(
      { message: "Missing NEXT_PUBLIC_WP_BASE_URL." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    productName?: string;
    customerName?: string;
    customerSurname?: string;
    email?: string;
    phone?: string;
    message?: string;
  };

  const formData = new FormData();
  formData.set("_wpcf7", CONTACT_FORM_ID);
  formData.set("_wpcf7_version", CONTACT_FORM_VERSION);
  formData.set("_wpcf7_locale", CONTACT_FORM_LOCALE);
  formData.set("_wpcf7_unit_tag", `wpcf7-f${CONTACT_FORM_ID}-p0-o1`);
  formData.set("_wpcf7_container_post", "0");
  formData.set("prod-name", body.productName?.trim() ?? "");
  formData.set("your-name", body.customerName?.trim() ?? "");
  formData.set("your-surname", body.customerSurname?.trim() ?? "");
  formData.set("your-email", body.email?.trim() ?? "");
  formData.set("your-phone", body.phone?.trim() ?? "");
  formData.set("your-message", body.message?.trim() ?? "");

  const response = await fetch(
    new URL(`/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`, WP_BASE_URL),
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.ok ? 200 : response.status,
  });
}
