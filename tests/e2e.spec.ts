import { test, expect, type Page } from '@playwright/test'

const BASE_URL = 'http://localhost:5174'
const API_URL = 'http://localhost:8001'
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'admin123'

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[name="username"]', ADMIN_USER)
  await page.fill('input[name="password"]', ADMIN_PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/projects', { timeout: 10000 })
}

// ─── Auth ────────────────────────────────────────────────────────

test.describe('Authentification', () => {
  test('page login affiche le formulaire', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await expect(page.getByRole('heading', { name: 'Le Laboratoire' })).toBeVisible()
    await expect(page.getByText('Connexion')).toBeVisible()
  })

  test('login mauvais identifiants', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="username"]', 'wrong')
    await page.fill('input[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Identifiants incorrects')).toBeVisible({ timeout: 5000 })
  })

  test('login admin redirige vers /projects', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/projects/)
    await expect(page.getByRole('heading', { name: 'Projets' })).toBeVisible()
  })

  test('route protegee redirige vers login', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`)
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─── Projets ─────────────────────────────────────────────────────

test.describe('Projets', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('dashboard projets charge', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projets' })).toBeVisible({ timeout: 5000 })
  })

  test('creer un projet', async ({ page }) => {
    await page.getByRole('button', { name: /Nouveau projet/ }).click()

    // Remplir le formulaire dans le modal
    await page.getByLabel(/Nom/).fill('Insertion Pro 2026')
    await page.getByLabel(/Description/).fill('Programme insertion pro')
    await page.getByRole('button', { name: /Créer|Enregistrer/ }).click()

    // Le projet apparaît dans la liste
    await expect(page.getByText('Insertion Pro 2026')).toBeVisible({ timeout: 5000 })
  })

  test('naviguer vers un projet affiche le kanban', async ({ page }) => {
    // Cliquer sur le premier projet
    const card = page.locator('button[class*="rounded-xl"]').first()
    await expect(card).toBeVisible({ timeout: 5000 })
    await card.click()

    // Vérifier les colonnes par défaut (dans la zone kanban, pas dans les modals)
    await expect(page.getByRole('main').getByText('À faire', { exact: true }).first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('main').getByText('En cours', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('main').getByText('Terminé', { exact: true }).first()).toBeVisible()
  })
})

// ─── Kanban ──────────────────────────────────────────────────────

test.describe('Kanban', () => {
  let projectId: number

  test.beforeAll(async ({ request }) => {
    // Créer un projet via l'API pour les tests kanban
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { username: ADMIN_USER, password: ADMIN_PASS },
    })
    const token = (await loginRes.json()).access_token
    const res = await request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Kanban Test Project' },
    })
    projectId = (await res.json()).id
  })

  test.afterAll(async ({ request }) => {
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { username: ADMIN_USER, password: ADMIN_PASS },
    })
    const token = (await loginRes.json()).access_token
    await request.delete(`${API_URL}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  })

  test('bouton gerer colonnes ouvre modal', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/projects/${projectId}`)
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: /colonnes/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  })

  test('bouton gerer tags ouvre modal', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/projects/${projectId}`)
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: /tags/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  })
})

// ─── Administration ──────────────────────────────────────────────

test.describe('Administration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('page admin affiche table utilisateurs', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`)
    await expect(page.getByRole('main').getByRole('heading', { name: 'Administration' })).toBeVisible({ timeout: 5000 })
    // Vérifier que la table contient l'admin
    await expect(page.getByRole('cell', { name: 'admin@lelaboratoire.ch' })).toBeVisible()
  })
})

// ─── API directe ─────────────────────────────────────────────────

test.describe('API directe', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: { username: ADMIN_USER, password: ADMIN_PASS },
    })
    expect(res.ok()).toBeTruthy()
    token = (await res.json()).access_token
  })

  test('GET /auth/me', async ({ request }) => {
    const res = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok()).toBeTruthy()
    const user = await res.json()
    expect(user.username).toBe('admin')
    expect(user.is_admin).toBe(true)
  })

  test('CRUD projet complet', async ({ request }) => {
    const h = { Authorization: `Bearer ${token}` }

    // Create
    const c = await request.post(`${API_URL}/projects`, { headers: h, data: { name: 'API Test', description: 'desc' } })
    expect(c.status()).toBe(201)
    const p = await c.json()
    const pid = p.id

    // Read
    expect((await request.get(`${API_URL}/projects/${pid}`, { headers: h })).ok()).toBeTruthy()

    // Colonnes auto-créées
    const cols = await (await request.get(`${API_URL}/projects/${pid}/columns`, { headers: h })).json()
    expect(cols.length).toBe(3)
    expect(cols[0].color).toBeTruthy()

    // Update
    const u = await request.patch(`${API_URL}/projects/${pid}`, { headers: h, data: { name: 'Updated' } })
    expect((await u.json()).name).toBe('Updated')

    // Delete
    expect((await request.delete(`${API_URL}/projects/${pid}`, { headers: h })).status()).toBe(204)
  })

  test('CRUD objectif + tache + tag + commentaire', async ({ request }) => {
    const h = { Authorization: `Bearer ${token}` }

    // Setup: projet
    const p = await (await request.post(`${API_URL}/projects`, { headers: h, data: { name: 'Flow Test' } })).json()
    const pid = p.id
    const cols = await (await request.get(`${API_URL}/projects/${pid}/columns`, { headers: h })).json()

    // Objectif
    const obj = await (await request.post(`${API_URL}/projects/${pid}/objectives`, { headers: h, data: { name: 'Obj 1' } })).json()
    expect(obj.name).toBe('Obj 1')

    // Tâche
    const task = await (await request.post(`${API_URL}/objectives/${obj.id}/tasks`, { headers: h, data: { title: 'Tache 1', column_id: cols[0].id } })).json()
    expect(task.title).toBe('Tache 1')
    expect(task.column_id).toBe(cols[0].id)

    // Move
    const moved = await (await request.put(`${API_URL}/tasks/${task.id}/move`, { headers: h, data: { column_id: cols[1].id, position: 0 } })).json()
    expect(moved.column_id).toBe(cols[1].id)

    // Tag
    const tag = await (await request.post(`${API_URL}/projects/${pid}/tags`, { headers: h, data: { name: 'Urgent', color: '#ef4444' } })).json()
    const tagged = await (await request.put(`${API_URL}/tasks/${task.id}/tags`, { headers: h, data: { tag_ids: [tag.id] } })).json()
    expect(tagged.tags.length).toBe(1)

    // Commentaire
    const comment = await (await request.post(`${API_URL}/tasks/${task.id}/comments`, { headers: h, data: { content: 'Hello' } })).json()
    expect(comment.content).toBe('Hello')

    // Get project tasks
    const ptasks = await (await request.get(`${API_URL}/projects/${pid}/tasks`, { headers: h })).json()
    expect(ptasks.length).toBe(1)
    expect(ptasks[0].tags.length).toBe(1)

    // Cleanup
    await request.delete(`${API_URL}/projects/${pid}`, { headers: h })
  })

  test('CRUD utilisateur', async ({ request }) => {
    const h = { Authorization: `Bearer ${token}` }

    // Create
    const u = await request.post(`${API_URL}/users`, { headers: h, data: { username: 'testpw', email: 'test@test.ch', password: 'test123', is_admin: false } })
    expect(u.status()).toBe(201)
    const user = await u.json()

    // Login as new user
    expect((await request.post(`${API_URL}/auth/login`, { data: { username: 'testpw', password: 'test123' } })).ok()).toBeTruthy()

    // List
    const list = await (await request.get(`${API_URL}/users`, { headers: h })).json()
    expect(list.length).toBeGreaterThanOrEqual(2)

    // Delete
    expect((await request.delete(`${API_URL}/users/${user.id}`, { headers: h })).status()).toBe(204)
  })
})
