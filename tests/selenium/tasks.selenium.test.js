const { Select, Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { spawn } = require("child_process");

let driver;
let server;

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;
const DEFAULT_TIMEOUT = 3000;
const DEFAULT_IMPLICIT_WAIT = 250;

jest.setTimeout(30000);

beforeAll(async () => {
  server = spawn("node", ["src/app.js"], {
    env: { ...process.env, PORT: PORT },
    stdio: "inherit",
  });

  await new Promise(r => setTimeout(r, 10000));

  const options = new chrome.Options();
  //options.addArguments("--headless");
  options.addArguments("--no-sandbox");

  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: DEFAULT_TIMEOUT });
});

afterAll(async () => {
  if (driver) await driver.quit();
  if (server) server.kill();
});

beforeEach(async () => {
  await fetch(BASE_URL + "/api/clear", { method: "DELETE" });
  await driver.get(BASE_URL);
  await driver.sleep(100);
});

/* Helpers */
async function createTask(title, desc = "", priority = "medium") {
  await driver.findElement(By.id("title")).sendKeys(title);
  await driver.findElement(By.id("description")).sendKeys(desc);
  await driver.findElement(By.id("priority")).sendKeys(priority);
  await driver.findElement(By.id("submitBtn")).click();
  await driver.sleep(100);
}

async function getTasks() {
  return await driver.findElements(By.css(".task-card"));
}

async function openModalEdit() {
  await driver.findElement(By.css(".action-btn.edit")).click();
  let modal = await driver.findElement(By.id("modalOverlay"));
  await driver.wait(until.elementIsVisible(modal), DEFAULT_IMPLICIT_WAIT);
}

async function saveModalEdit() {
  let modal = await driver.findElement(By.id("modalOverlay"));
  await driver.findElement(By.css("#editForm button[type='submit']")).click();
  await driver.wait(until.elementIsNotVisible(modal), DEFAULT_IMPLICIT_WAIT);
}

/* TESTS */

describe("TaskFlow - Tests E2E", () => {

  test("1. Page loads", async () => {
    const title = await driver.getTitle();
    expect(title).toContain("TaskFlow");
  });

  test("2. Create task", async () => {
    await createTask("Task 1", "Desc");
    const tasks = await getTasks();
    expect(tasks.length).toBe(1);
  });

  test("3. Multiple tasks", async () => {
    await createTask("A");
    await createTask("B");
    const tasks = await getTasks();
    expect(tasks.length).toBe(2);
  });

  test("4. Required title", async () => {
    await driver.findElement(By.id("submitBtn")).click();
    const tasks = await getTasks();
    expect(tasks.length).toBe(0);
  });

  test("5. Task visible", async () => {
    await createTask("Visible");
    const tasks = await getTasks();
    const text = await tasks[0].getText();
    expect(text).toContain("Visible");
  });

  test("6. Stats increment", async () => {
    let total = await driver.findElement(By.id("totalTasks"));
    let totalText = await total.getText();
    expect(totalText).toBe("0");

    await createTask("Stats");
    await driver.sleep(100);

    totalText = await total.getText();
    expect(totalText).toBe("1");
  });

  test("7. Filter pending", async () => {
    await createTask("Pending");
    await driver.findElement(By.css('[data-filter="pending"]')).click();
    const tasks = await getTasks();
    expect(tasks.length).toBe(1);
  });

  test("8. Filter completed empty", async () => {
    await createTask("X");
    await driver.findElement(By.css('[data-filter="completed"]')).click();
    const tasks = await getTasks();
    expect(tasks.length).toBe(0);
  });

  test("9. Edit modal opens", async () => {
    await createTask("Edit");
    await openModalEdit();

    let modal = await driver.findElement(By.id("modalOverlay"));
    expect(await modal.isDisplayed()).toBe(true);
  });

  test("10. Cancel modal", async () => {
    await createTask("Close");
    await openModalEdit();

    let modal = await driver.findElement(By.id("modalOverlay"));
    await driver.findElement(By.id("modalClose")).click();
    await driver.wait(until.elementIsNotVisible(modal), DEFAULT_IMPLICIT_WAIT);

    expect(await modal.isDisplayed()).toBe(false);
  });

  test("11. Update title", async () => {
    await createTask("Old");

    await openModalEdit();

    const input = await driver.findElement(By.id("editTitle"));
    await input.clear();
    await input.sendKeys("New");

    await saveModalEdit();

    const tasks = await getTasks();
    const text = await tasks[0].getText();
    expect(text).toContain("New");
  });

  test("12. Change status completed", async () => {
    await createTask("Done");
    await openModalEdit();

    const statusSelect = await driver.findElement(By.id('editStatus'));
    const select = new Select(statusSelect);
    await select.selectByValue('completed')

    await saveModalEdit();

    const completed = await (driver.findElement(By.id("completedTasks")));
    const completedtext = await completed.getText();
    expect(completedtext).toBe("1");
  });

  test("13. Filter completed", async () => {
    await createTask("Done");
    await openModalEdit();

    const statusSelect = await driver.findElement(By.id('editStatus'));
    const select = new Select(statusSelect);
    await select.selectByValue('completed')

    await saveModalEdit();

    await driver.findElement(By.css('[data-filter="completed"]')).click();
    const tasks = await getTasks();
    expect(tasks.length).toBe(1);
  });

  test("14. Delete task", async () => {
    await createTask("Delete");
    await driver.findElement(By.css(".action-btn.delete")).click();

    let alert = await driver.switchTo().alert();
    let alertText = await alert.getText();
    await alert.accept();

    const tasks = await getTasks();
    expect(tasks.length).toBe(0);
  });

  test("15. Empty state visible", async () => {
    const empty = await driver.findElement(By.className("empty-state"));
    expect(await empty.isDisplayed()).toBe(true);
  });

  test("16. Empty state hidden after create", async () => {
    await createTask("Hide");
    const empty = await driver.findElements(By.className("empty-state"));
    expect(empty.length).toBe(0);
  });

  test("17. Priority shown", async () => {
    await createTask("High", "x", "high");
    const tasks = await getTasks();
    const text = await tasks[0].getText();
    expect(text).toContain("High");
  });

  test("18. Refresh persists", async () => {
    await createTask("Persist");
    await driver.navigate().refresh();
    const tasks = await getTasks();
    expect(tasks.length).toBe(1);
  });

  test("19. Cancel edit", async () => {
    await createTask("Cancel");
    await openModalEdit();

    let modal = await driver.findElement(By.id("modalOverlay"));
    await driver.findElement(By.id("cancelEdit")).click();
    await driver.wait(until.elementIsNotVisible(modal), DEFAULT_IMPLICIT_WAIT);

    expect(await modal.isDisplayed()).toBe(false);
  });

  test("20. API sync", async () => {
    await fetch(BASE_URL + "/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "API", description: "x" })
    });

    await driver.navigate().refresh();
    const tasks = await getTasks();
    expect(tasks.length).toBe(1);
  });

});
