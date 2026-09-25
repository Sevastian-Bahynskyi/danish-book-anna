// Public account endpoint (no JWT): registration with phone + password, and
// password reset with a code that Anna generated in the admin panel.
//
// POST { action: "register", phone, password, name? }
// POST { action: "reset", phone, code, password }
// POST { action: "check", phone }   -> { status: "first" | "allowed" | "exists" | "not_allowed" }
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const secretKey = (() => {
  try {
    return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default;
  } catch {
    return undefined;
  }
})() ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Same rules as private.normalize_phone: 8 digits means a Danish number.
export function normalizePhone(raw: string): string {
  const s = String(raw ?? "").replace(/[^0-9+]/g, "");
  if (s.startsWith("+")) return "+" + s.slice(1).replace(/\+/g, "");
  // 8 digits is a Danish number, even one that starts with 00 (the test account).
  if (s.length === 8) return "+45" + s;
  if (s.startsWith("00")) return "+" + s.slice(2);
  return "+" + s;
}
const validPhone = (p: string) => /^\+[0-9]{8,15}$/.test(p);
export const phoneEmail = (p: string) => `p${p.slice(1)}@phone.dansk-paa-arbejde.app`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const phone = normalizePhone(body.phone);
  if (!validPhone(phone)) return json({ error: "bad_phone" }, 400);

  if (body.action === "check") {
    const { data, error } = await admin.rpc("can_register", { phone });
    if (error) return json({ error: "server" }, 500);
    return json({ status: data });
  }

  const password = String(body.password ?? "");
  if (password.length < 8) return json({ error: "weak_password" }, 400);

  if (body.action === "register") {
    const { data: status, error: checkError } = await admin.rpc("can_register", { phone });
    if (checkError) return json({ error: "server" }, 500);
    if (status === "exists") return json({ error: "exists" }, 409);
    if (status === "not_allowed") return json({ error: "phone_not_allowed" }, 403);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: phoneEmail(phone),
      password,
      email_confirm: true,
      user_metadata: { phone },
    });
    if (createError || !created.user) {
      return json({ error: /already/i.test(createError?.message ?? "") ? "exists" : "server" }, createError ? 409 : 500);
    }
    const { data: role, error: profileError } = await admin.rpc("register_profile", {
      uid: created.user.id,
      phone,
      display_name: String(body.name ?? "").slice(0, 80),
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: /phone_not_allowed/.test(profileError.message) ? "phone_not_allowed" : "server" }, 403);
    }
    return json({ ok: true, role, email: phoneEmail(phone) });
  }

  if (body.action === "reset") {
    const code = String(body.code ?? "").replace(/\D/g, "");
    if (code.length !== 6) return json({ error: "bad_code" }, 400);
    const { data: uid, error } = await admin.rpc("consume_reset_code", { phone, code });
    if (error) return json({ error: "server" }, 500);
    if (!uid) return json({ error: "bad_code" }, 400);
    const { error: updateError } = await admin.auth.admin.updateUserById(uid, { password });
    if (updateError) return json({ error: "server" }, 500);
    return json({ ok: true, email: phoneEmail(phone) });
  }

  return json({ error: "bad_action" }, 400);
});
