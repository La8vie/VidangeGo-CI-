// Tests E2E pour le suivi de mission avec Playwright
// Simulation complète du flow de suivi GPS

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MissionTrackingPage } from '../pages/MissionTrackingPage';

test.describe('Mission Tracking E2E', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let missionTrackingPage: MissionTrackingPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    missionTrackingPage = new MissionTrackingPage(page);
  });

  test('should track mission GPS updates in real-time', async ({ page }) => {
    // Se connecter comme mécanicien
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    
    // Vérifier qu'on est sur le dashboard
    await expect(page.locator('h1')).toContainText('Tableau de bord');
    
    // Naviguer vers les missions
    await page.click('text=Mes missions');
    await expect(page).toHaveURL(/\/missions/);
    
    // Sélectionner une mission active
    await page.click('text=Suivre en temps réel');
    
    // Vérifier qu'on est sur la page de suivi
    await expect(page).toHaveURL(/\/missions\/[^\/]+\/track/);
    
    // Vérifier les éléments de la page de suivi
    await expect(page.locator('.mission-info')).toBeVisible();
    await expect(page.locator('.gps-map')).toBeVisible();
    await expect(page.locator('.status-indicator')).toBeVisible();
    
    // Simuler une mise à jour GPS
    await page.evaluate(() => {
      // Simuler WebSocket ou polling
      window.dispatchEvent(new CustomEvent('gps-update', {
        detail: {
          latitude: 5.3456,
          longitude: -4.0123,
          timestamp: new Date().toISOString(),
          speed: 45,
          heading: 180
        }
      }));
    });
    
    // Vérifier que la position a été mise à jour
    await expect(page.locator('.gps-coordinate')).toContainText('5.3456, -4.0123');
    await expect(page.locator('.speed-indicator')).toContainText('45 km/h');
  });

  test('should handle mission status changes', async ({ page }) => {
    // Se connecter et naviguer vers une mission
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Vérifier le statut initial
    await expect(page.locator('.mission-status')).toContainText('En cours');
    
    // Simuler un changement de statut
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mission-status-update', {
        detail: {
          status: 'ARRIVED',
          timestamp: new Date().toISOString(),
          message: 'Mécanicien arrivé sur site'
        }
      }));
    });
    
    // Vérifier que le statut a été mis à jour
    await expect(page.locator('.mission-status')).toContainText('Arrivé');
    await expect(page.locator('.status-timestamp')).toBeVisible();
    await expect(page.locator('.status-message')).toContainText('Mécanicien arrivé sur site');
  });

  test('should handle connection issues gracefully', async ({ page }) => {
    // Se connecter et naviguer vers une mission
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Simuler une perte de connexion
    await page.route('**/api/missions/*/updates', route => route.abort());
    
    // Attendre que l'indicateur de connexion apparaisse
    await expect(page.locator('.connection-indicator')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.connection-status')).toContainText('Connexion perdue');
    
    // Vérifier que le bouton de reconnexion est présent
    await expect(page.locator('.reconnect-button')).toBeVisible();
    
    // Cliquer sur reconnexion
    await page.click('.reconnect-button');
    
    // Vérifier que la tentative de reconnexion est en cours
    await expect(page.locator('.reconnecting-indicator')).toBeVisible();
  });

  test('should display mission details correctly', async ({ page }) => {
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Vérifier les informations de la mission
    await expect(page.locator('.mission-title')).toBeVisible();
    await expect(page.locator('.client-info')).toBeVisible();
    await expect(page.locator('.vehicle-info')).toBeVisible();
    await expect(page.locator('.service-info')).toBeVisible();
    
    // Vérifier les détails du client
    await expect(page.locator('.client-name')).toBeVisible();
    await expect(page.locator('.client-address')).toBeVisible();
    await expect(page.locator('.client-phone')).toBeVisible();
    
    // Vérifier les détails du véhicule
    await expect(page.locator('.vehicle-brand')).toBeVisible();
    await expect(page.locator('.vehicle-model')).toBeVisible();
    await expect(page.locator('.vehicle-plate')).toBeVisible();
    
    // Vérifier les détails du service
    await expect(page.locator('.service-type')).toBeVisible();
    await expect(page.locator('.service-price')).toBeVisible();
    await expect(page.locator('.service-duration')).toBeVisible();
  });

  test('should handle emergency notifications', async ({ page }) => {
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Simuler une notification d'urgence
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('emergency-notification', {
        detail: {
          type: 'ACCIDENT',
          message: 'Accident détecté sur le site',
          timestamp: new Date().toISOString(),
          priority: 'HIGH'
        }
      }));
    });
    
    // Vérifier que la notification d'urgence s'affiche
    await expect(page.locator('.emergency-notification')).toBeVisible();
    await expect(page.locator('.emergency-notification')).toContainText('Accident détecté sur le site');
    await expect(page.locator('.emergency-notification')).toHaveClass(/high-priority/);
    
    // Vérifier les actions d'urgence
    await expect(page.locator('.emergency-actions')).toBeVisible();
    await expect(page.locator('.call-emergency')).toBeVisible();
    await expect(page.locator('.report-incident')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Simuler un appareil mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Vérifier que l'interface mobile est adaptée
    await expect(page.locator('.mobile-menu')).toBeVisible();
    await expect(page.locator('.mobile-map')).toBeVisible();
    await expect(page.locator('.mobile-controls')).toBeVisible();
    
    // Vérifier que la carte est responsive
    const mapContainer = page.locator('.gps-map');
    await expect(mapContainer).toBeVisible();
    const mapBoundingBox = await mapContainer.boundingBox();
    expect(mapBoundingBox.width).toBeGreaterThan(300);
    expect(mapBoundingBox.height).toBeGreaterThan(200);
  });

  test('should handle offline scenarios', async ({ page }) => {
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Simuler le mode hors ligne
    await page.context().setOffline(true);
    
    // Vérifier l'indicateur hors ligne
    await expect(page.locator('.offline-indicator')).toBeVisible();
    await expect(page.locator('.offline-message')).toContainText('Hors ligne');
    
    // Vérifier que les données sont accessibles en cache
    await expect(page.locator('.cached-mission-data')).toBeVisible();
    
    // Simuler la reconnexion
    await page.context().setOffline(false);
    
    // Vérifier que l'indicateur hors ligne disparaît
    await expect(page.locator('.offline-indicator')).not.toBeVisible();
    await expect(page.locator('.sync-indicator')).toBeVisible();
  });

  test('should track time correctly', async ({ page }) => {
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Enregistrer l'heure de début
    const startTime = new Date();
    
    // Attendre quelques secondes
    await page.waitForTimeout(3000);
    
    // Vérifier que le temps écoulé est affiché
    const timeElapsed = page.locator('.time-elapsed');
    await expect(timeElapsed).toBeVisible();
    
    // Vérifier que le temps est mis à jour chaque seconde
    const timeText = await timeElapsed.textContent();
    expect(timeText).toMatch(/\d+:\d+:\d+/); // Format HH:MM:SS
  });

  test('should handle map interactions', async ({ page }) => {
    await page.goto('/login');
    await loginPage.login('mechanicien@vidangego.ci', 'password123');
    await page.click('text=Mes missions');
    await page.click('text=Suivre en temps réel');
    
    // Attendre que la carte soit chargée
    await expect(page.locator('.map-container')).toBeVisible();
    
    // Tester le zoom
    await page.click('.zoom-in-button');
    await expect(page.locator('.map-zoom-level')).toContainText('Zoom: 12x');
    
    await page.click('.zoom-out-button');
    await expect(page.locator('.map-zoom-level')).toContainText('Zoom: 11x');
    
    // Tester le recentrage
    await page.click('.center-button');
    await expect(page.locator('.map-center-marker')).toBeVisible();
    
    // Tester le mode plein écran
    await page.click('.fullscreen-button');
    await expect(page.locator('.map-container')).toHaveClass(/fullscreen/);
  });
});
