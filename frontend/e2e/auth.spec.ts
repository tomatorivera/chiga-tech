import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "chiga1234";

async function login(page: Page, nombreUsuario: string) {
  await page.goto("/login");
  await page.getByLabel("Usuario").fill(nombreUsuario);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  const response = page.waitForResponse((r) => r.url().endsWith("/auth/login"));
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  return response;
}

test("login válido crea la cookie de sesión y redirige a /inicio", async ({ page, context }) => {
  const response = await login(page, "vendedor");

  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/inicio$/);
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "chiga_auth")?.httpOnly).toBe(true);
});

test("la sesión sobrevive a la recarga y a la navegación directa", async ({ page }) => {
  await login(page, "vendedor");
  await expect(page).toHaveURL(/\/inicio$/);

  const isMe = (r: { url(): string }) => r.url().endsWith("/auth/me");

  const reloaded = page.waitForResponse(isMe);
  await page.reload();
  expect((await reloaded).status()).toBe(200);
  await expect(page).toHaveURL(/\/inicio$/);

  const direct = page.waitForResponse(isMe);
  await page.goto("/inicio");
  expect((await direct).status()).toBe(200);
  await expect(page).toHaveURL(/\/inicio$/);
});

test("una cookie de una sesión cerrada es rechazada", async ({ page, context }) => {
  await login(page, "vendedor");
  await expect(page).toHaveURL(/\/inicio$/);
  const cookies = await context.cookies();
  const guardada = cookies.find((c) => c.name === "chiga_auth")!;

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await context.addCookies([guardada]);
  const me = page.waitForResponse((r) => r.url().endsWith("/auth/me"));
  await page.goto("/inicio");
  expect((await me).status()).toBe(401);
  await expect(page).toHaveURL(/\/login$/);
});

test("un usuario inactivo no puede iniciar sesión", async ({ page, context }) => {
  const response = await login(page, "inactivo");

  expect(response.status()).toBe(401);
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  const cookies = await context.cookies();
  expect(cookies.some((c) => c.name === "chiga_auth")).toBe(false);
});
