const path = require("node:path");
process.env.NODE_PATH = "C:/Users/dabin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/node_modules";
require("node:module").Module._initPaths();
const { chromium } = require("C:/Users/dabin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.0/node_modules/playwright");

(async () => {
  const file = "file:///" + path.resolve("outputs/lyra-app/index.html").replace(/\\/g, "/");
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(file);
  await page.getByRole("button", { name: "Send OTP" }).click();
  const helper = await page.locator(".helper").first().textContent();
  const otp = helper.match(/\d{6}/)?.[0];
  if (!otp) throw new Error("OTP was not generated");
  await page.locator('input[name="otp"]').fill(otp);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("heading", { name: "Community Feed" }).waitFor();

  await page.locator('input[name="title"]').fill("Smoke test portfolio post");
  await page.locator('textarea[name="body"]').fill("A verified test post from the smoke workflow.");
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByText("Smoke test portfolio post").waitFor();

  await page.getByRole("button", { name: "Communities" }).click();
  await page.getByRole("button", { name: "Join" }).first().click();
  await page.getByRole("button", { name: "Join" }).first().click();
  const limitToast = await page.locator("#toast").textContent();
  if (!/maximum of 3/.test(limitToast)) throw new Error("Three-community limit did not trigger");

  await page.getByRole("button", { name: "Competitions" }).click();
  await page.getByRole("button", { name: "Join" }).first().click();
  await page.getByText("Joined").first().waitFor();

  await page.getByRole("button", { name: "Community Feed" }).click();
  await page.getByRole("button", { name: "Photography" }).click();
  await page.getByRole("button", { name: "Report" }).first().click();
  await page.getByRole("button", { name: "Security" }).click();
  await page.getByText("Reported posts").waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "work/lyra-mobile-smoke.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.screenshot({ path: "work/lyra-desktop-smoke.png", fullPage: true });

  await browser.close();
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Lyra smoke test passed");
})();
