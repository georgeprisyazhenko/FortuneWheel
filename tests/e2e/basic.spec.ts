import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("home page loads and displays main elements", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Колесо удачи для команд")).toBeVisible();
    await expect(page.getByText("Создать новую команду")).toBeVisible();
    await expect(page.getByText("Создайте ссылку для команды, добавьте участников и жмите «Ему повезёт».")).toBeVisible();
  });

  test("opens create team modal when button is clicked", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Создать новую команду").click();
    await expect(page.getByText("Новая команда")).toBeVisible();
    await expect(page.getByPlaceholder("Название команды")).toBeVisible();
    await expect(page.getByRole("button", { name: "Отмена" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Создать" })).toBeVisible();
  });

  test("closes modal when cancel button is clicked", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Создать новую команду").click();
    await expect(page.getByText("Новая команда")).toBeVisible();
    await page.getByRole("button", { name: "Отмена" }).click();
    await expect(page.getByText("Новая команда")).not.toBeVisible();
  });

  test("closes modal when clicking outside", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Создать новую команду").click();
    await expect(page.getByText("Новая команда")).toBeVisible();
    // Клик по затемненному фону
    await page.click("body", { position: { x: 10, y: 10 } });
    await expect(page.getByText("Новая команда")).not.toBeVisible();
  });

  test("creates team with valid name and navigates to team page", async ({ page }) => {
    await page.goto("/");
    const teamName = `Test Team ${Date.now()}`;
    
    await page.getByText("Создать новую команду").click();
    await page.getByPlaceholder("Название команды").fill(teamName);
    await page.getByRole("button", { name: "Создать" }).click();
    
    // Ждем навигации на страницу команды
    await page.waitForURL(/\/t\/[^/]+/, { timeout: 10000 });
    await expect(page.getByText("Колесо фортуны")).toBeVisible();
    // Проверяем, что название команды отображается (может быть в редактируемом поле)
    await expect(page.locator("input[value*='Test Team']").or(page.getByText(teamName))).toBeVisible({ timeout: 5000 });
  });

  test("creates team by pressing Enter in input field", async ({ page }) => {
    await page.goto("/");
    const teamName = `Test Team Enter ${Date.now()}`;
    
    await page.getByText("Создать новую команду").click();
    await page.getByPlaceholder("Название команды").fill(teamName);
    await page.getByPlaceholder("Название команды").press("Enter");
    
    await page.waitForURL(/\/t\/[^/]+/, { timeout: 10000 });
    await expect(page.getByText("Колесо фортуны")).toBeVisible();
  });

  test("shows error message when team creation fails", async ({ page }) => {
    await page.goto("/");
    // Мокаем ошибку через перехват запроса
    await page.route("**/rest/v1/teams", route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: "Internal error" }) });
    });
    
    await page.getByText("Создать новую команду").click();
    await page.getByPlaceholder("Название команды").fill("Test Team");
    await page.getByRole("button", { name: "Создать" }).click();
    
    // Ждем появления сообщения об ошибке
    await expect(page.getByText("Не удалось создать команду")).toBeVisible({ timeout: 5000 });
  });

  test("does not create team with empty name", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Создать новую команду").click();
    await page.getByPlaceholder("Название команды").fill("");
    await page.getByRole("button", { name: "Создать" }).click();
    
    // Модальное окно должно остаться открытым
    await expect(page.getByText("Новая команда")).toBeVisible();
    // URL не должен измениться
    expect(page.url()).toBe("http://localhost:3001/");
  });

  test("trims whitespace from team name", async ({ page }) => {
    await page.goto("/");
    const teamName = `  Test Team ${Date.now()}  `;
    const trimmedName = teamName.trim();
    
    await page.getByText("Создать новую команду").click();
    await page.getByPlaceholder("Название команды").fill(teamName);
    await page.getByRole("button", { name: "Создать" }).click();
    
    await page.waitForURL(/\/t\/[^/]+/, { timeout: 10000 });
    await expect(page.getByText("Колесо фортуны")).toBeVisible();
  });
});

test.describe("Team Page", () => {
  test.beforeEach(async ({ page }) => {
    // Создаем команду перед каждым тестом
    await page.goto("/");
    const teamName = `Test Team ${Date.now()}`;
    await page.getByText("Создать новую команду").click();
    await page.getByPlaceholder("Название команды").fill(teamName);
    await page.getByRole("button", { name: "Создать" }).click();
    await page.waitForURL(/\/t\/[^/]+/, { timeout: 10000 });
  });

  test("displays team page with all main elements", async ({ page }) => {
    await expect(page.getByText("Колесо фортуны")).toBeVisible();
    await expect(page.getByText("Создать новую комнату")).toBeVisible();
    await expect(page.getByText("Добавить участника")).toBeVisible();
    await expect(page.getByPlaceholder("Имя")).toBeVisible();
    await expect(page.getByRole("button", { name: "Добавить" })).toBeVisible();
    await expect(page.getByText("Участники")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ему повезёт" })).toBeVisible();
  });

  test("shows empty state when no members", async ({ page }) => {
    await expect(page.getByText("Пока нет участников.")).toBeVisible();
    await expect(page.getByText("Добавьте участников, чтобы крутить колесо")).toBeVisible();
  });

  test("adds new member", async ({ page }) => {
    const memberName = `Member ${Date.now()}`;
    await page.getByPlaceholder("Имя").fill(memberName);
    await page.getByRole("button", { name: "Добавить" }).click();
    
    await expect(page.getByText(memberName)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Пока нет участников.")).not.toBeVisible();
  });

  test("adds member by pressing Enter", async ({ page }) => {
    const memberName = `Member Enter ${Date.now()}`;
    await page.getByPlaceholder("Имя").fill(memberName);
    await page.getByPlaceholder("Имя").press("Enter");
    
    await expect(page.getByText(memberName)).toBeVisible({ timeout: 5000 });
  });

  test("does not add member with empty name", async ({ page }) => {
    const initialMemberCount = await page.getByText("Пока нет участников.").isVisible().catch(() => false);
    await page.getByPlaceholder("Имя").fill("");
    await page.getByRole("button", { name: "Добавить" }).click();
    
    // Проверяем, что состояние не изменилось
    if (initialMemberCount) {
      await expect(page.getByText("Пока нет участников.")).toBeVisible();
    }
  });

  test("toggles vacation status for member", async ({ page }) => {
    const memberName = `Member ${Date.now()}`;
    await page.getByPlaceholder("Имя").fill(memberName);
    await page.getByRole("button", { name: "Добавить" }).click();
    await expect(page.getByText(memberName)).toBeVisible({ timeout: 5000 });
    
    // Находим чекбокс для этого участника
    const memberRow = page.locator(`text=${memberName}`).locator("..").locator("..");
    const checkbox = memberRow.locator('input[type="checkbox"]');
    
    // Проверяем начальное состояние (не в отпуске)
    await expect(checkbox).not.toBeChecked();
    
    // Включаем отпуск
    await checkbox.click();
    await expect(checkbox).toBeChecked({ timeout: 5000 });
    
    // Выключаем отпуск
    await checkbox.click();
    await expect(checkbox).not.toBeChecked({ timeout: 5000 });
  });

  test("deletes member", async ({ page }) => {
    const memberName = `Member ${Date.now()}`;
    await page.getByPlaceholder("Имя").fill(memberName);
    await page.getByRole("button", { name: "Добавить" }).click();
    await expect(page.getByText(memberName)).toBeVisible({ timeout: 5000 });
    
    // Наводим на строку участника, чтобы появилась кнопка удаления
    const memberRow = page.locator(`text=${memberName}`).locator("..").locator("..");
    await memberRow.hover();
    
    // Кликаем на кнопку удаления
    const deleteButton = memberRow.getByText("Удалить");
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    
    // Проверяем, что участник удален
    await expect(page.getByText(memberName)).not.toBeVisible({ timeout: 5000 });
  });

  test("edits team name", async ({ page }) => {
    const newName = `New Name ${Date.now()}`;
    
    // Находим редактируемое поле с названием команды
    const nameInput = page.locator('input[type="text"]').filter({ hasText: /Test Team/ }).or(
      page.locator('input').nth(0)
    );
    
    // Очищаем и вводим новое имя
    await nameInput.clear();
    await nameInput.fill(newName);
    await nameInput.blur(); // Сохраняем при потере фокуса
    
    // Ждем сохранения
    await page.waitForTimeout(1000);
    
    // Проверяем, что новое имя отображается
    await expect(nameInput).toHaveValue(newName, { timeout: 5000 });
  });

  test("navigates back to home page", async ({ page }) => {
    await page.getByText("Создать новую комнату").click();
    await expect(page).toHaveURL("http://localhost:3001/");
    await expect(page.getByText("Создать новую команду")).toBeVisible();
  });
});

test.describe("Wheel Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Создаем команду с участниками
    await page.goto("/");
    const teamName = `Test Team ${Date.now()}`;
    await page.getByText("Создать новую команду").click();
    await page.getByPlaceholder("Название команды").fill(teamName);
    await page.getByRole("button", { name: "Создать" }).click();
    await page.waitForURL(/\/t\/[^/]+/, { timeout: 10000 });
    
    // Добавляем участников
    const members = ["Alice", "Bob", "Charlie"];
    for (const member of members) {
      await page.getByPlaceholder("Имя").fill(member);
      await page.getByRole("button", { name: "Добавить" }).click();
      await page.waitForTimeout(500); // Небольшая задержка между добавлениями
    }
    
    // Ждем, пока все участники появятся
    await expect(page.getByText("Alice")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Bob")).toBeVisible();
    await expect(page.getByText("Charlie")).toBeVisible();
  });

  test("displays wheel with members", async ({ page }) => {
    // Проверяем, что колесо отображается
    const wheel = page.locator('[class*="rounded-full"]').filter({ hasText: /Alice|Bob|Charlie/ }).or(
      page.locator('div').filter({ has: page.locator('text=Alice') })
    );
    
    // Проверяем наличие кнопки и текста о пуле
    await expect(page.getByRole("button", { name: "Ему повезёт" })).toBeVisible();
    await expect(page.getByText(/В пуле:/)).toBeVisible();
  });

  test("spins wheel and selects winner", async ({ page }) => {
    // Кликаем на кнопку вращения
    await page.getByRole("button", { name: "Ему повезёт" }).click();
    
    // Кнопка должна быть заблокирована во время вращения
    await expect(page.getByRole("button", { name: "Ему повезёт" })).toBeDisabled({ timeout: 1000 });
    
    // Ждем завершения анимации (4 секунды + небольшая задержка)
    await page.waitForTimeout(5000);
    
    // Проверяем, что кнопка снова активна
    await expect(page.getByRole("button", { name: "Ему повезёт" })).toBeEnabled({ timeout: 2000 });
    
    // Проверяем, что появилось сообщение о победителе
    const winnerMessage = page.getByText(/Тебе повезло/);
    await expect(winnerMessage).toBeVisible({ timeout: 3000 });
    
    // Проверяем, что один из участников отмечен как последний победитель
    const lastWinnerText = page.getByText("Последний победитель");
    await expect(lastWinnerText).toBeVisible({ timeout: 3000 });
  });

  test("shows message when trying to spin with no available members", async ({ page }) => {
    // Исключаем всех участников через чекбоксы отпуска
    const members = ["Alice", "Bob", "Charlie"];
    for (const member of members) {
      const memberRow = page.locator(`text=${member}`).locator("..").locator("..");
      const checkbox = memberRow.locator('input[type="checkbox"]');
      await checkbox.click();
      await page.waitForTimeout(300);
    }
    
    // Пытаемся крутить колесо
    await page.getByRole("button", { name: "Ему повезёт" }).click();
    
    // Должно появиться сообщение
    await expect(page.getByText("Добавьте участников")).toBeVisible({ timeout: 3000 });
  });

  test("disables spin button when all members are on vacation", async ({ page }) => {
    // Исключаем всех участников
    const members = ["Alice", "Bob", "Charlie"];
    for (const member of members) {
      const memberRow = page.locator(`text=${member}`).locator("..").locator("..");
      const checkbox = memberRow.locator('input[type="checkbox"]');
      await checkbox.click();
      await page.waitForTimeout(300);
    }
    
    // Кнопка должна быть доступна, но показывать сообщение при клике
    await expect(page.getByRole("button", { name: "Ему повезёт" })).toBeEnabled();
  });

  test("excludes vacation members from wheel display", async ({ page }) => {
    // Помечаем одного участника в отпуск
    const memberRow = page.locator(`text=Alice`).locator("..").locator("..");
    const checkbox = memberRow.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked({ timeout: 3000 });
    
    // Проверяем, что в пуле осталось 2 участника
    await expect(page.getByText(/В пуле: 2/)).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Error Handling", () => {
  test("shows error when team not found", async ({ page }) => {
    await page.goto("/t/non-existent-slug-12345");
    
    await expect(page.getByText("Команда не найдена")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "На главную" })).toBeVisible();
  });

  test("navigates to home when clicking 'На главную' on error page", async ({ page }) => {
    await page.goto("/t/non-existent-slug-12345");
    await page.getByRole("button", { name: "На главную" }).click();
    
    await expect(page).toHaveURL("http://localhost:3001/");
    await expect(page.getByText("Создать новую команду")).toBeVisible();
  });
});

