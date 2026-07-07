@ui
Feature: Top 250 TV Shows - Fotos de Breaking Bad filtradas por actor
  Como usuario de IMDb quiero filtrar las fotos de Breaking Bad por
  Danny Trejo y abrir la 2da foto de la lista filtrada.

  Scenario: Ver la 2da foto de Danny Trejo en Breaking Bad
    Given que estoy en la página principal de IMDb
    When despliego el menú y navego a "Top 250 TV Shows"
    And hago click en "Breaking Bad"
    And navego a la sección "Photos"
    And filtro las fotos para mostrar solo las de "Danny Trejo"
    And hago click en la 2da foto de la lista filtrada
    Then debería visualizarse la foto seleccionada
